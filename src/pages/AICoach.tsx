import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, HelpCircle } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { aiService, ChatMessage } from '../services/ai';

export const AICoach: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      content: "Hello! I am your CarbonMind AI sustainability coach. Ask me questions about carbon offsets, EV charging options, diet footprints, or smart utility choices."
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    setInputValue('');
    setLoading(true);

    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const response = await aiService.sendMessageToCoach(text, messages);
      setMessages((prev) => [...prev, response]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'model', content: 'Connection timed out. Please try again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const prompts = [
    'How do I offset gas heating emissions?',
    'What is the footprint difference of EV vs hybrid?',
    'Suggest low carbon plant-based diet ideas',
    'Explain verified carbon token rewards'
  ];

  return (
    <div className="space-y-8 text-left animate-in fade-in duration-300">
      <SectionHeader
        title="AI Footprint Coach"
        description="Interact with Gemini models to construct custom footprints schedules and reduction paths."
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Chat box */}
        <div className="lg:col-span-3">
          <Card variant="glass" className="h-[60vh] min-h-[450px] flex flex-col p-4">
            {/* Messages box */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 max-w-[85%] font-sans text-xs sm:text-sm leading-relaxed ${
                    msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl flex items-center justify-center shrink-0 h-9.5 w-9.5 ${
                    msg.role === 'user'
                      ? 'bg-primary-500 text-white'
                      : 'bg-slate-100 dark:bg-zinc-800 text-primary-500'
                  }`}>
                    {msg.role === 'user' ? <User className="h-4.5 w-4.5" /> : <Bot className="h-4.5 w-4.5" />}
                  </div>

                  <div className={`p-4 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-primary-500/10 text-slate-800 dark:text-slate-150 border border-primary-500/10'
                      : 'bg-slate-50 dark:bg-zinc-900/50 text-slate-700 dark:text-zinc-300 border border-slate-100 dark:border-zinc-800'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 max-w-[80%] text-sm mr-auto animate-pulse">
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-primary-500 flex items-center justify-center h-9.5 w-9.5">
                    <Bot className="h-4.5 w-4.5" />
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 text-slate-400 border border-slate-100 dark:border-zinc-800 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-500 animate-spin" />
                    AI Coach is processing footprint metrics...
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            {/* Input field */}
            <div className="pt-3 border-t border-slate-100 dark:border-zinc-900 flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend(inputValue)}
                placeholder="Ask your Coach about footprint saving actions..."
                className="w-full px-4 py-3 bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm text-slate-850 dark:text-slate-200"
              />
              <Button onClick={() => handleSend(inputValue)} disabled={loading} className="px-4.5">
                <Send className="h-4.5 w-4.5" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Suggestion Sidebar */}
        <div className="space-y-5">
          <Card variant="glass" className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100 flex items-center gap-1.5 font-sans">
              <HelpCircle className="h-4.5 w-4.5 text-primary-500" />
              Quick Suggestions
            </h3>
            <div className="flex flex-col gap-2.5">
              {prompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p)}
                  className="w-full text-left p-3 rounded-xl bg-slate-50/50 dark:bg-zinc-900/30 border border-slate-100 dark:border-zinc-850 text-xs font-semibold text-slate-500 dark:text-zinc-450 hover:border-primary-500/30 hover:text-slate-800 dark:hover:text-slate-250 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default AICoach;
