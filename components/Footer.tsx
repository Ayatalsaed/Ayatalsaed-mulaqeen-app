import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Facebook, Mail, MapPin, Phone } from 'lucide-react';
import Logo from './Logo';

const Footer: React.FC = () => {
  return (
    <footer className="bg-secondary border-t border-white/5 pt-16 pb-8 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Company Info */}
          <div className="space-y-6">
            <Logo size="md" />
            <p className="text-sm leading-loose text-gray-400">
              منصتك الأولى لتعلم برمجة الروبوتات باللغة العربية. نجمع بين المحاكاة الواقعية والتعليم النظري لبناء جيل المستقبل.
            </p>
            <div className="flex space-x-4 space-x-reverse">
              <a href="#" className="text-gray-400 hover:text-highlight transition transform hover:scale-110"><Twitter size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-highlight transition transform hover:scale-110"><Github size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-highlight transition transform hover:scale-110"><Facebook size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-bold mb-6 font-['Tajawal'] border-b border-accent/30 pb-2 w-fit">روابط سريعة</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/about" className="hover:text-highlight transition duration-300 flex items-center gap-2"><span className="w-1.5 h-1.5 bg-accent rounded-full"></span>عن مُلَقّن</Link></li>
              <li><Link to="/courses" className="hover:text-highlight transition duration-300 flex items-center gap-2"><span className="w-1.5 h-1.5 bg-accent rounded-full"></span>الدورات التدريبية</Link></li>
              <li><Link to="/store" className="hover:text-highlight transition duration-300 flex items-center gap-2"><span className="w-1.5 h-1.5 bg-accent rounded-full"></span>المتجر</Link></li>
              <li><Link to="/simulator" className="hover:text-highlight transition duration-300 flex items-center gap-2"><span className="w-1.5 h-1.5 bg-accent rounded-full"></span>المحاكي</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white text-lg font-bold mb-6 font-['Tajawal'] border-b border-accent/30 pb-2 w-fit">الدعم والمساعدة</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/support" className="hover:text-highlight transition duration-300 flex items-center gap-2"><span className="w-1.5 h-1.5 bg-accent rounded-full"></span>مركز المساعدة</Link></li>
              <li><Link to="/support" className="hover:text-highlight transition duration-300 flex items-center gap-2"><span className="w-1.5 h-1.5 bg-accent rounded-full"></span>الأسئلة الشائعة</Link></li>
              <li><Link to="/docs" className="hover:text-highlight transition duration-300 flex items-center gap-2"><span className="w-1.5 h-1.5 bg-accent rounded-full"></span>الوثائق التقنية</Link></li>
              <li><Link to="/support" className="hover:text-highlight transition duration-300 flex items-center gap-2"><span className="w-1.5 h-1.5 bg-accent rounded-full"></span>اتصل بنا</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white text-lg font-bold mb-6 font-['Tajawal'] border-b border-accent/30 pb-2 w-fit">تواصل معنا</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3 group">
                <MapPin size={18} className="text-accent mt-1 group-hover:text-highlight transition" />
                <span className="group-hover:text-white transition">الرياض، المملكة العربية السعودية</span>
              </li>
              <li className="flex items-center gap-3 group">
                <Mail size={18} className="text-accent group-hover:text-highlight transition" />
                <span className="group-hover:text-white transition font-latin">contact@mulaqqen.com</span>
              </li>
              <li className="flex items-center gap-3 group">
                <Phone size={18} className="text-accent group-hover:text-highlight transition" />
                <span className="group-hover:text-white transition font-latin">+966 50 000 0000</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/5 mt-16 pt-8 text-center text-xs text-gray-500 flex flex-col md:flex-row justify-between items-center">
          <p className="font-latin mb-2 md:mb-0">&copy; {new Date().getFullYear()} Mulaqqen. All rights reserved.</p>
          <div className="flex gap-6">
             <a href="#" className="hover:text-highlight transition">سياسة الخصوصية</a>
             <a href="#" className="hover:text-highlight transition">شروط الاستخدام</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;