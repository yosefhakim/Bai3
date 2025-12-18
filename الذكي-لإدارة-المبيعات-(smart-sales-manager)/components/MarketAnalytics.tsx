
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { getMarketAnalysis } from '../services/geminiService';
import { LineChart, Sparkles, AlertCircle, TrendingUp, Info, Loader2, RefreshCw, BarChart3, Package } from 'lucide-react';

interface Props {
  products: Product[];
}

const MarketAnalytics: React.FC<Props> = ({ products }) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const triggerAnalysis = async () => {
    if (products.length === 0) return;
    setLoading(true);
    const result = await getMarketAnalysis(products);
    setAnalysis(result);
    setLoading(false);
  };

  useEffect(() => {
    if (products.length > 0 && !analysis) {
      triggerAnalysis();
    }
  }, [products]);

  if (products.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <Package className="text-slate-300" size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">لا توجد بيانات للتحليل</h2>
        <p className="text-slate-500 max-w-md">قم بإضافة منتجات إلى المخزون أولاً ليتمكن المستشار الذكي من تحليل وضعك في السوق المصري.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <LineChart className="text-indigo-600" />
            مستشار السوق الذكي
          </h2>
          <p className="text-slate-500">تحليلات استراتيجية بناءً على مخزونك الحالي واتجاهات السوق في مصر</p>
        </div>
        <button 
          onClick={triggerAnalysis}
          disabled={loading}
          className="flex items-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
          تحديث التحليلات
        </button>
      </div>

      {loading && !analysis ? (
        <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="relative mb-6">
            <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600" size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">جاري قراءة السوق...</h3>
          <p className="text-slate-500 max-w-sm">يقوم الذكاء الاصطناعي الآن بمقارنة أسعارك مع المنافسين وتحليل اتجاهات الطلب الحالية.</p>
        </div>
      ) : analysis ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Strategic Report */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-white/20 rounded-2xl">
                  <BarChart3 size={24} />
                </div>
                <h3 className="text-xl font-black">التقرير الاستراتيجي العام</h3>
              </div>
              <p className="text-indigo-50 leading-loose text-lg font-medium opacity-90">
                {analysis.generalReport}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {analysis.insights.map((insight: any, idx: number) => (
                 <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-black text-slate-800">{insight.productName}</h4>
                      <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-1 rounded-lg uppercase">Insight</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <TrendingUp size={14} className="text-emerald-500 mt-1 shrink-0" />
                        <p className="text-sm text-slate-600"><span className="font-bold">الاتجاه:</span> {insight.marketTrend}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Info size={14} className="text-indigo-500 mt-1 shrink-0" />
                        <p className="text-sm text-slate-600"><span className="font-bold">السعر المقترح:</span> {insight.suggestedPriceRange}</p>
                      </div>
                      <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 italic text-sm text-slate-500">
                        "{insight.advice}"
                      </div>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          {/* Right Sidebar: Tips & Alerts */}
          <div className="space-y-6">
             <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
                  <AlertCircle className="text-amber-500" />
                  تنبيهات الفرص الضائعة
                </h3>
                <div className="space-y-4">
                  <OpportunityItem 
                    title="موسم العودة للمدارس" 
                    desc="هناك طلب متزايد على الأدوات المكتبية، تأكد من توفر مخزون كافٍ." 
                  />
                  <OpportunityItem 
                    title="تعديل أسعار الإلكترونيات" 
                    desc="تغيرات سعر الصرف تتطلب مراجعة فورية لأسعار الأجهزة لضمان هامش الربح." 
                    urgent
                  />
                  <OpportunityItem 
                    title="عروض نهاية الأسبوع" 
                    desc="المنافسون في منطقتك يقدمون خصومات 10%، حاول المنافسة بالجودة." 
                  />
                </div>
             </div>

             <div className="bg-indigo-50 p-8 rounded-[2rem] border border-indigo-100">
                <h3 className="font-black text-indigo-900 mb-4 flex items-center gap-2">
                  <Sparkles size={20} />
                  نصيحة اليوم
                </h3>
                <p className="text-indigo-700 text-sm leading-relaxed font-medium">
                  العملاء في مصر يميلون للشراء في الأيام العشرة الأولى من الشهر. استهدف هذه الفترة بحملات ترويجية للمنتجات عالية الربحية.
                </p>
             </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const OpportunityItem: React.FC<{ title: string; desc: string; urgent?: boolean }> = ({ title, desc, urgent }) => (
  <div className={`p-4 rounded-2xl border ${urgent ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
    <div className="font-bold text-sm mb-1 flex items-center gap-2">
      {urgent && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
      {title}
    </div>
    <p className="text-xs text-slate-500 leading-normal">{desc}</p>
  </div>
);

export default MarketAnalytics;
