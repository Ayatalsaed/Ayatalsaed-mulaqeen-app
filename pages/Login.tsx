
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, Mail, ArrowRight, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '' });

  // Redirect to profile automatically when user is authenticated
  useEffect(() => {
    if (user) {
      navigate('/profile');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // محاكاة بسيطة وسريعة جداً
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // استخراج الاسم من البريد للدخول المباشر
    const name = formData.email.split('@')[0];
    
    login(name, formData.email);
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
          <h2 className="text-3xl font-bold text-white">تسجيل دخول مباشر</h2>
          <p className="mt-2 text-sm text-gray-400">
            الدخول متاح للجميع بدون كلمة مرور
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
                البريد الإلكتروني (لتعريف الحساب فقط)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="text" 
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pr-10 bg-primary border border-white/10 rounded-lg py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent sm:text-sm transition"
                  placeholder="name@example.com"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              * لا يلزم كلمة مرور
            </div>
            <div className="text-sm">
              <Link to="/register" className="font-medium text-highlight hover:text-accent transition">
                إنشاء حساب جديد
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-accent hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent shadow-lg shadow-accent/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <RefreshCw className="animate-spin" size={20} /> : (
                <>
                  الدخول الآن
                  <ArrowRight className="absolute left-4 top-3.5" size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
