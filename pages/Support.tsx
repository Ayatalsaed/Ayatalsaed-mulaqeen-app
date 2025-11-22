import React, { useState } from 'react';
import { Mail, MessageCircle, Search, ChevronDown, ChevronUp } from 'lucide-react';

const FAQS = [
  { q: 'كيف يمكنني البدء في المحاكي؟', a: 'فقط اذهب إلى صفحة المحاكي، واكتب أوامرك في المحرر أو استخدم المساعد الذكي.' },
  { q: 'هل المتجر يشحن لجميع الدول؟', a: 'حالياً نشحن داخل المملكة العربية السعودية ودول الخليج.' },
  { q: 'كيف أستعيد كلمة المرور؟', a: 'من صفحة تسجيل الدخول، اضغط على "نسيت كلمة المرور" واتبع التعليمات.' },
];

const Support: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-primary py-12">
      <div className="max-w-4xl mx-auto px-4">
        
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white mb-4">كيف يمكننا مساعدتك؟</h1>
          <div className="relative max-w-xl mx-auto">
            <input 
              type="text" 
              placeholder="ابحث عن سؤال..." 
              className="w-full bg-secondary border border-white/10 rounded-full py-3 px-12 text-gray-200 focus:border-highlight focus:outline-none"
            />
            <Search className="absolute right-4 top-3.5 text-gray-500" size={20} />
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">الأسئلة الشائعة</h2>
          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="bg-secondary rounded-lg border border-white/10 overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex justify-between items-center p-4 text-right hover:bg-white/5 transition"
                >
                  <span className="font-medium text-gray-200">{faq.q}</span>
                  {openFaq === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {openFaq === idx && (
                  <div className="p-4 text-gray-400 border-t border-white/5 bg-primary/50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-secondary rounded-2xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6">اتصل بنا</h2>
          <form className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">الاسم</label>
                <input type="text" className="w-full bg-primary border border-white/10 rounded-lg p-2 text-white focus:border-highlight focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">البريد الإلكتروني</label>
                <input type="email" className="w-full bg-primary border border-white/10 rounded-lg p-2 text-white focus:border-highlight focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">الرسالة</label>
              <textarea rows={4} className="w-full bg-primary border border-white/10 rounded-lg p-2 text-white focus:border-highlight focus:outline-none"></textarea>
            </div>
            <button type="button" className="bg-accent hover:opacity-90 text-white px-6 py-3 rounded-lg font-bold transition w-full md:w-auto shadow-lg shadow-accent/20">
              إرسال الرسالة
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Support;