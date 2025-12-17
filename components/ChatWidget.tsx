import React, { useState, useRef, useEffect } from 'react';
import { Message, Conversation } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import { saveConversation } from '../services/supabaseService';
import { Send, Minimize2, Maximize2, X, Sparkles, Search, Loader2, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatWidgetProps {
  onHistoryClick: () => void;
  loadedConversation?: Conversation | null;
  onConversationUpdate: () => void; // Trigger parent to reload history
}

export interface ChatWidgetHandle {
  open: (fullScreen?: boolean) => void;
}

const ChatWidget = React.forwardRef<ChatWidgetHandle, ChatWidgetProps>(({ onHistoryClick, loadedConversation, onConversationUpdate }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const [conversationId, setConversationId] = useState<string>(crypto.randomUUID());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  React.useImperativeHandle(ref, () => ({
    open: (fullScreen = false) => {
      setIsOpen(true);
      setIsMinimized(false);
      if (fullScreen) {
        setIsFullScreen(true);
      }
    }
  }));

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loadedConversation) {
      setMessages(loadedConversation.messages);
      setConversationId(loadedConversation.id);
      setIsOpen(true);
      setIsMinimized(false);
    }
  }, [loadedConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isFullScreen]);

  const handleCopy = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const { text, sources } = await sendMessageToGemini(messages, input, useSearch);

      let finalContent = text;
      if (sources && sources.length > 0) {
        finalContent += "\n\n**Sources:**\n" + sources.map(s => `- [${s.title}](${s.uri})`).join('\n');
      }

      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: 'model',
        content: finalContent,
        timestamp: Date.now()
      };

      const updatedMessages = [...newMessages, aiMsg];
      setMessages(updatedMessages);

      // Save to "DB"
      const conversation: Conversation = {
        id: conversationId,
        title: messages.length === 0 ? userMsg.content.slice(0, 30) + '...' : (loadedConversation?.title || userMsg.content.slice(0, 30)),
        created_at: loadedConversation ? loadedConversation.created_at : Date.now(),
        messages: updatedMessages
      };

      await saveConversation(conversation);
      onConversationUpdate();

    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: 'model',
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: Date.now()
      };
      setMessages([...newMessages, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const resetChat = () => {
    setMessages([]);
    setConversationId(crypto.randomUUID());
    setIsOpen(false);
    setIsFullScreen(false);
  };

  // Lock body scroll when chat is open on mobile OR in full screen
  useEffect(() => {
    if ((isOpen && !isMinimized && window.innerWidth < 640) || isFullScreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, isMinimized, isFullScreen]);

  // Render logic
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-105 transition-transform duration-300 z-40 group"
      >
        <img src="/logo.svg" alt="Logo" className="w-8 h-8 group-hover:rotate-12 transition-transform drop-shadow-md" />
      </button>
    );
  }

  return (
    <div
      className={`fixed z-40 transition-all duration-300 shadow-2xl overflow-hidden flex flex-col
        ${isFullScreen
          ? 'inset-0 w-full h-full rounded-none'
          : 'bottom-4 right-4 w-[90vw] sm:w-[400px] h-[80vh] sm:max-h-[650px] rounded-2xl'
        }
        bg-white dark:bg-black/95 backdrop-blur-xl border border-gray-100 dark:border-gray-800
        ${isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-10 pointer-events-none'}
        `}
    >
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/90 backdrop-blur-md p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 h-16">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center border border-white/20">
            <img src="/logo.svg" alt="App Logo" className="w-5 h-5 drop-shadow-sm" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 dark:text-white text-sm">HL Adguard Assistant</h3>
            <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Online
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {!isMinimized && (
            <>
              <button
                onClick={onHistoryClick}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500 dark:text-gray-300 transition-colors mr-1"
                title="View History"
              >
                <span className="text-xs font-semibold">History</span>
              </button>

              {/* Full Screen Toggle */}
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="hidden sm:block p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500 dark:text-gray-300 transition-colors mr-1"
                title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
              >
                {isFullScreen ? <Minimize2 className="w-4 h-4 rotate-45" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </>
          )}

          <button
            onClick={() => {
              if (isFullScreen) setIsFullScreen(false);
              setIsMinimized(!isMinimized);
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500 dark:text-gray-300 transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>

          {!isMinimized && (
            <button
              onClick={resetChat}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 rounded-full text-gray-400 dark:text-gray-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Chat Body */}
      {!isMinimized && (
        <div className="flex flex-col h-[calc(100%-64px)] w-full">
          <div className={`flex-1 overflow-y-auto overscroll-y-contain p-4 space-y-4 bg-gradient-to-b from-white/50 dark:from-black/50 to-indigo-50/30 dark:to-gray-900/30 scrollbar-hide ${isFullScreen ? 'flex flex-col items-center' : ''}`}>
            <div className={`w-full ${isFullScreen ? 'max-w-3xl space-y-4' : 'space-y-4'}`}>
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 text-gray-400 dark:text-gray-300 space-y-3 min-h-[50vh]">
                  <img src="/logo.svg" alt="HL AdGuard" className="w-16 h-16 opacity-80" />
                  <p className="text-sm font-medium">Hi! I'm your Google Ads compliance assistant.</p>
                  <p className="text-xs opacity-80">Ask me to review ad copy or explain policies.</p>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${msg.role === 'user'
                        ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-tr-none'
                        : 'bg-white dark:bg-gray-800/80 text-gray-700 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-tl-none'
                        }`}
                    >
                      <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ul:list-disc prose-ul:pl-4 prose-li:my-0.5 dark:prose-invert dark:prose-p:text-gray-100 dark:prose-li:text-gray-100">
                        <ReactMarkdown>
                          {msg.role === 'model'
                            ? msg.content.replace(/([^\n])\s*([•-])\s+/g, '$1\n\n$2 ')
                            : msg.content
                          }
                        </ReactMarkdown>
                      </div>
                    </div>

                    {msg.role === 'model' && (
                      <div className="flex mt-1 ml-1 transition-opacity">
                        <button
                          onClick={() => handleCopy(msg.content, msg.id)}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-black dark:text-white bg-gray-100 dark:bg-gray-700/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors shadow-sm"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-green-500" />
                              <span className="text-green-600 dark:text-green-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start w-full">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">Analyzing compliance...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Footer / Input */}
          <div className={`w-full p-4 bg-white/90 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 ${isFullScreen ? 'flex justify-center' : ''}`}>
            <div className={`w-full ${isFullScreen ? 'max-w-3xl' : ''}`}>
              {/* Search Toggle */}
              <div className="flex items-center gap-2 mb-2 px-1">
                <label className="flex items-center cursor-pointer gap-2 group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={useSearch}
                      onChange={(e) => setUseSearch(e.target.checked)}
                    />
                    <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </div>
                  <span className={`text-xs font-medium flex items-center gap-1 ${useSearch ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-400'}`}>
                    <Search className="w-3 h-3" />
                    Search Web for Latest Policies
                  </span>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Paste ad copy or ask a question..."
                  className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white text-base sm:text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-200"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default ChatWidget;