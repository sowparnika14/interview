import React, { useState, useRef, useEffect } from 'react';
import { User, CoachMessage } from '../types';
import { askCoach } from '../services/api';
import { Sparkles, Send, Loader2, RotateCcw, Bot, User as UserIcon } from 'lucide-react';

interface CoachViewProps {
  currentUser: User | null;
}

export const CoachView: React.FC<CoachViewProps> = ({ currentUser }) => {
  const [messages, setMessages] = useState<CoachMessage[]>([
    {
      id: 'coach-intro',
      sender: 'coach',
      text: `Hello ${currentUser ? currentUser.name : 'there'}! I'm Coach Aria, your AI interview specialist. Whether you want to polish your STAR behavioral framework, refine system design trade-offs, or rehearse answering difficult interview questions, I'm here to guide you. What are you preparing for today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const quickPrompts = [
    "How do I answer 'Tell me about yourself' in under 90 seconds?",
    "Give me the exact STAR framework for leadership conflict.",
    "What are top questions to ask the interviewer at the end?",
    "How to explain trade-offs during system design loops?",
    "How do I politely negotiate a salary offer?"
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg: CoachMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const historyContext = messages.map(m => ({
        role: (m.sender === 'user' ? 'user' : 'coach') as 'user' | 'coach',
        text: m.text
      }));

      const reply = await askCoach(
        text,
        historyContext,
        currentUser?.role || 'Software Engineer',
        currentUser?.level || 'Senior'
      );

      const coachMsg: CoachMessage = {
        id: `coach-${Date.now()}`,
        sender: 'coach',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, coachMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: CoachMessage = {
        id: `err-${Date.now()}`,
        sender: 'coach',
        text: "I couldn't reach the coaching engine right now. Let me know which interview concept you'd like to practice!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'coach-reset',
        sender: 'coach',
        text: `Fresh slate! What interview challenge can we conquer next?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-12 animate-in fade-in duration-300">
      {/* Coach Header Banner */}
      <div className="bubble-glass rounded-3xl p-5 border border-white/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-400 via-indigo-400 to-teal-300 flex items-center justify-center text-white shadow-md shadow-sky-200">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-base text-slate-800">Coach Aria</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Online
              </span>
            </div>
            <p className="text-xs text-slate-500">Tailored advice for {currentUser?.level || 'Senior'} {currentUser?.role || 'Engineer'} interviews</p>
          </div>
        </div>

        <button
          onClick={handleClear}
          className="text-xs font-medium text-slate-400 hover:text-slate-600 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Chat</span>
        </button>
      </div>

      {/* Chat Messages Display Box */}
      <div className="bubble-glass rounded-3xl p-5 sm:p-6 border border-white/80 shadow-md min-h-[440px] max-h-[600px] overflow-y-auto space-y-4">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white text-xs shrink-0 shadow-xs mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-3xl text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-tr-xs shadow-md shadow-sky-200'
                    : 'bg-white/95 text-slate-800 border border-slate-200/80 rounded-tl-xs shadow-xs'
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>
                <div
                  className={`text-[10px] mt-1.5 font-medium ${
                    isUser ? 'text-sky-100 text-right' : 'text-slate-400'
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>

              {isUser && (
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${currentUser?.avatarColor || 'from-sky-400 to-indigo-500'} flex items-center justify-center text-white text-xs shrink-0 shadow-xs mt-1`}>
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white text-xs shrink-0 shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-3xl bg-white text-slate-500 border border-slate-200/80 rounded-tl-xs text-xs flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-500" />
              <span>Coach Aria is analyzing...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Bubbles */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 text-xs no-scrollbar">
        <span className="text-[11px] font-semibold text-slate-400 shrink-0">Try asking:</span>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            disabled={isLoading}
            className="shrink-0 px-3 py-1.5 rounded-full bg-white/90 hover:bg-sky-50 text-slate-600 hover:text-sky-700 border border-slate-200/80 text-xs font-medium shadow-xs transition-all disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Message Input Box */}
      <div className="bubble-glass rounded-3xl p-2.5 sm:p-3 border border-white/80 shadow-md flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Ask Coach Aria anything about mock interviews, behavioral questions, frameworks..."
          className="flex-1 px-4 py-2.5 rounded-2xl bg-white/90 border border-slate-200/80 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />

        <button
          onClick={() => handleSendMessage()}
          disabled={isLoading || !inputText.trim()}
          className="p-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white shadow-md shadow-sky-200 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
