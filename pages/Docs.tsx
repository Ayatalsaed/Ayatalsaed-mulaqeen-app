import React from 'react';
import { Book, FileText } from 'lucide-react';

const Docs: React.FC = () => {
  return (
    <div className="min-h-screen bg-primary py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-secondary p-6 rounded-xl h-fit border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Book size={20} />
            الفهرس
          </h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="text-highlight font-medium cursor-pointer">مقدمة</li>
            <li className="hover:text-white cursor-pointer transition">تثبيت البيئة</li>
            <li className="hover:text-white cursor-pointer transition">أوامر الروبوت</li>
            <li className="hover:text-white cursor-pointer transition">استخدام الذكاء الاصطناعي</li>
            <li className="hover:text-white cursor-pointer transition">استكشاف الأخطاء</li>
          </ul>
        </aside>

        {/* Content */}
        <div className="flex-1 bg-secondary p-8 rounded-xl border border-white/10">
          <article className="prose prose-invert max-w-none">
            <h1 className="text-3xl font-bold text-white mb-6">الوثائق التقنية</h1>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <FileText size={24} className="text-accent" />
                مقدمة
              </h2>
              <p className="text-gray-300 leading-relaxed">
                مرحباً بك في التوثيق الرسمي لمنصة مُلَقّن. ستجد هنا كل ما تحتاجه لفهم كيفية عمل المحاكي وبرمجة الروبوتات باستخدام واجهتنا أو عبر الأوامر المباشرة.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">قائمة الأوامر الأساسية</h2>
              <div className="bg-primary rounded-lg p-4 border border-white/10 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400">
                      <th className="py-2 px-4">الأمر (Command)</th>
                      <th className="py-2 px-4">الوصف</th>
                      <th className="py-2 px-4">مثال</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    <tr className="border-b border-white/5">
                      <td className="py-2 px-4 font-mono text-highlight">FORWARD</td>
                      <td className="py-2 px-4">تحريك الروبوت خطوة للأمام</td>
                      <td className="py-2 px-4 font-mono">["FORWARD"]</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-2 px-4 font-mono text-highlight">BACKWARD</td>
                      <td className="py-2 px-4">تحريك الروبوت خطوة للخلف</td>
                      <td className="py-2 px-4 font-mono">["BACKWARD"]</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-2 px-4 font-mono text-highlight">TURN_RIGHT</td>
                      <td className="py-2 px-4">الدوران 90 درجة لليمين</td>
                      <td className="py-2 px-4 font-mono">["TURN_RIGHT"]</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

             <section className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">الذكاء الاصطناعي</h2>
              <p className="text-gray-300 leading-relaxed">
                يمكنك استخدام زر "مساعد الذكاء الاصطناعي" في المحاكي لكتابة الأوامر باللغة العربية الطبيعية. سيقوم النموذج بتحويل طلبك (مثلاً: "ارسم مربعاً") إلى سلسلة من الأوامر البرمجية.
              </p>
            </section>

          </article>
        </div>

      </div>
    </div>
  );
};

export default Docs;