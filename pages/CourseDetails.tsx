
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { COURSES } from './Courses';
import { ArrowRight, Clock, BookOpen, PlayCircle, Award, Check, Video, FileText, Users } from 'lucide-react';

const CourseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const course = COURSES.find((c) => c.id === id);

  if (!course) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl text-white font-bold mb-4">الدورة غير موجودة</h2>
          <Link to="/courses" className="text-accent hover:text-white transition flex items-center justify-center gap-2">
            <ArrowRight size={20} />
            العودة للدورات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary font-['Tajawal']">
      {/* Hero Header */}
      <div className="relative h-[400px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary z-10"></div>
        <div className="absolute inset-0 bg-black/60 z-0"></div>
        <img src={course.image} alt={course.title} className="w-full h-full object-cover blur-sm scale-105" />
        
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold text-white border border-white/20 backdrop-blur-md mb-6
               ${course.level === 'beginner' ? 'bg-emerald-600/80' : course.level === 'intermediate' ? 'bg-accent/80' : 'bg-red-500/80'}
            `}>
              {course.level === 'beginner' ? 'مستوى مبتدئ' : course.level === 'intermediate' ? 'مستوى متوسط' : 'مستوى متقدم'}
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">{course.title}</h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto mb-8">{course.description}</p>
            
            <div className="flex flex-wrap justify-center gap-6 text-gray-300">
              <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-lg border border-white/10">
                <Clock size={18} className="text-accent" />
                <span>{course.duration} من المحتوى</span>
              </div>
              <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-lg border border-white/10">
                <BookOpen size={18} className="text-highlight" />
                <span>{course.lessons} دروس مسجلة</span>
              </div>
              <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-lg border border-white/10">
                <Users size={18} className="text-green-400" />
                <span>120+ طالب مسجل</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            
            <div className="bg-secondary rounded-2xl p-8 border border-white/5 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Award className="text-accent" />
                ماذا ستتعلم؟
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  'فهم أساسيات الروبوت وهيكليته',
                  'كتابة الأكواد البرمجية بلغة بايثون',
                  'التعامل مع الحساسات والمحركات',
                  'حل المشكلات البرمجية وتصحيح الأخطاء',
                  'بناء مشروع كامل من الصفر'
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 bg-green-500/10 p-1 rounded text-green-500">
                      <Check size={14} />
                    </div>
                    <span className="text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-secondary rounded-2xl p-8 border border-white/5">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <FileText className="text-highlight" />
                محتوى الدورة
              </h2>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((lesson) => (
                  <div key={lesson} className="group flex items-center justify-between p-4 rounded-xl bg-primary border border-white/5 hover:border-accent/50 transition cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-accent group-hover:bg-accent/10 transition">
                        <Video size={20} />
                      </div>
                      <div>
                        <h3 className="text-white font-bold group-hover:text-accent transition">الدرس {lesson}: مقدمة في الروبوتات</h3>
                        <span className="text-xs text-gray-500">15 دقيقة</span>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-gray-500">
                      <PlayCircle size={16} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-secondary rounded-2xl border border-white/10 p-6 sticky top-24 shadow-2xl shadow-black/50">
              <div className="text-3xl font-bold text-white mb-2">
                {course.price === 'free' ? <span className="text-emerald-400">مجاناً</span> : <span className="text-highlight">{course.price} ر.س</span>}
              </div>
              <p className="text-gray-400 text-sm mb-6">شامل ضريبة القيمة المضافة</p>
              
              <button className="w-full bg-accent hover:bg-[#b5952f] text-white font-bold py-4 rounded-xl mb-4 transition shadow-lg shadow-accent/20 flex items-center justify-center gap-2 text-lg">
                {course.price === 'free' ? 'ابدأ التعلم الآن' : 'شراء الدورة'}
                <ArrowRight size={20} />
              </button>
              
              <p className="text-center text-xs text-gray-500 mb-6">ضمان استرداد الأموال لمدة 30 يوم</p>
              
              <div className="space-y-4 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">المستوى</span>
                  <span className="text-white font-bold">
                     {course.level === 'beginner' ? 'مبتدئ' : course.level === 'intermediate' ? 'متوسط' : 'متقدم'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">اللغة</span>
                  <span className="text-white font-bold">العربية</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">الشهادة</span>
                  <span className="text-white font-bold">نعم، معتمدة</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">الوصول</span>
                  <span className="text-white font-bold">مدى الحياة</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
