import React from 'react';
import { Conversation } from '../types';
import { MessageSquare, Trash2, X } from 'lucide-react';

interface ChatHistoryProps {
  conversations: Conversation[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
  currentId?: string;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ 
  conversations, 
  onSelect, 
  onDelete,
  isOpen, 
  onClose,
  currentId
}) => {
  return (
    <div 
      className={`fixed inset-y-0 left-0 w-80 bg-white/95 backdrop-blur-xl shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          History
        </h2>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="overflow-y-auto h-[calc(100vh-80px)] p-4 space-y-2">
        {conversations.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">
            <p>No saved conversations found.</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <div 
              key={conv.id}
              className={`group flex items-center justify-between p-4 rounded-xl transition-all cursor-pointer border ${
                currentId === conv.id 
                  ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                  : 'hover:bg-gray-50 border-transparent hover:border-gray-100'
              }`}
              onClick={() => onSelect(conv.id)}
            >
              <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-semibold truncate ${currentId === conv.id ? 'text-indigo-700' : 'text-gray-700'}`}>
                  {conv.title || 'Untitled Conversation'}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(conv.created_at).toLocaleDateString()} • {new Date(conv.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(conv.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatHistory;