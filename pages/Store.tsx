
import React, { useState } from 'react';
import { ShoppingCart, Plus, Search, Filter, X, DollarSign, Eye, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { PRODUCTS } from '../data/products';
import { Product } from '../types';

// --- Reusable Tooltip Component ---
interface TooltipProps {
  text: string;
  className?: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ children, text, className = "" }) => (
  <div className={`group/tooltip relative flex flex-col items-center justify-center ${className}`}>
    {children}
    <div className="pointer-events-none absolute bottom-full mb-2 w-max max-w-[150px] opacity-0 transition-opacity duration-300 group-hover/tooltip:opacity-100 z-50 text-center">
      <div className="bg-slate-900/95 backdrop-blur text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-xl border border-white/10">
        {text}
      </div>
      <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-slate-900/95 mx-auto"></div>
    </div>
  </div>
);

const Store: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<('kit' | 'sensor' | 'part')[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'price_asc' | 'price_desc'>('relevance');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const { addToCart, cartCount } = useCart();

  const priceRanges = [
    { id: 'all', label: 'الكل', min: 0, max: Infinity },
    { id: 'low', label: 'أقل من 100 ر.س', min: 0, max: 100 },
    { id: 'mid', label: '100 - 300 ر.س', min: 100, max: 300 },
    { id: 'high', label: 'أكثر من 300 ر.س', min: 300, max: Infinity },
  ];

  const filteredProducts = PRODUCTS.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.trim().toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
    
    const range = priceRanges.find(r => r.id === selectedPriceRange);
    const matchesPrice = range ? (product.price >= range.min && product.price < range.max) : true;

    return matchesSearch && matchesCategory && matchesPrice;
  }).sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    return 0; // relevance/default
  });

  const categories = [
    { id: 'kit', label: 'أطقم كاملة' },
    { id: 'sensor', label: 'مستشعرات' },
    { id: 'part', label: 'قطع غيار' },
  ];

  const toggleCategory = (id: 'kit' | 'sensor' | 'part') => {
      setSelectedCategories(prev => 
        prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
      );
  };

  return (
    <div className="min-h-screen bg-primary py-12 font-['Tajawal']">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6 border-b border-white/5 pb-8">
          <div className="w-full md:w-auto">
            <h1 className="text-4xl font-bold text-white mb-3">متجر الروبوتات</h1>
            <p className="text-gray-400 text-lg font-light">أحدث المعدات والقطع لبناء مشروعك القادم باحترافية</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
             <div className="flex items-center gap-2 w-full sm:w-auto">
                <Tooltip text="ترتيب المنتجات حسب السعر أو الحداثة">
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-secondary border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-accent cursor-pointer appearance-none"
                  >
                      <option value="relevance">ترتيب حسب: الأحدث</option>
                      <option value="price_asc">السعر: من الأقل للأعلى</option>
                      <option value="price_desc">السعر: من الأعلى للأقل</option>
                  </select>
                </Tooltip>
             </div>

            <div className="relative w-full sm:w-72 group">
                <input 
                    type="text" 
                    placeholder="ابحث عن منتج..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-secondary/50 backdrop-blur border border-white/10 rounded-xl py-3 pr-10 pl-10 text-white focus:border-accent focus:outline-none text-sm transition-all focus:bg-white/5 shadow-inner group-hover:border-white/20"
                />
                <Search className="absolute right-3 top-3 text-gray-500 group-hover:text-accent transition-colors" size={18} />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute left-3 top-3 text-gray-500 hover:text-white transition-colors"
                  >
                    <Tooltip text="مسح البحث">
                       <X size={18} />
                    </Tooltip>
                  </button>
                )}
            </div>

            <Tooltip text="عرض سلة المشتريات">
              <button className="w-full sm:w-auto bg-accent hover:bg-indigo-600 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-accent/10 hover:shadow-accent/30 hover:-translate-y-0.5 whitespace-nowrap font-bold">
                <ShoppingCart size={20} />
                <span>السلة ({cartCount})</span>
              </button>
            </Tooltip>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
             
             {/* Category Filter */}
             <div className="bg-white/5 backdrop-blur-2xl rounded-2xl p-6 border border-white/5 shadow-xl">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-lg">
                   <Filter size={20} className="text-accent" />
                   التصنيفات
                </h3>
                <div className="space-y-2">
                  {categories.map(cat => (
                    <Tooltip key={cat.id} text={`تصفية حسب: ${cat.label}`} className="w-full">
                      <button
                        onClick={() => toggleCategory(cat.id as any)}
                        className={`w-full text-right px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-between group
                          ${selectedCategories.includes(cat.id as any) 
                            ? 'bg-highlight/10 text-highlight border border-highlight/20 shadow-lg shadow-highlight/5' 
                            : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                          }
                        `}
                      >
                        {cat.label}
                        {selectedCategories.includes(cat.id as any) && <Check size={16} className="text-highlight" />}
                      </button>
                    </Tooltip>
                  ))}
                </div>
             </div>

             {/* Price Filter */}
             <div className="bg-white/5 backdrop-blur-2xl rounded-2xl p-6 border border-white/5 shadow-xl">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-lg">
                   <DollarSign size={20} className="text-accent" />
                   السعر
                </h3>
                <div className="space-y-2">
                  {priceRanges.map(range => (
                    <Tooltip key={range.id} text={`عرض المنتجات: ${range.label}`} className="w-full">
                      <button
                        onClick={() => setSelectedPriceRange(range.id)}
                        className={`w-full text-right px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-between group
                          ${selectedPriceRange === range.id 
                            ? 'bg-accent/10 text-accent border border-accent/20 shadow-lg shadow-accent/5' 
                            : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                          }
                        `}
                      >
                        {range.label}
                        {selectedPriceRange === range.id && <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>}
                      </button>
                    </Tooltip>
                  ))}
                </div>
             </div>

          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <Link to={`/store/product/${product.id}`} key={product.id} className="block group relative h-full">
                    
                    {/* Card Container with Enhanced Glassmorphism */}
                    <div className="relative h-full flex flex-col bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/10 transition-all duration-500 hover:border-accent hover:shadow-[0_10px_40px_-10px_rgba(99,102,241,0.25)] hover:-translate-y-2 overflow-hidden hover:scale-[1.02]">
                      
                      {/* Image Area */}
                      <div className="relative h-64 overflow-hidden bg-secondary/50">
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-60 z-10"></div>
                        
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                        
                        {/* Category Badge */}
                        <div className="absolute top-3 right-3 z-20">
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/10 shadow-lg
                            ${product.category === 'kit' ? 'bg-purple-500/90 text-white' : 
                              product.category === 'sensor' ? 'bg-sky-500/90 text-white' : 
                              'bg-slate-600/90 text-white'}
                          `}>
                            {product.category === 'kit' ? 'طقم' : product.category === 'sensor' ? 'مستشعر' : 'قطع'}
                          </span>
                        </div>

                        {/* Quick View Button - Enhanced Animation + Tooltip */}
                        <Tooltip 
                          text="نظرة سريعة" 
                          className="absolute top-3 left-3 z-20 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300"
                        >
                          <button 
                                onClick={(e) => {
                                  e.preventDefault();
                                  setQuickViewProduct(product);
                                }}
                                className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl flex items-center justify-center hover:bg-accent hover:border-accent transition-colors"
                             >
                                <Eye size={18} />
                          </button>
                        </Tooltip>
                      </div>

                      {/* Content Area */}
                      <div className="p-6 flex flex-col flex-1 relative z-10">
                        {/* Title */}
                        <h3 className="text-2xl font-black text-white mb-2 group-hover:text-accent transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                        
                        {/* Description */}
                        <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 mb-6 flex-1">
                          {product.description}
                        </p>
                        
                        {/* Footer - Price & Add Button */}
                        <div className="flex items-end justify-between mt-auto pt-4 border-t border-white/5 group-hover:border-white/10 transition-colors">
                          <div className="flex flex-col">
                             <span className="text-[10px] text-slate-500 font-bold mb-0.5">السعر</span>
                             <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-extrabold text-white group-hover:text-highlight transition-colors">{product.price}</span>
                                <span className="text-xs text-accent font-bold">ر.س</span>
                             </div>
                          </div>
                          
                          <Tooltip text="أضف للسلة">
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                addToCart(product);
                              }}
                              className="w-12 h-12 rounded-xl bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/20 hover:bg-indigo-600 hover:scale-110 hover:rotate-3 transition-all duration-300"
                            >
                              <ShoppingCart size={20} />
                            </button>
                          </Tooltip>
                        </div>
                      </div>
                      
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-secondary/30 backdrop-blur-xl rounded-2xl border border-white/5 flex flex-col items-center justify-center h-96">
                 <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 text-slate-600 animate-pulse">
                    <Search size={40} />
                 </div>
                 <h3 className="text-2xl font-bold text-white mb-2">لا توجد نتائج</h3>
                 <p className="text-slate-400 max-w-xs mx-auto mb-6 text-sm">
                   لم نعثر على منتجات تطابق بحثك. جرب تغيير كلمات البحث أو التصنيف.
                 </p>
                 <Tooltip text="إلغاء جميع الفلاتر">
                   <button onClick={() => {setSearchTerm(''); setSelectedCategories([]); setSelectedPriceRange('all');}} className="text-accent hover:text-white font-bold text-sm border-b border-accent/50 pb-0.5 hover:border-white transition">
                      إعادة ضبط الفلاتر
                   </button>
                 </Tooltip>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setQuickViewProduct(null)}>
              <div 
                  className="bg-secondary border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col md:flex-row animate-scale-up"
                  onClick={(e) => e.stopPropagation()}
              >
                  <Tooltip text="إغلاق" className="absolute top-4 right-4 z-20">
                      <button 
                          onClick={() => setQuickViewProduct(null)}
                          className="text-gray-400 hover:text-white bg-black/20 p-2 rounded-full hover:bg-black/40 transition"
                      >
                          <X size={20} />
                      </button>
                  </Tooltip>

                  <div className="w-full md:w-1/2 h-64 md:h-auto bg-primary/50 relative group overflow-hidden">
                       <img 
                          src={quickViewProduct.image} 
                          alt={quickViewProduct.name} 
                          className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></div>
                  </div>

                  <div className="w-full md:w-1/2 p-8 flex flex-col bg-secondary">
                       <div className="flex items-center gap-2 mb-4">
                           <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-white/10
                                ${quickViewProduct.category === 'kit' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 
                                quickViewProduct.category === 'sensor' ? 'bg-sky-500/20 text-sky-400 border-sky-500/30' : 
                                'bg-slate-500/20 text-slate-400'}
                            `}>
                                {quickViewProduct.category === 'kit' ? 'طقم تعليمي' : quickViewProduct.category === 'sensor' ? 'مستشعر' : 'قطع غيار'}
                           </span>
                       </div>
                       
                       <h2 className="text-3xl font-bold text-white mb-4">{quickViewProduct.name}</h2>
                       
                       <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/5">
                           <div className="flex items-baseline gap-1">
                               <span className="text-4xl font-extrabold text-highlight">{quickViewProduct.price}</span>
                               <span className="text-sm text-gray-400 font-bold">ر.س</span>
                           </div>
                           <div className="flex items-center gap-2 text-green-400 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                               <Check size={14} />
                               <span className="text-xs font-bold">متوفر للتسليم</span>
                           </div>
                       </div>

                       <p className="text-gray-300 text-sm leading-relaxed mb-8 flex-1">
                          {quickViewProduct.description}
                          <br /><br />
                          منتج أصلي عالي الجودة مع ضمان شامل ودعم فني متميز.
                       </p>

                       <div className="flex gap-3 mt-auto">
                          <Tooltip text="أضف للسلة" className="flex-1">
                              <button 
                                  onClick={() => {
                                      addToCart(quickViewProduct);
                                      setQuickViewProduct(null);
                                  }}
                                  className="w-full bg-accent hover:bg-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-accent/20 transition flex items-center justify-center gap-2"
                              >
                                  <ShoppingCart size={20} />
                                  أضف للسلة
                              </button>
                          </Tooltip>
                          <Tooltip text="التفاصيل الكاملة">
                              <Link 
                                  to={`/store/product/${quickViewProduct.id}`}
                                  className="h-full px-5 py-3.5 rounded-xl border border-white/10 hover:bg-white/5 text-white transition flex items-center justify-center font-bold text-sm"
                              >
                                  التفاصيل
                              </Link>
                          </Tooltip>
                       </div>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default Store;
