import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Landing from './components/Landing';
import ChatWidget from './components/ChatWidget';
import ChatHistory from './components/ChatHistory';
import { getHistory, deleteConversation } from './services/supabaseService';
import { Conversation } from './types';
import { Sun, Moon } from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check login session & initialize theme
  useEffect(() => {
    const session = sessionStorage.getItem('adguard_session');
    if (session === 'true') {
      setIsAuthenticated(true);
      fetchHistory();
    }
  }, []);

  // Update HTML class for dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const fetchHistory = async () => {
    const history = await getHistory();
    setConversations(history);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('adguard_session', 'true');
    fetchHistory();
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adguard_session');
    setActiveConversation(null);
  }

  const handleSelectHistory = (id: string) => {
    const selected = conversations.find(c => c.id === id);
    if (selected) {
      setActiveConversation(selected);
      setHistoryOpen(false);
    }
  };

  const handleDeleteHistory = async (id: string) => {
    await deleteConversation(id);
    await fetchHistory();
    if (activeConversation?.id === id) {
      setActiveConversation(null);
    }
  }

  const handleConversationUpdate = () => {
    fetchHistory();
  }

  const chatWidgetRef = React.useRef<any>(null);

  const handleStartChat = () => {
    // Open chat in full screen mode (true)
    if (chatWidgetRef.current) {
      chatWidgetRef.current.open(true);
    }
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLogin} />;
  }

  return (
    <div className="relative overflow-hidden min-h-screen transition-colors duration-300 dark:bg-gray-900">
      {/* Simple Top Bar for authenticated users */}
      <div className="fixed top-0 left-0 right-0 z-30 px-6 py-4 flex justify-end items-center pointer-events-none gap-3">
        <button
          onClick={toggleTheme}
          className="pointer-events-auto p-2 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-all shadow-sm"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <button
          onClick={handleLogout}
          className="pointer-events-auto text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white/50 dark:bg-gray-800/50 backdrop-blur px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 transition-colors shadow-sm"
        >
          Log Out
        </button>
      </div>

      <Landing onStartChat={handleStartChat} />

      <ChatHistory
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        conversations={conversations}
        onSelect={handleSelectHistory}
        onDelete={handleDeleteHistory}
        currentId={activeConversation?.id}
      />

      <ChatWidget
        ref={chatWidgetRef}
        onHistoryClick={() => setHistoryOpen(true)}
        loadedConversation={activeConversation}
        onConversationUpdate={handleConversationUpdate}
      />
    </div>
  );
};

export default App;