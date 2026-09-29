import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, AlertCircle, RefreshCw, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose }) => {
  const { session, subjects, records, subjectStats, overallStats } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello ${session?.profile?.full_name?.split(' ')[0] || 'there'}! 👋 I'm your **AttendWise AI Advisor**.

I can calculate exact attendance margins, predict safe class skips, plan recovery schedules, and answer any questions about your current subjects.

How can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    'Which subjects need my immediate attention?',
    'How many classes can I safely miss?',
    'Give me a personalized attendance recovery strategy',
    'Summarize my overall attendance standing',
  ];

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!messageText) setInput('');
    setIsLoading(true);

    // Prepare strictly relevant student statistics
    const studentContext = {
      studentName: session?.profile?.full_name,
      college: session?.profile?.college_name,
      semester: session?.profile?.semester,
      overallStats: {
        overallPercentage: overallStats.overallPercentage,
        totalAttended: overallStats.totalAttended,
        totalConducted: overallStats.totalConducted,
        overallStatus: overallStats.overallStatus,
      },
      subjects: subjectStats.map((s) => ({
        name: s.subject.name,
        code: s.subject.code,
        faculty: s.subject.faculty_name,
        target: s.target,
        attended: s.attended,
        conducted: s.conducted,
        currentPercentage: s.percentage,
        status: s.status,
        classesCanMiss: s.classesCanMiss,
        classesNeededToReachTarget: s.classesNeeded,
      })),
    };

    try {
      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend.trim(),
          studentContext,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response from AI advisor');
      }

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.reply || "I'm sorry, I couldn't evaluate that request.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error('AI assistant client error:', err);
      // Fallback local smart response if Gemini API key is missing or offline
      let localFallback = '';
      if (textToSend.toLowerCase().includes('which subject') || textToSend.toLowerCase().includes('attention')) {
        const warningSubs = subjectStats.filter((s) => s.status !== 'Good');
        if (warningSubs.length === 0) {
          localFallback = `Great news! None of your subjects are currently in danger. All ${subjectStats.length} subjects are at or above their required attendance target.`;
        } else {
          localFallback = `Based on your academic records, here are the subjects that need your immediate attention:\n\n` +
            warningSubs.map((s) => `• **${s.subject.name} (${s.subject.code || 'Course'})**: Currently at **${s.percentage}%** (Target: ${s.target}%). ${s.marginText}`).join('\n\n') +
            `\n\nPrioritize attending these lectures without missing upcoming sessions!`;
        }
      } else if (textToSend.toLowerCase().includes('miss') || textToSend.toLowerCase().includes('skip')) {
        localFallback = `Here is your current class-skip breakdown:\n\n` +
          subjectStats.map((s) => `• **${s.subject.name}**: ${s.percentage >= s.target ? `You can miss up to **${s.classesCanMiss}** classes.` : `⚠️ Already below target (${s.percentage}% < ${s.target}%). You cannot miss any classes!`}`).join('\n') +
          `\n\n*Remember to keep a buffer for unexpected illnesses or exams.*`;
      } else {
        localFallback = `Here is your academic attendance summary:\n\n` +
          `• **Overall Attendance**: **${overallStats.overallPercentage}%** (${overallStats.totalAttended} attended out of ${overallStats.totalConducted} conducted classes).\n` +
          `• **Subjects in Good Standing**: ${overallStats.subjectsGood} of ${overallStats.totalSubjects}.\n` +
          `• **Subjects in Warning/Low**: ${overallStats.subjectsWarning + overallStats.subjectsLow}.\n\n` +
          `Maintain regular attendance in your upcoming lectures to secure exam eligibility!`;
      }

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: localFallback,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl h-[620px] max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col z-10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50/50 via-white to-violet-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  AttendWise AI Advisor
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Context-aware guidance for your exact subjects &amp; attendance targets
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close AI modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message history */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-xs shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 rounded-tl-xs border border-slate-200/60 dark:border-slate-700/60'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">
                    {m.content}
                  </div>
                  <span
                    className={`block mt-1.5 text-[10px] ${
                      isUser ? 'text-indigo-200 text-right' : 'text-slate-400'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 items-center text-xs text-slate-400 italic">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/80 text-white flex items-center justify-center shrink-0">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <span className="animate-pulse">Analyzing your attendance data and calculating advice...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompt chips */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 overflow-x-auto flex gap-2 no-scrollbar">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              disabled={isLoading}
              className="text-[11px] whitespace-nowrap px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-600 dark:text-slate-300 font-medium transition-colors shrink-0 disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input box */}
        <div className="p-3 sm:p-4 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your classes, limits or recovery..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 transition-colors shrink-0 shadow-xs"
              aria-label="Send query"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
