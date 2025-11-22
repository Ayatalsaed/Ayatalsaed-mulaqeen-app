import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Cpu, Globe, Zap } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-primary font-['Tajawal']">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/1920/1080')] opacity-[0.03] bg-cover bg-center grayscale" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/50 via-primary/80 to-primary"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight mb-8 leading-tight">
            برمج الروبوتات <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-highlight via-accent to-highlight">بذكاء واحترافية</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-12 font-light leading-relaxed">
            منصة <span className="font-bold text-white">مُلَقّن</span> تتيح لك تعلم برمجة الروبوتات من خلال محاكي متطور مدعوم بالذكاء الاصطناعي.
            اكتب الأوامر، وشاهد الروبوت ينفذها فوراً.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link
              to="/simulator"
              className="inline-flex items-center justify-center px-10 py-4 text-lg font-bold text-white bg-accent rounded-xl hover:bg-indigo-600 transition-all duration-300 shadow-lg shadow-accent/20 hover:shadow-accent/40 transform hover:-translate-y-1"
            >
              ابدأ المحاكي الآن
              <ArrowRight className="mr-2" size={22} />
            </Link>
            <Link
              to="/store"
              className="inline-flex items-center justify-center px-10 py-4 text-lg font-bold text-highlight border-2 border-highlight/20 bg-highlight/5 rounded-xl hover:bg-highlight hover:text-white transition-all duration-300 backdrop-blur-sm"
            >
              تصفح المتجر
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 relative inline-block">
              لماذا تختار مُلَقّن؟
              <span className="absolute -bottom-3 right-0 w-1/2 h-1 bg-accent rounded-full"></span>
            </h2>
            <p className="mt-6 text-gray-400 text-lg">أدوات متكاملة لتجربة تعليمية فريدة ومبتكرة</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Zap size={40} />, title: 'محاكي فوري', desc: 'شاهد نتائج كودك البرمجي لحظياً في بيئة ثلاثية الأبعاد تفاعلية.' },
              { icon: <Cpu size={40} />, title: 'ذكاء اصطناعي', desc: 'مساعد ذكي يساعدك في تصحيح الأكواد واقتراح الحلول.' },
              { icon: <Globe size={40} />, title: 'مناهج عربية', desc: 'محتوى تعليمي مصمم خصيصاً للمتعلم العربي.' },
            ].map((feature, idx) => (
              <div key={idx} className="p-10 bg-primary rounded-2xl hover:bg-slate-900 transition-all duration-300 border border-white/5 hover:border-accent/50 group shadow-xl">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                    {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-accent transition-colors">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;