
import React, { useState, useMemo, useEffect } from 'react';
import { Product, StockMovement } from '../types';
import { dbService } from '../services/db';
import { 
  Plus, Search, Edit2, Package, X, 
  ArrowUpCircle, ArrowDownCircle, History, 
  TrendingUp, Wallet, ShoppingCart, AlertTriangle, Layers
} from 'lucide-react';

interface Props {
  products: Product[];
  onUpdate: () => void;
}

const CATEGORIES = [
  "عام",
  "إلكترونيات وموبايلات",
  "ملابس وأزياء",
  "مواد غذائية وسوبر ماركت",
  "مستحضرات تجميل وعناية",
  "منظفات وأدوات منزلية",
  "أحذية وحقائب",
  "ساعات وإكسسوارات",
  "مكتبة وهدايا",
  "ألعاب أطفال",
  "عطور وبرفانات",
  "أدوات كهربائية",
  "أثاث وديكور",
  "قطع غيار وزيوت",
  "أدوية ومستلزمات طبية",
  "أخرى"
];

const Inventory: React.FC<Props> = ({ products, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'balance' | 'movements'>('balance');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);

  const [stockEntry, setStockEntry] = useState({ productId: 0, quantity: 0 });

  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    price: 0,
    cost: 0,
    stock: 0,
    category: 'عام',
    barcode: ''
  });

  useEffect(() => {
    dbService.getAll<StockMovement>('movements').then(data => {
      setMovements(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    });
  }, [products]);

  const valuation = useMemo(() => {
    return products.reduce((acc, p) => {
      const totalCost = p.cost * p.stock;
      const totalRevenue = p.price * p.stock;
      const totalProfit = (p.price - p.cost) * p.stock;
      return {
        wholesale: acc.wholesale + totalCost,
        market: acc.market + totalRevenue,
        potentialProfit: acc.potentialProfit + totalProfit
      };
    }, { wholesale: 0, market: 0, potentialProfit: 0 });
  }, [products]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMovements = movements.filter(m => 
    m.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      await dbService.update('products', { ...formData, id: editingProduct.id });
    } else {
      await dbService.add('products', formData);
    }
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({ name: '', price: 0, cost: 0, stock: 0, category: 'عام', barcode: '' });
    onUpdate();
  };

  const handleStockEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (stockEntry.productId && stockEntry.quantity > 0) {
      await dbService.addStock(stockEntry.productId, stockEntry.quantity);
      setIsStockModalOpen(false);
      setStockEntry({ productId: 0, quantity: 0 });
      onUpdate();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <Package className="text-indigo-600" />
            جرد وتتبع المخزون
          </h2>
          <p className="text-slate-500">متابعة دقيقة لكل قطعة تدخل وتخرج من محلك</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsStockModalOpen(true)}
            className="bg-emerald-600 text-white px-6 py-3.5 rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 flex items-center gap-2"
          >
            <ArrowUpCircle size={20} />
            وارد جديد
          </button>
          <button 
            onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
            className="bg-indigo-600 text-white px-6 py-3.5 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-2"
          >
            <Plus size={20} />
            إضافة صنف
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Wallet size={24} /></div>
            <span className="text-slate-500 font-bold">قيمة البضاعة (جملة)</span>
          </div>
          <div className="text-3xl font-black text-slate-900">{valuation.wholesale.toLocaleString()} <span className="text-sm font-medium">ج.م</span></div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><ShoppingCart size={24} /></div>
            <span className="text-slate-500 font-bold">القيمة السوقية (بيع)</span>
          </div>
          <div className="text-3xl font-black text-indigo-600">{valuation.market.toLocaleString()} <span className="text-sm font-medium">ج.م</span></div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><TrendingUp size={24} /></div>
            <span className="text-slate-500 font-bold">الأرباح المتوقعة</span>
          </div>
          <div className="text-3xl font-black text-emerald-600">{valuation.potentialProfit.toLocaleString()} <span className="text-sm font-medium">ج.م</span></div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-center bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto">
          <button 
            onClick={() => setActiveTab('balance')}
            className={`flex-1 md:flex-none px-8 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'balance' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
          >
            رصيد المخزون
          </button>
          <button 
            onClick={() => setActiveTab('movements')}
            className={`flex-1 md:flex-none px-8 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'movements' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
          >
            سجل الوارد والصادر
          </button>
        </div>
        <div className="relative flex-1 w-full">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="بحث سريع في الأصناف أو الفئات..."
            className="w-full pr-12 pl-4 py-3.5 rounded-2xl bg-slate-50 text-slate-900 border-none focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === 'balance' ? (
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-tighter font-black">
                  <th className="p-5 border-l border-slate-100">الصنف / الفئة</th>
                  <th className="p-5 border-l border-slate-100 text-center">الكمية</th>
                  <th className="p-5 border-l border-slate-100" colSpan={2}>سعر الجملة (قطعة / كل)</th>
                  <th className="p-5 border-l border-slate-100" colSpan={2}>سعر البيع (قطعة / كل)</th>
                  <th className="p-5 border-l border-slate-100" colSpan={2}>المكسب المتوقع (قطعة / كل)</th>
                  <th className="p-5 text-center">تعديل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-5 border-l border-slate-100">
                      <div className="font-black text-slate-800">{p.name}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">{p.category}</div>
                    </td>
                    <td className={`p-5 text-center font-black border-l border-slate-100 ${p.stock === 0 ? 'bg-red-600 text-white animate-pulse' : p.stock <= 5 ? 'bg-red-50 text-red-600' : 'text-slate-800'}`}>
                      {p.stock}
                    </td>
                    <td className="p-5 text-xs text-slate-500 bg-slate-50/30">{p.cost.toLocaleString()}</td>
                    <td className="p-5 font-bold text-slate-700 border-l border-slate-100">{(p.cost * p.stock).toLocaleString()}</td>
                    <td className="p-5 text-xs text-indigo-400 bg-indigo-50/10">{p.price.toLocaleString()}</td>
                    <td className="p-5 font-bold text-indigo-600 border-l border-slate-100">{(p.price * p.stock).toLocaleString()}</td>
                    <td className="p-5 text-xs text-emerald-400 bg-emerald-50/10">{(p.price - p.cost).toLocaleString()}</td>
                    <td className="p-5 font-bold text-emerald-600 border-l border-slate-100">{((p.price - p.cost) * p.stock).toLocaleString()}</td>
                    <td className="p-5 text-center">
                      <button onClick={() => { setEditingProduct(p); setFormData({...p}); setIsModalOpen(true); }} className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100"><Edit2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-black">
                  <th className="p-5">التاريخ والوقت</th>
                  <th className="p-5">اسم المنتج</th>
                  <th className="p-5 text-center">الحركة</th>
                  <th className="p-5 text-center">الكمية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMovements.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-5 text-slate-500 text-sm font-medium">{new Date(m.date).toLocaleString('ar-EG')}</td>
                    <td className="p-5 font-bold text-slate-800">{m.productName}</td>
                    <td className="p-5 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${m.type === 'IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {m.type === 'IN' ? 'وارد (توريد)' : 'صادر (بيع)'}
                      </span>
                    </td>
                    <td className={`p-5 text-center font-black ${m.type === 'IN' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {m.type === 'IN' ? '+' : '-'}{m.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-indigo-50/50">
              <h3 className="text-2xl font-black text-slate-800">{editingProduct ? 'تعديل بيانات الصنف' : 'إضافة صنف جديد للمخزن'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">اسم المنتج بالتفصيل</label>
                <input required type="text" className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-white text-slate-900 focus:bg-white focus:border-indigo-500 outline-none font-bold transition-all" 
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="مثال: شاحن سريع 20 وات" />
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">التصنيف / الفئة</label>
                <div className="relative">
                  <select 
                    className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-white text-slate-900 font-bold outline-none focus:border-indigo-500 appearance-none cursor-pointer" 
                    value={formData.category} 
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat} className="bg-white text-slate-900">{cat}</option>
                    ))}
                  </select>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                    <Layers size={18} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">سعر الجملة (التكلفة)</label>
                  <input required type="number" className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-white text-slate-900 font-bold" 
                    value={formData.cost || ''} onChange={(e) => setFormData({...formData, cost: Number(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">سعر البيع المقترح</label>
                  <input required type="number" className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-white text-indigo-600 font-black text-xl" 
                    value={formData.price || ''} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">الرصيد الحالي بالمخزن</label>
                <input required type="number" disabled={!!editingProduct} className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-white text-slate-900 font-bold disabled:opacity-50" 
                  value={formData.stock || ''} onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})} />
                {editingProduct && <p className="text-[10px] text-amber-600 mt-1 font-bold">لتعديل الكمية استخدم زر "وارد جديد"</p>}
              </div>

              <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95">
                {editingProduct ? 'تحديث البيانات' : 'حفظ الصنف في السجلات'}
              </button>
            </form>
          </div>
        </div>
      )}

      {isStockModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 bg-emerald-600 text-white flex justify-between items-center">
              <h3 className="text-2xl font-black">توريد بضاعة للمخزن</h3>
              <button onClick={() => setIsStockModalOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleStockEntry} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">الصنف المراد توريده</label>
                <select 
                  className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-white text-slate-900 font-bold outline-none focus:border-emerald-500 appearance-none cursor-pointer"
                  value={stockEntry.productId}
                  onChange={(e) => setStockEntry({...stockEntry, productId: Number(e.target.value)})}
                  required
                >
                  <option value="" className="bg-white">-- اختر صنفاً من المخزون --</option>
                  {products.map(p => <option key={p.id} value={p.id} className="bg-white">{p.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">الكمية المضافة</label>
                <input 
                  type="number" 
                  className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-white text-emerald-600 font-black text-3xl outline-none focus:border-emerald-500 transition-all"
                  value={stockEntry.quantity || ''}
                  onChange={(e) => setStockEntry({...stockEntry, quantity: Number(e.target.value)})}
                  placeholder="0"
                  required
                />
              </div>
              <button type="submit" className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black text-xl hover:bg-emerald-700 shadow-xl shadow-emerald-100">
                إتمام عملية التوريد
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
