import { createClient } from '@supabase/supabase-js';
import { Conversation } from '../types';

// Environment variables exposed via vite.config.ts define block
// Environment variables exposed via vite.config.ts define block or import.meta.env
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const hasSupabase = !!(SUPABASE_URL && SUPABASE_KEY);

const supabase = hasSupabase
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export const checkPassword = async (password: string): Promise<boolean> => {
  if (!hasSupabase || !supabase) {
    // Silent fail or minimal error
    return false;
  }

  try {
    const inputHash = await sha256(password.trim());
    // Removed debug logs

    // Fetch the stored hash from the database with a 5-second timeout
    const fetchPromise = supabase
      .from('app_config')
      .select('value')
      .eq('key', 'admin_password_hash')
      .single();

    const timeoutPromise = new Promise<{ data: null, error: any }>((_, reject) =>
      setTimeout(() => reject(new Error('Supabase request timed out after 5s')), 5000)
    );

    let dbResult: any = {};
    try {
      dbResult = await Promise.race([fetchPromise, timeoutPromise]);
    } catch (err) {
      dbResult = { error: err };
    }

    const { data, error } = dbResult;

    if (error) {
      // Fallback: If DB fails/times out, we can TEMPORARILY check hardcoded hash to let user in
      const VALID_HASH = '8fb7cbe969c0c8693799d3f18daa42364b70e148d3cf37164355904ed23fe47b';
      if (inputHash === VALID_HASH) {
        return true;
      }
      return false;
    }

    if (!data) {
      return false;
    }

    // Secure comparison
    return data.value === inputHash;
  } catch (e) {
    return false;
  }
};

export const saveConversation = async (conversation: Conversation): Promise<void> => {
  let savedToCloud = false;

  if (hasSupabase && supabase) {
    try {
      const { error } = await supabase
        .from('conversations')
        .upsert({
          id: conversation.id,
          title: conversation.title,
          content: conversation, // Store full JSON
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error("Supabase save error:", error);
      } else {
        savedToCloud = true;
      }
    } catch (e) {
      console.error("Supabase save exception", e);
    }
  }

  // Local storage fallback (always save locally if cloud failed OR if cloud not configured)
  if (!savedToCloud) {
    console.warn("Saving to local storage (Cloud failed or not configured).");
    const existing = localStorage.getItem('conversations');
    const conversations: Conversation[] = existing ? JSON.parse(existing) : [];
    const index = conversations.findIndex(c => c.id === conversation.id);

    if (index >= 0) {
      conversations[index] = conversation;
    } else {
      conversations.push(conversation);
    }
    localStorage.setItem('conversations', JSON.stringify(conversations));
  }
};

export const getHistory = async (): Promise<Conversation[]> => {
  let cloudHistory: Conversation[] | null = null;

  if (hasSupabase && supabase) {
    try {
      // Short timeout for history fetch to keep UI snappy
      const fetchPromise = supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false });

      const timeoutPromise = new Promise<{ data: null, error: any }>((_, reject) =>
        setTimeout(() => reject(new Error('History fetch timeout')), 3000)
      );

      let dbResult: any = {};
      try {
        dbResult = await Promise.race([fetchPromise, timeoutPromise]);
      } catch (err) {
        dbResult = { error: err };
      }

      const { data, error } = dbResult;

      if (data && !error) {
        cloudHistory = data.map((row: any) => row.content as Conversation);
      } else {
        console.warn("Supabase history fetch failed or timed out:", error);
      }
    } catch (e) {
      console.warn("Supabase fetch exception", e);
    }
  }

  // If cloud worked, return it.
  if (cloudHistory) return cloudHistory;

  // Fallback to local storage
  console.log("Loading history from local storage fallback.");
  const existing = localStorage.getItem('conversations');
  return existing ? JSON.parse(existing).sort((a: Conversation, b: Conversation) => b.created_at - a.created_at) : [];
};

export const deleteConversation = async (id: string): Promise<void> => {
  if (hasSupabase && supabase) {
    await supabase.from('conversations').delete().eq('id', id);
  }

  // Always clean local storage too just in case
  const existing = localStorage.getItem('conversations');
  if (existing) {
    const conversations: Conversation[] = JSON.parse(existing);
    const filtered = conversations.filter(c => c.id !== id);
    localStorage.setItem('conversations', JSON.stringify(filtered));
  }
}