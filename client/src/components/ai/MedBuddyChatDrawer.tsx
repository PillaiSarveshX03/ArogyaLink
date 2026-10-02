'use client';

import React, { useState } from 'react';
import { X, Send, Sparkles, AlertCircle, Bot, User, ShieldAlert } from 'lucide-react';
import { useApp } from '@/lib/store';
import { apiClient } from '@/lib/api';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  disclaimer?: string;
  time: string;
}

const FormattedMessage: React.FC<{ text: string }> = ({ text }) => {
  const renderInline = (str: string) => {
    // Regex splits by **bold** or *italic*
    const parts = str.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <span key={i} className="italic text-slate-600">
            {part.slice(1, -1)}
          </span>
        );
      }
      return part;
    });
  };

  const lines = text.split('\n');

  return (
    <div className="space-y-1.5 text-xs leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // Bullet point lines starting with *, -, or •
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
          const content = trimmed.replace(/^[\*\-•]\s*/, '');
          return (
            <div key={idx} className="flex items-start gap-1.5 ml-1">
              <span className="text-sky-600 font-bold shrink-0 mt-0.5">•</span>
              <span className="flex-1">{renderInline(content)}</span>
            </div>
          );
        }

        return <p key={idx}>{renderInline(line)}</p>;
      })}
    </div>
  );
};

export const MedBuddyChatDrawer: React.FC = () => {
  const { isAssistantOpen, setAssistantOpen, courses, user } = useApp();

  if (!user) {
    return null;
  }
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! I'm your MedBuddy AI Assistant powered by Gemini 3.5. I can help explain medication instructions, meal requirements, precautions, and contraindications for your active prescriptions. How can I help you today?",
      disclaimer: "I cannot prescribe drugs, adjust dosages, or give diagnostic advice. Always consult your primary physician or pharmacist for clinical decisions.",
      time: 'Just now'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const suggestedQuestions = [
    "Why take Metformin after food?",
    "What are common side effects of Amlodipine?",
    "What should I do if I miss a morning dose?",
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || inputValue).trim();
    if (!textToSend || isTyping) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const activeMedNames = courses.map(c => c.medicineName);
      const res = await apiClient.queryAssistant(textToSend, { activeMeds: activeMedNames });

      const botMsg: Message = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: res.reply,
        disclaimer: res.disclaimer || "AI Assistant: Educational guidance only. Does not replace physician consultation.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `assistant-err-${Date.now()}`,
        sender: 'assistant',
        text: `Unable to reach the Gemini assistant service (${err.message || 'Network error'}). Please try again shortly.`,
        disclaimer: "In case of urgent medical concerns, call emergency services or your doctor.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isAssistantOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-sky-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                MedBuddy AI Assistant
                <span className="text-[10px] bg-gradient-to-r from-sky-600 to-indigo-600 text-white px-1.5 py-0.5 rounded font-semibold">
                  Gemini 3.5
                </span>
                <span className="text-[10px] bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded font-medium">Agentic Mode</span>
              </h2>
              <p className="text-xs text-slate-500">Contextual medication explanations</p>
            </div>
          </div>
          <button
            onClick={() => setAssistantOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clinical Guardrail Alert */}
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-start gap-2 text-xs text-amber-900">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-snug">
            <strong>Clinical Safety Rule:</strong> AI provides educational support only. It cannot prescribe, alter dosages, or override doctor orders.
          </p>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-sky-600 text-white rounded-tr-none'
                    : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
                }`}
              >
                {msg.sender === 'user' ? (
                  <p>{msg.text}</p>
                ) : (
                  <FormattedMessage text={msg.text} />
                )}
                {msg.disclaimer && (
                  <p className="mt-2 pt-2 border-t border-slate-200 text-[10px] text-slate-500 italic">
                    ⚠️ {msg.disclaimer}
                  </p>
                )}
                <span
                  className={`text-[9px] mt-1 block text-right ${
                    msg.sender === 'user' ? 'text-sky-200' : 'text-slate-400'
                  }`}
                >
                  {msg.time}
                </span>
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-500 italic py-2">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-sky-600" />
              MedBuddy (Gemini 3.5) is reasoning...
            </div>
          )}
        </div>

        {/* Suggested Quick Prompts */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50">
          <p className="text-[11px] font-semibold text-slate-500 mb-1.5">Common patient queries:</p>
          <div className="flex flex-wrap gap-1.5">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="text-[11px] bg-white border border-slate-200 hover:border-sky-300 text-slate-700 px-2.5 py-1 rounded-full hover:bg-sky-50/50 transition text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about side-effects, food timings..."
              className="flex-1 text-xs border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center transition"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
