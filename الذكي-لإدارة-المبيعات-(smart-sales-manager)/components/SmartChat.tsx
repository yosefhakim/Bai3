
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, Camera, X, Zap, CheckCircle2 } from 'lucide-react';
import { processNaturalLanguageCommand, identifyProductFromImage } from '../services/geminiService';
import { dbService } from '../services/db';
import { Product, Customer } from '../types';

interface Message {
  role: 'ai' | 'user';
  text: string;
  image?: string;
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
      text: 'مرحباً بك في "البائع الذكي" 🚀. أنا هنا لمساعدتك في إدارة حساباتك.\n\n💡 جرب ميزة "امسك للبوت" بالضغط على الكاميرا لتصوير منتج والتعرف عليه فوراً!' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const startCamera = async () => {
    try {
      setIsCameraOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      setIsCameraOpen(false);
      alert("لا يمكن الوصول للكاميرا");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);
    
    const base64Image = canvasRef.current.toDataURL('image/jpeg', 0.8).split(',')[1];
    const displayImage = canvasRef.current.toDataURL('image/jpeg');

    stopCamera();
    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', text: 'ما هذا المنتج؟', image: displayImage }]);

    try {
      const result = await identifyProductFromImage(base64Image, products);
      setMessages(prev => [...prev, { role: 'ai', text: result.message, action: result }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: 'عذراً، حدث خطأ أثناء التعرف على الصورة.' }]);
    } finally {
      setIsLoading(false);
    }
  };

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
          // Attempt to find product from context payload or search by name
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
            <p className="text-xs text-indigo-200 font-medium">نظامك المحاسبي المتكامل</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-xs font-bold opacity-80 uppercase tracking-widest">Live Mode</span>
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
                  {msg.image && <img src={msg.image} className="w-full max-w-sm rounded-2xl mb-4 border-2 border-white shadow-sm" alt="Captured" />}
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

      {/* Camera Overlay */}
      {isCameraOpen && (
        <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-6 backdrop-blur-lg">
          <div className="relative w-full max-w-lg aspect-[3/4] rounded-[2rem] overflow-hidden border-4 border-white/20 shadow-2xl">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute inset-0 border-[2px] border-indigo-400/50 rounded-[2rem] animate-pulse"></div>
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
          </div>
          <div className="mt-10 flex gap-6">
            <button onClick={captureImage} className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all">
              <div className="w-16 h-16 rounded-full border-4 border-slate-900 flex items-center justify-center">
                <div className="w-12 h-12 bg-indigo-600 rounded-full"></div>
              </div>
            </button>
            <button onClick={stopCamera} className="w-20 h-20 bg-red-500 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-red-600">
              <X size={32} />
            </button>
          </div>
          <p className="mt-6 text-white/70 font-bold tracking-widest uppercase text-sm">امسك المنتج أمام الكاميرا</p>
        </div>
      )}

      {/* Input Area */}
      <div className="p-8 bg-white border-t border-slate-100">
        <div className="relative flex items-center gap-4 max-w-5xl mx-auto">
          <button 
            onClick={startCamera}
            className="p-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all group"
            title="امسك للبوت"
          >
            <Camera size={24} className="group-hover:scale-110 transition-transform" />
          </button>
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
      
      <canvas ref={canvasRef} className="hidden" />
      
      <style>{`
        @keyframes scan {
          0%, 100% { top: 0%; }
          50% { top: 100%; }
        }
      `}</style>
    </div>
  );
};

export default SmartChat;
