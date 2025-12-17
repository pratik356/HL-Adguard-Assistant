export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: number;
  messages: Message[];
}

export interface UserSettings {
  hasCompletedSetup: boolean;
}

export interface GroundingMetadata {
  groundingChunks?: {
    web?: {
      uri: string;
      title: string;
    };
  }[];
}