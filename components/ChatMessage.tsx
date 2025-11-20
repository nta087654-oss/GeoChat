import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, Role, GroundingChunk, MapGroundingChunk, SearchGroundingChunk } from '../types';
import { Bot, User } from 'lucide-react';
import { MapCard } from './MapCard';
import { SearchCard } from './SearchCard';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  // Helper type guard
  const isMapChunk = (chunk: GroundingChunk): chunk is MapGroundingChunk => {
    return (chunk as MapGroundingChunk).maps !== undefined;
  };

  const isSearchChunk = (chunk: GroundingChunk): chunk is SearchGroundingChunk => {
    return (chunk as SearchGroundingChunk).web !== undefined;
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isUser ? 'bg-blue-600' : 'bg-emerald-600'}`}>
          {isUser ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
        </div>

        {/* Message Content */}
        <div className="flex flex-col items-start">
          <div className={`p-4 rounded-2xl shadow-sm ${
            isUser 
              ? 'bg-blue-600 text-white rounded-tr-none' 
              : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
          }`}>
            <div className={`prose prose-sm max-w-none ${isUser ? 'prose-invert' : ''}`}>
              <ReactMarkdown>{message.text}</ReactMarkdown>
            </div>
          </div>

          {/* Grounding Cards (Sources/Maps) */}
          {message.groundingChunks && message.groundingChunks.length > 0 && (
             <div className="mt-3 w-full grid grid-cols-1 gap-2 sm:grid-cols-2">
               {message.groundingChunks.map((chunk, index) => {
                  if (isMapChunk(chunk)) {
                    return <MapCard key={`map-${index}`} chunk={chunk} />;
                  } else if (isSearchChunk(chunk)) {
                    return <SearchCard key={`search-${index}`} chunk={chunk} />;
                  }
                  return null;
               })}
             </div>
          )}
          
          <span className="text-[10px] text-slate-400 mt-1 px-1">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};