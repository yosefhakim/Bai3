
import React, { useState } from 'react';
import { Customer } from '../types';
import { dbService } from '../services/db';
import { Plus, UserPlus, Search, Phone, Mail, X, User } from 'lucide-react';

interface Props {
  customers: Customer[];
  onUpdate: () => void;
}

const CustomerManager: React.FC<Props> = ({ customers, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Omit<Customer, 'id'>>({
    name: '',
    phone: '',
    email: '',
    total_purchases: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dbService.add('customers', formData);
    setIsModalOpen(false);
    setFormData({ name: '', phone: '', email: '', total_purchases: 0 });
    onUpdate();
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <UserPlus className="text-indigo-600" />
            إدارة قاعدة العملاء
          </h2>
          <p className="text-slate-500">متابعة ولاء العملاء وإحصائيات شرائهم</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-2 active:scale-95"
        >
          <Plus size={20} />
          إضافة عميل جديد
        </button>
      </div>

      <div className="relative max-w-2xl">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text"
          placeholder="بحث بالاسم أو رقم الهاتف..."
          className="w-full pr-12 pl-4 py-4 rounded-2xl bg-white border border-slate-100 shadow-sm text-slate-900 font-bold outline-none focus:ring-2 focus:ring-indigo-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map(customer => (
          <div key={customer.id} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-50 hover:shadow-xl hover:shadow-indigo-900/5 transition-all group">
            <div className="flex items-center gap-5 mb-6">
              <div className="w-16 h-16 rounded-[1.25rem] bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-inner">
                {customer.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-black text-xl text-slate-800 mb-1">{customer.name}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">معرف العميل: #{customer.id}</p>
              </div>
            </div>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                <Phone size={16} className="text-indigo-400" /> 
                <span className="font-bold">{customer.phone}</span>
              </div>
              {customer.email && (
                <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                  <Mail size={16} className="text-indigo-400" /> 
                  <span className="font-bold text-sm truncate">{customer.email}</span>
                </div>
              )}
            </div>
            
            <div className="pt-6 border-t border-slate-50 flex justify-between items-end">
              <div>
                <div className="text-[10px] text-slate-400 font-black uppercase mb-1">إجمالي المسحوبات</div>
                <div className="text-2xl font-black text-indigo-600">{customer.total_purchases.toLocaleString()} <span className="text-sm font-medium">ج.م</span></div>
              </div>
              <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg font-bold text-[10px] uppercase">نشط</div>
            </div>
          </div>
        ))}
        {filteredCustomers.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
             <UserPlus size={48} className="mx-auto text-slate-200 mb-4" />
             <p className="text-slate-400 font-bold">لا يوجد عملاء مطابقين للبحث</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 bg-indigo-600 text-white flex justify-between items-center">
              <h3 className="text-2xl font-black">إضافة عميل لقاعدة البيانات</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">الاسم الكامل للعميل</label>
                <input 
                  required 
                  type="text" 
                  className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-white text-slate-900 placeholder:text-slate-400 font-bold outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder="مثال: أحمد محمد علي" 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">رقم الهاتف</label>
                <div className="relative">
                  <Phone size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    required 
                    type="tel" 
                    dir="ltr"
                    className="w-full pr-12 pl-4 py-4 rounded-2xl border-2 border-slate-100 bg-white text-slate-900 font-bold outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                    placeholder="01xxxxxxxxx" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">البريد الإلكتروني (اختياري)</label>
                <div className="relative">
                  <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    type="email" 
                    dir="ltr"
                    className="w-full pr-12 pl-4 py-4 rounded-2xl border-2 border-slate-100 bg-white text-slate-900 font-bold outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all" 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    placeholder="customer@example.com" 
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="submit" 
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-[0.98]"
                >
                  حفظ العميل
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManager;
