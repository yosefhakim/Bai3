
import React, { useState } from 'react';
import { Expense } from '../types';
import { dbService } from '../services/db';
import { Plus, Receipt, Trash2, Search, X } from 'lucide-react';

interface Props {
  expenses: Expense[];
  onUpdate: () => void;
}

const ExpenseManager: React.FC<Props> = ({ expenses, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<Expense, 'id'>>({
    description: '',
    amount: 0,
    category: 'عام',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dbService.add('expenses', formData);
    setIsModalOpen(false);
    setFormData({ description: '', amount: 0, category: 'عام', date: new Date().toISOString().split('T')[0] });
    onUpdate();
  };

  const deleteExpense = async (id: number) => {
    if (confirm('هل تريد حذف هذا المصروف؟')) {
      await dbService.delete('expenses', id);
      onUpdate();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <Receipt className="text-red-500" />
            إدارة المصروفات
          </h2>
          <p className="text-slate-500">سجل وراقب كافة النفقات التشغيلية لمحلك</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-red-500 text-white px-8 py-3.5 rounded-2xl font-black hover:bg-red-600 transition-all shadow-xl shadow-red-100 flex items-center gap-2 active:scale-95"
        >
          <Plus size={20} />
          إضافة مصروف جديد
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 text-xs font-black uppercase tracking-widest">
                <th className="p-6">وصف المصروف</th>
                <th className="p-6">الفئة</th>
                <th className="p-6 text-center">المبلغ</th>
                <th className="p-6">التاريخ</th>
                <th className="p-6 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map(exp => (
                <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-6 font-black text-slate-800">{exp.description}</td>
                  <td className="p-6">
                    <span className="px-4 py-1.5 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase">
                      {exp.category}
                    </span>
                  </td>
                  <td className="p-6 text-center">
                    <span className="text-lg font-black text-red-600">{(exp.amount).toLocaleString()} ج.م</span>
                  </td>
                  <td className="p-6 text-slate-500 font-medium">
                    {new Date(exp.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </td>
                  <td className="p-6 text-center">
                    <button 
                      onClick={() => deleteExpense(exp.id!)} 
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <Receipt size={64} />
                      <p className="font-black text-xl">لا توجد مصروفات مسجلة</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 bg-red-500 text-white flex justify-between items-center">
              <h3 className="text-2xl font-black">تسجيل مصروف جديد</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">وصف المصروف</label>
                <input 
                  required 
                  type="text" 
                  className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-900 placeholder:text-slate-400 font-bold outline-none focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-50 transition-all" 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  placeholder="مثال: فاتورة كهرباء، إيجار المخزن..." 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">المبلغ (ج.م)</label>
                  <input 
                    required 
                    type="number" 
                    className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 text-red-600 font-black text-xl outline-none focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-50 transition-all" 
                    value={formData.amount || ''} 
                    onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">الفئة</label>
                  <div className="relative">
                    <select 
                      className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-900 font-bold outline-none focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-50 transition-all appearance-none cursor-pointer"
                      value={formData.category} 
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="عام" className="bg-white text-slate-900">عام</option>
                      <option value="إيجار" className="bg-white text-slate-900">إيجار</option>
                      <option value="كهرباء" className="bg-white text-slate-900">كهرباء</option>
                      <option value="نقل" className="bg-white text-slate-900">نقل</option>
                      <option value="رواتب" className="bg-white text-slate-900">رواتب</option>
                    </select>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <Plus size={16} className="rotate-45" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="submit" 
                  className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black text-lg hover:bg-red-600 transition-all shadow-xl shadow-red-100 active:scale-[0.98]"
                >
                  تأكيد التسجيل
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

export default ExpenseManager;
