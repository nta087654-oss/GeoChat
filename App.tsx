import React, { useState, useEffect, useRef } from 'react';
import { Send, Map as MapIcon, Loader2, Navigation, AlertCircle } from 'lucide-react';
import { ChatMessage } from './components/ChatMessage';
import { sendMessageToGemini } from './services/geminiService';
import { Message, Role, Coordinates } from './types';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: Role.MODEL,
      text: "Hi! I'm GeoChat. I can help you find places, get directions, and explore the world using real-time Google Maps data. Where are we heading today?",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<Coordinates | undefined>();
  const [locationError, setLocationError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Request location on mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setLocationError(null);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationError("Could not access location. 'Nearby' searches may be less accurate.");
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    
    const newUserMsg: Message = {
      id: uuidv4(),
      role: Role.USER,
      text: userText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      const response = await sendMessageToGemini(messages, userText, location);
      
      const newBotMsg: Message = {
        id: uuidv4(),
        role: Role.MODEL,
        text: response.text,
        timestamp: Date.now(),
        groundingChunks: response.groundingChunks
      };

      setMessages(prev => [...prev, newBotMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: uuidv4(),
        role: Role.MODEL,
        text: "I'm sorry, I encountered an error while checking the map. Please try again.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-50 overflow-hidden">
      
      {/* Map Background Pattern (Visual effect since we don't use a real interactive map component key) */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
           }}>
      </div>

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 p-4 z-10 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <MapIcon className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">GeoChat</h1>
            <p className="text-xs text-slate-500">Powered by Gemini Maps Grounding</p>
          </div>
        </div>
        
        {/* Location Status */}
        <div className="flex items-center gap-2 text-xs">
          {location ? (
            <div className="flex items-center text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
              <Navigation className="w-3 h-3 mr-1" />
              <span className="font-medium">GPS Active</span>
            </div>
          ) : (
            <div className="flex items-center text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
               <AlertCircle className="w-3 h-3 mr-1" />
               <span>{locationError ? "No GPS" : "Locating..."}</span>
            </div>
          )}
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 z-10 scrollbar-hide">
        <div className="max-w-3xl mx-auto">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          
          {isLoading && (
            <div className="flex items-center gap-2 text-slate-400 text-sm ml-12 mb-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Checking maps...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="p-4 bg-white/90 backdrop-blur-md border-t border-slate-200 z-10">
        <div className="max-w-3xl mx-auto relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about places, directions, or local news..."
            className="w-full bg-slate-100 text-slate-800 rounded-2xl py-4 pl-5 pr-14 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all shadow-inner border border-transparent focus:border-blue-200"
            rows={1}
            style={{ minHeight: '60px' }}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-400 mt-2">
          Gemini may display inaccurate info, including about people, places, or facts.
        </p>
      </footer>
    </div>
  );
}

export default App;