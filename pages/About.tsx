import React from 'react';
import { Users, Award, Target, Briefcase } from 'lucide-react';
import { Trainer, Testimonial } from '../types';

const TRAINERS: Trainer[] = [
  { id: '1', name: 'أحمد محمد', role: 'خبير روبوتات', bio: '10 سنوات خبرة في هندسة الميكاترونيكس.', image: 'https://picsum.photos/150/150?random=10' },
  { id: '2', name: 'سارة العلي', role: 'مطورة ذكاء اصطناعي', bio: 'متخصصة في خوارزميات الرؤية الحاسوبية.', image: 'https://picsum.photos/150/150?random=11' },
  { id: '3', name: 'خالد عمر', role: 'مدرب برمجة', bio: 'شغوف بتبسيط البرمجة للأطفال.', image: 'https://picsum.photos/150/150?random=12' },
];

const TESTIMONIALS: Testimonial[] = [
  { id: '1', name: 'فيصل', role: 'طالب', text: 'منصة مُلَقّن غيرت طريقتي في فهم البرمجة. المحاكي رائع!' },
  { id: '2', name: 'أميرة', role: 'معلمة', text: 'أستخدم المنصة مع طلابي، النتائج مذهلة والطلاب مستمتعون جداً.' },
];

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-primary">
      
      {/* About Header */}
      <div className="bg-secondary py-20 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">عن مُلَقّن</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            نحن نؤمن بأن البرمجة والروبوتات هي لغة المستقبل. مهمتنا هي تمكين الجيل العربي من أدوات العصر بلغتهم.
          </p>
        </div>
      </div>

      {/* How We Work */}
      <section className="py-16 max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-white mb-10 text-center">كيف نعمل؟</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 border border-white/5 rounded-xl bg-secondary hover:border-accent transition">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4 text-accent"><Briefcase /></div>
            <h3 className="text-xl font-bold text-white mb-2">التعلم بالممارسة</h3>
            <p className="text-gray-400">لا نكتفي بالنظريات، بل نضعك أمام محاكي واقعي لتجربة ما تعلمته فوراً.</p>
          </div>
          <div className="p-6 border border-white/5 rounded-xl bg-secondary hover:border-accent transition">
            <div className="w-12 h-12 bg-highlight/10 rounded-full flex items-center justify-center mb-4 text-highlight"><Target /></div>
            <h3 className="text-xl font-bold text-white mb-2">مسارات مخصصة</h3>
            <p className="text-gray-400">مناهج تناسب جميع المستويات، من المبتدئ إلى المحترف.</p>
          </div>
          <div className="p-6 border border-white/5 rounded-xl bg-secondary hover:border-accent transition">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4 text-accent"><Award /></div>
            <h3 className="text-xl font-bold text-white mb-2">شهادات معتمدة</h3>
            <p className="text-gray-400">تحصل على شهادة إتمام عند اجتيازك للمشاريع والاختبارات.</p>
          </div>
        </div>
      </section>

      {/* Trainers */}
      <section className="py-16 bg-secondary border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-10 text-center">المدربون</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {TRAINERS.map(trainer => (
              <div key={trainer.id} className="text-center group">
                <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-white/10 group-hover:border-accent transition">
                  <img src={trainer.image} alt={trainer.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition" />
                </div>
                <h3 className="text-lg font-bold text-white">{trainer.name}</h3>
                <p className="text-highlight text-sm mb-2">{trainer.role}</p>
                <p className="text-gray-400 text-sm">{trainer.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-white mb-10 text-center">الشهادات</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {TESTIMONIALS.map(t => (
            <div key={t.id} className="bg-secondary p-8 rounded-2xl relative border border-white/5">
              <div className="text-4xl text-accent absolute top-4 right-4">"</div>
              <p className="text-gray-300 mb-6 relative z-10">{t.text}</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white font-bold">
                  {t.name[0]}
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">{t.name}</h4>
                  <span className="text-gray-500 text-xs">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default About;