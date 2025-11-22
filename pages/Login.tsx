
import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, Mail, Lock, ArrowRight } from 'lucide-react';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-highlight/10 rounded-full blur-3xl"></div>

      <div className="max-w-md w-full space-y-8 bg-secondary p-10 rounded-3xl border border-white/5 shadow-2xl relative z-10">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center justify-center text-accent mb-6">
             <Bot size={48} />
          </Link>
          <h2 className="text-3xl font-bold text-white">مرحباً بعودتك</h2>
          <p className="mt-2 text-sm text-gray-400">
            ليس لديك حساب؟{' '}
            <Link to="/register" className="font-medium text-highlight hover:text-accent transition">
              أنشئ حساباً جديداً
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full pr-10 bg-primary border border-white/10 rounded-lg py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent sm:text-sm transition"
                  placeholder="name@example.com"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">
                كلمة المرور
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full pr-10 bg-primary border border-white/10 rounded-lg py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent sm:text-sm transition"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-accent focus:ring-accent border-gray-600 rounded bg-primary"
              />
              <label htmlFor="remember-me" className="mr-2 block text-sm text-gray-400">
                تذكرني
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-highlight hover:text-accent transition">
                نسيت كلمة المرور؟
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-accent hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent shadow-lg shadow-accent/20 transition"
            >
              تسجيل الدخول
              <ArrowRight className="absolute left-4 top-3.5" size={16} />
            </button>
          </div>

          <div className="relative">
             <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
             </div>
             <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-secondary text-gray-500">أو سجل الدخول باستخدام</span>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <button type="button" className="flex justify-center items-center py-2.5 border border-white/10 rounded-lg hover:bg-white/5 transition">
                <span className="text-white text-sm font-medium">Google</span>
             </button>
             <button type="button" className="flex justify-center items-center py-2.5 border border-white/10 rounded-lg hover:bg-white/5 transition">
                <span className="text-white text-sm font-medium">GitHub</span>
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
