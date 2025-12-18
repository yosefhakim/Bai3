
import React, { useState, useEffect, useCallback } from 'react';
import { dbService } from './services/db';
import { AppView, Product, Customer, Sale, Expense } from './types';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import SalesManager from './components/SalesManager';
import CustomerManager from './components/CustomerManager';
import ExpenseManager from './components/ExpenseManager';
import MarketAnalytics from './components/MarketAnalytics';
import LandingPage from './components/LandingPage';
import { LayoutDashboard, Package, ShoppingCart, Users, LineChart, Menu, X, Receipt, ShieldCheck, Wifi, WifiOff } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('dashboard');
  const [dbReady, setDbReady] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [p, c, s, e] = await Promise.all([
        dbService.getAll<Product>('products'),
        dbService.getAll<Customer>('customers'),
        dbService.getAll<Sale>('sales'),
        dbService.getAll<Expense>('expenses')
      ]);
      setProducts(p);
      setCustomers(c);
      setSales(s);
      setExpenses(e);
    } catch (err) {
      console.error("Error loading data:", err);
    }
  }, []);

  useEffect(() => {
    dbService.init().then(() => {
      setDbReady(true);
      loadData();
    });
  }, [loadData]);

  if (showLanding) {
    return <LandingPage onFinished={() => setShowLanding(false)} />;
  }

  if (!dbReady) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-xl font-medium font-tajawal text-slate-400">تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (view) {
      case 'dashboard': return <Dashboard products={products} sales={sales} customers={customers} expenses={expenses} />;
      case 'inventory': return <Inventory products={products} onUpdate={loadData} />;
      case 'sales': return <SalesManager products={products} customers={customers} sales={sales} onUpdate={loadData} />;
      case 'customers': return <CustomerManager customers={customers} onUpdate={loadData} />;
      case 'expenses': return <ExpenseManager expenses={expenses} onUpdate={loadData} />;
      case 'analytics': return <MarketAnalytics products={products} />;
      default: return <Dashboard products={products} sales={sales} customers={customers} expenses={expenses} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-tajawal">
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`${sidebarOpen ? 'w-72' : 'w-0 overflow-hidden'} transition-all duration-300 bg-slate-900 h-full fixed md:relative z-40 border-l border-slate-800 flex flex-col`}>
        <div className="p-8 flex-1 flex flex-col">
          <h1 className="text-2xl font-black text-indigo-400 mb-10 flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-[0_0_15px_rgba(79,70,229,0.4)]">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            البائع الذكي
          </h1>
          <nav className="space-y-2 flex-1">
            <SidebarItem active={view === 'dashboard'} onClick={() => setView('dashboard')} icon={<LayoutDashboard />} label="لوحة التحكم" />
            <SidebarItem active={view === 'inventory'} onClick={() => setView('inventory')} icon={<Package />} label="المخزون" />
            <SidebarItem active={view === 'sales'} onClick={() => setView('sales')} icon={<ShoppingCart />} label="نقطة البيع" />
            <SidebarItem active={view === 'expenses'} onClick={() => setView('expenses')} icon={<Receipt />} label="المصروفات" />
            <SidebarItem active={view === 'customers'} onClick={() => setView('customers')} icon={<Users />} label="العملاء" />
            <SidebarItem active={view === 'analytics'} onClick={() => setView('analytics')} icon={<LineChart />} label="تحليلات السوق" />
          </nav>
          
          <div className="mt-auto space-y-6">
             <div className="bg-slate-800/50 p-5 rounded-[1.5rem] border border-slate-700/50">
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-2 font-black">حالة الاتصال</p>
                <div className={`flex items-center gap-2 font-bold text-sm transition-colors ${isOnline ? 'text-emerald-400' : 'text-red-400'}`}>
                  <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                  {isOnline ? 'متصل بالإنترنت' : 'يعمل بدون إنترنت (أوفلاين)'}
                  {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
                </div>
             </div>

             {/* JOX Branding with Soft Neon */}
             <div className="pt-4 border-t border-slate-800 flex flex-col items-center">
                <div className="group relative cursor-default">
                  <div className="absolute -inset-1 bg-indigo-500 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                  <span className="relative text-3xl font-black italic tracking-tighter text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.6)] font-serif">
                    JOX
                  </span>
                </div>
                <p className="text-[9px] text-slate-600 mt-2 font-bold uppercase tracking-[0.3em]">
                  Premium AI Solutions
                </p>
                <p className="text-[8px] text-slate-700 mt-1 font-medium">
                  © 2024 جميع الحقوق محفوظة
                </p>
             </div>
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto p-4 md:p-10 w-full animate-in fade-in duration-700">
        {renderView()}
      </main>
    </div>
  );
};

const SidebarItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
      active 
        ? 'bg-indigo-600 text-white shadow-[0_10px_20px_-5px_rgba(79,70,229,0.3)] scale-[1.02]' 
        : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
    }`}
  >
    {React.cloneElement(icon as React.ReactElement, { size: 22, strokeWidth: active ? 2.5 : 2 })}
    <span className="font-bold text-base">{label}</span>
  </button>
);

export default App;
