
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, X, Zap, CheckCircle2 } from 'lucide-react';
import { processNaturalLanguageCommand } from '../services/geminiService';
import { dbService } from '../services/db';
import { Product, Customer } from '../types';

interface Message {
  role: 'ai' | 'user';
  text: string;
  action?: any;
}

interface Props {
  products: Product[];
  customers: Customer[];
  onUpdate: () => void;
}

const SmartChat: React.FC<Props> = ({ products, customers, onUpdate }) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'ai', 
      text: 'مرحباً بك في "البائع الذكي" 🚀. أنا هنا لمساعدتك في إدارة حساباتك.\n\n💡 يمكنك كتابة أوامر مثل "بعت شاحن لأحمد" أو "سجل مصروف إيجار 500 جنيها" وسأقوم بتنفيذها فوراً!' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleAction = async (action: any) => {
    try {
      switch (action.type) {
        case 'ADD_PRODUCT':
          await dbService.add('products', {
            ...action.payload,
            barcode: Math.random().toString(36).substring(7).toUpperCase(),
            cost: action.payload.cost || (action.payload.price * 0.7)
          });
          break;
        case 'ADD_EXPENSE':
          await dbService.add('expenses', {
            description: action.payload.description,
            amount: action.payload.amount,
            category: action.payload.category || 'عام',
            date: new Date().toISOString().split('T')[0]
          });
          break;
        case 'CREATE_SALE':
          let targetProduct = products.find(p => p.name === action.payload.items[0].productName);
          if (!targetProduct) {
             targetProduct = products.find(prod => prod.name.toLowerCase().includes(action.payload.items[0].productName.toLowerCase()));
          }

          if (targetProduct) {
            await dbService.recordSale({
              date: new Date().toISOString(),
              total: (action.payload.items[0].quantity || 1) * targetProduct.price,
              items: [{ 
                productId: targetProduct.id!, 
                productName: targetProduct.name, 
                quantity: action.payload.items[0].quantity || 1, 
                unitPrice: targetProduct.price 
              }]
            });
          }
          break;
      }
      onUpdate();
      setMessages(prev => [...prev, { role: 'ai', text: '✅ تم تنفيذ العملية بنجاح وتحديث السجلات.' }]);
    } catch (e) {
      console.error("Action error:", e);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const result = await processNaturalLanguageCommand(userText, { products, customers });
      setMessages(prev => [...prev, { role: 'ai', text: result.message, action: result.type !== 'UNKNOWN' ? result : undefined }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: 'حدث خطأ في معالجة طلبك.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden relative">
      {/* Header */}
      <div className="p-6 bg-indigo-700 text-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md shadow-inner">
            <Zap size={28} className="text-amber-300" />
          </div>
          <div>
            <h2 className="font-black text-xl tracking-tight">البائع الذكي AI</h2>
            <p className="text-xs text-indigo-200 font-medium">مساعدك المحاسبي الشخصي</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-xs font-bold opacity-80 uppercase tracking-widest">Live Analysis</span>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/40">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
            <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-1 shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 border border-slate-100'}`}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className="space-y-3">
                <div className={`p-5 rounded-3xl ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-200' : 'bg-white text-slate-800 rounded-tl-none shadow-md border border-slate-50'}`}>
                  <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap">{msg.text}</p>
                </div>
                {msg.action && msg.action.type !== 'UNKNOWN' && (
                  <button 
                    onClick={() => handleAction(msg.action)}
                    className="flex items-center gap-2 px-6 py-2 bg-emerald-500 text-white rounded-2xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 animate-pulse"
                  >
                    <CheckCircle2 size={16} />
                    تأكيد وتنفيذ {msg.action.type}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-end pr-14">
             <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-50 flex items-center gap-3 text-slate-400">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                </div>
                <span className="text-xs font-bold text-indigo-600">البوت يقوم بالتحليل...</span>
             </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-8 bg-white border-t border-slate-100">
        <div className="relative flex items-center gap-4 max-w-5xl mx-auto">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="اطلب أي شيء مالي أو تجاري هنا..."
              className="w-full pr-6 pl-16 py-4 rounded-2xl bg-slate-100 border-none focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-400"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-900/20"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartChat;
