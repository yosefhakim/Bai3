
import React, { useMemo } from 'react';
import { Product, Sale, Customer, Expense } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';
import { TrendingUp, Package, Users, DollarSign, Wallet, ArrowDownCircle } from 'lucide-react';

interface Props {
  products: Product[];
  sales: Sale[];
  customers: Customer[];
  expenses: Expense[];
}

const Dashboard: React.FC<Props> = ({ products, sales, customers, expenses }) => {
  const stats = useMemo(() => {
    const totalRevenue = sales.reduce((acc, sale) => acc + sale.total, 0);
    const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
    
    // Cost of Goods Sold (COGS)
    const totalCOGS = sales.reduce((acc, sale) => {
      return acc + sale.items.reduce((itemAcc, item) => {
        const product = products.find(p => p.id === item.productId);
        return itemAcc + (product ? product.cost * item.quantity : 0);
      }, 0);
    }, 0);

    const grossProfit = totalRevenue - totalCOGS;
    const netProfit = grossProfit - totalExpenses;

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      customerCount: customers.length,
    };
  }, [products, sales, expenses, customers]);

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => ({
      date: new Date(date).toLocaleDateString('ar-EG', { weekday: 'short' }),
      مبيعات: sales.filter(s => s.date.startsWith(date)).reduce((acc, s) => acc + s.total, 0),
      مصاريف: expenses.filter(e => e.date.startsWith(date)).reduce((acc, e) => acc + e.amount, 0),
    }));
  }, [sales, expenses]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-800">نظرة عامة على نشاطك</h2>
          <p className="text-slate-500">مرحباً بك في لوحة تحكم البائع الذكي</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="إجمالي الدخل" value={`${stats.totalRevenue.toLocaleString()} ج.م`} icon={<DollarSign />} color="indigo" />
        <StatCard title="إجمالي المصروفات" value={`${stats.totalExpenses.toLocaleString()} ج.م`} icon={<ArrowDownCircle />} color="red" />
        <StatCard title="صافي الربح" value={`${stats.netProfit.toLocaleString()} ج.م`} icon={<Wallet />} color="emerald" />
        <StatCard title="العملاء النشطون" value={stats.customerCount.toString()} icon={<Users />} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fixed Chart Container to solve Warning */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 min-h-[450px]">
          <h3 className="text-lg font-bold mb-8 flex items-center gap-2">
            <TrendingUp size={20} className="text-indigo-600" />
            الأداء المالي الأسبوعي
          </h3>
          <div className="h-[350px] w-full" style={{ minHeight: '350px' }}>
            <ResponsiveContainer width="100%" height="100%" minHeight={300}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="مبيعات" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={24} />
                <Bar dataKey="مصاريف" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Package size={20} className="text-amber-600" />
            حالة المخزون
          </h3>
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
             {products.slice(0, 8).map(p => (
               <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800">{p.name}</span>
                    <span className="text-xs text-slate-400 font-medium">{p.category}</span>
                  </div>
                  <div className={`px-3 py-1 rounded-lg font-black text-sm ${p.stock <= 5 ? 'bg-red-100 text-red-600' : 'bg-white text-slate-600 border border-slate-100'}`}>
                    {p.stock}
                  </div>
               </div>
             ))}
             {products.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                <Package size={48} className="mb-2 opacity-20" />
                <p className="font-bold">لا توجد منتجات</p>
              </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => {
  const colors: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600',
    red: 'bg-red-50 text-red-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600'
  };
  return (
    <div className="p-6 rounded-3xl border border-slate-100 shadow-sm bg-white hover:shadow-lg hover:scale-[1.02] transition-all">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${colors[color]}`}>
        {icon}
      </div>
      <div className="text-slate-500 text-sm font-bold mb-1">{title}</div>
      <div className="text-2xl font-black text-slate-900 tracking-tight">{value}</div>
    </div>
  );
};

export default Dashboard;
