
import React, { useState, useMemo } from 'react';
import { Product, Customer, Sale, SaleItem } from '../types';
import { dbService } from '../services/db';
import { ShoppingBag, Search, Plus, Trash2, Printer, CheckCircle, User } from 'lucide-react';

interface Props {
  products: Product[];
  customers: Customer[];
  sales: Sale[];
  onUpdate: () => void;
}

const SalesManager: React.FC<Props> = ({ products, customers, sales, onUpdate }) => {
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<number | undefined>();
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastSaleId, setLastSaleId] = useState<number | null>(null);

  const total = useMemo(() => cart.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0), [cart]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => 
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { 
        productId: product.id!, 
        productName: product.name, 
        quantity: 1, 
        unitPrice: product.price 
      }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const handleCompleteSale = async () => {
    if (cart.length === 0) return;

    const sale: Sale = {
      date: new Date().toISOString(),
      customerId: selectedCustomer,
      customerName: customers.find(c => c.id === selectedCustomer)?.name,
      items: cart,
      total: total
    };

    const id = await dbService.recordSale(sale);
    setLastSaleId(id);
    setIsSuccess(true);
    setCart([]);
    setSelectedCustomer(undefined);
    onUpdate();

    setTimeout(() => setIsSuccess(false), 3000);
  };

  const printReceipt = () => {
    window.print();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full animate-in fade-in duration-500">
      {/* Product Selection Area */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <ShoppingBag className="text-indigo-600" />
            نقطة البيع (الكاشير)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {products.map(product => (
            <button
              key={product.id}
              disabled={product.stock <= 0}
              onClick={() => addToCart(product)}
              className={`p-6 bg-white rounded-[2rem] shadow-sm border border-slate-100 text-right hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-900/5 transition-all group relative overflow-hidden ${product.stock <= 0 ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
            >
              <div className="relative z-10">
                <div className="font-black text-slate-800 text-lg mb-1 group-hover:text-indigo-600 transition-colors">{product.name}</div>
                <div className="text-indigo-600 font-black text-xl mb-3">{product.price.toLocaleString()} <span className="text-sm font-medium">ج.م</span></div>
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${product.stock <= 5 ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-500'}`}>
                    المخزون: {product.stock}
                  </span>
                  <div className="bg-indigo-600 text-white p-2 rounded-xl scale-0 group-hover:scale-100 transition-transform shadow-lg shadow-indigo-200">
                    <Plus size={18} />
                  </div>
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 text-slate-50 group-hover:text-indigo-50 transition-colors">
                <ShoppingBag size={80} strokeWidth={1} />
              </div>
            </button>
          ))}
          {products.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
               <p className="text-slate-400 font-bold">لا يوجد منتجات في المخزن حالياً</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart Area */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col h-[calc(100vh-120px)] sticky top-4 overflow-hidden">
        <div className="p-8 bg-slate-50/50 border-b border-slate-100">
          <h3 className="text-xl font-black text-slate-800 mb-5 flex items-center gap-2">
             <ShoppingBag size={20} className="text-indigo-600" />
             سلة المشتريات
          </h3>
          <div className="relative">
            <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
            <select 
              className="w-full pr-12 pl-4 py-4 rounded-2xl border-2 border-slate-200 bg-white text-slate-900 font-bold outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
              value={selectedCustomer || ''}
              onChange={(e) => setSelectedCustomer(e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="" className="text-slate-400 bg-white">عميل نقدي (سريع)</option>
              {customers.map(c => (
                <option key={c.id} value={c.id} className="text-slate-900 bg-white">{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.map(item => (
            <div key={item.productId} className="flex justify-between items-center bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm animate-in slide-in-from-right-4">
              <div className="space-y-1">
                <div className="font-black text-slate-800">{item.productName}</div>
                <div className="text-xs font-bold text-slate-400">
                  {item.quantity} قطعة × {item.unitPrice.toLocaleString()} ج.م
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-black text-indigo-600 text-lg">{(item.quantity * item.unitPrice).toLocaleString()}</span>
                <button 
                  onClick={() => removeFromCart(item.productId)} 
                  className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4 opacity-40">
              <ShoppingBag size={64} strokeWidth={1.5} />
              <p className="font-black text-lg">السلة فارغة</p>
            </div>
          )}
        </div>

        <div className="p-8 bg-slate-900 text-white space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-bold">الإجمالي النهائي:</span>
            <span className="text-3xl font-black text-indigo-400">{total.toLocaleString()} ج.م</span>
          </div>
          
          <div className="space-y-3">
            <button 
              disabled={cart.length === 0}
              onClick={handleCompleteSale}
              className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xl hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl shadow-indigo-900/40 active:scale-[0.98]"
            >
              تأكيد البيع وحفظ الفاتورة
            </button>
            
            {lastSaleId && (
               <button 
                onClick={printReceipt}
                className="w-full py-3 text-indigo-300 hover:text-white flex items-center justify-center gap-2 font-bold transition-colors"
              >
                <Printer size={18} />
                طباعة الفاتورة الأخيرة
              </button>
            )}
          </div>
        </div>

        {isSuccess && (
          <div className="absolute inset-x-0 top-0 p-4 bg-emerald-500 text-white flex items-center justify-center gap-3 font-black shadow-lg animate-in slide-in-from-top duration-300">
            <CheckCircle size={22} />
            تم تسجيل العملية بنجاح!
          </div>
        )}
      </div>

      {/* Printable Invoice (hidden) */}
      <div id="invoice-print" className="print-only p-8 text-black bg-white w-[80mm] mx-auto text-center font-serif border border-black/10">
        <h1 className="text-2xl font-black mb-1">البائع الذكي</h1>
        <p className="text-[10px] mb-4 text-slate-500">فاتورة مبيعات ضريبية مبسطة</p>
        <div className="text-[10px] flex justify-between mb-4">
          <span>التاريخ: {new Date().toLocaleDateString('ar-EG')}</span>
          <span>رقم الفاتورة: #{lastSaleId}</span>
        </div>
        <hr className="mb-4 border-slate-300 border-dashed" />
        <table className="w-full text-[10px] text-right mb-6">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="py-2">الصنف</th>
              <th className="py-2 text-center">الكمية</th>
              <th className="py-2 text-left">الإجمالي</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sales.find(s => s.id === lastSaleId)?.items.map(item => (
              <tr key={item.productId}>
                <td className="py-2 font-bold">{item.productName}</td>
                <td className="py-2 text-center">{item.quantity}</td>
                <td className="py-2 text-left">{item.quantity * item.unitPrice} ج.م</td>
              </tr>
            ))}
          </tbody>
        </table>
        <hr className="mb-4 border-slate-300 border-dashed" />
        <div className="flex justify-between font-black text-sm mb-6">
          <span>الإجمالي النهائي:</span>
          <span>{sales.find(s => s.id === lastSaleId)?.total} ج.م</span>
        </div>
        <div className="text-[10px] text-slate-400 mt-10">
          <p>شكراً لزيارتكم</p>
          <p className="mt-1">نظام البائع الذكي AI</p>
        </div>
      </div>
    </div>
  );
};

export default SalesManager;
