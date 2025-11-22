
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { PRODUCTS } from '../data/products';
import { ArrowRight, ShoppingCart, Check, Star, Shield, Truck, RotateCcw } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const product = PRODUCTS.find((p) => p.id === id);
  const { addToCart } = useCart();

  if (!product) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl text-white font-bold mb-4">المنتج غير موجود</h2>
          <Link to="/store" className="text-accent hover:text-white transition flex items-center justify-center gap-2">
            <ArrowRight size={20} />
            العودة للمتجر
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link to="/store" className="hover:text-white transition">المتجر</Link>
          <span>/</span>
          <span className="text-accent">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden border border-white/10 bg-secondary shadow-2xl">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden border border-white/10 bg-secondary cursor-pointer hover:border-accent transition">
                   <img src={`https://picsum.photos/200/200?random=${product.id}${i}`} alt="" className="w-full h-full object-cover opacity-70 hover:opacity-100 transition" />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-6">
               <span className="inline-block px-3 py-1 rounded-full bg-white/5 text-accent text-xs font-bold mb-4 border border-white/10">
                 {product.category === 'kit' ? 'طقم تعليمي' : product.category === 'sensor' ? 'مستشعر إلكتروني' : 'قطعة غيار'}
               </span>
               <h1 className="text-4xl font-bold text-white mb-4">{product.name}</h1>
               <div className="flex items-center gap-4 mb-4">
                 <div className="flex text-yellow-400">
                    <Star size={18} fill="currentColor" />
                    <Star size={18} fill="currentColor" />
                    <Star size={18} fill="currentColor" />
                    <Star size={18} fill="currentColor" />
                    <Star size={18} fill="currentColor" className="text-gray-600" />
                 </div>
                 <span className="text-gray-400 text-sm">(24 تقييم)</span>
               </div>
               <p className="text-gray-300 text-lg leading-relaxed">{product.description}</p>
            </div>

            <div className="bg-secondary rounded-xl p-6 border border-white/10 mb-8">
               <div className="flex items-center justify-between mb-6">
                  <span className="text-3xl font-bold text-highlight">{product.price} ر.س</span>
                  <span className="text-green-400 flex items-center gap-1 text-sm">
                    <Check size={16} />
                    متوفر في المخزون
                  </span>
               </div>

               <div className="flex gap-4">
                 <div className="flex items-center bg-primary rounded-lg border border-white/10 px-4">
                    <button className="text-gray-400 hover:text-white text-xl font-bold">-</button>
                    <span className="mx-4 text-white font-mono">1</span>
                    <button className="text-gray-400 hover:text-white text-xl font-bold">+</button>
                 </div>
                 <button 
                    onClick={() => addToCart(product)}
                    className="flex-1 bg-accent hover:opacity-90 text-white py-3 px-6 rounded-lg font-bold shadow-lg shadow-accent/20 transition flex items-center justify-center gap-2"
                 >
                    <ShoppingCart size={20} />
                    أضف للسلة
                 </button>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               <div className="flex flex-col items-center text-center p-4 bg-white/5 rounded-xl border border-white/5">
                  <Shield className="text-highlight mb-2" size={24} />
                  <span className="text-white text-sm font-bold">ضمان سنتين</span>
                  <span className="text-gray-500 text-xs">على العيوب المصنعية</span>
               </div>
               <div className="flex flex-col items-center text-center p-4 bg-white/5 rounded-xl border border-white/5">
                  <Truck className="text-highlight mb-2" size={24} />
                  <span className="text-white text-sm font-bold">شحن سريع</span>
                  <span className="text-gray-500 text-xs">خلال 3-5 أيام عمل</span>
               </div>
               <div className="flex flex-col items-center text-center p-4 bg-white/5 rounded-xl border border-white/5">
                  <RotateCcw className="text-highlight mb-2" size={24} />
                  <span className="text-white text-sm font-bold">استرجاع مجاني</span>
                  <span className="text-gray-500 text-xs">خلال 14 يوم</span>
               </div>
            </div>

          </div>
        </div>

        {/* Additional Tabs/Info */}
        <div className="mt-16">
           <div className="border-b border-white/10 flex gap-8 mb-8">
              <button className="pb-4 text-accent font-bold border-b-2 border-accent">الوصف التفصيلي</button>
              <button className="pb-4 text-gray-400 hover:text-white transition">المواصفات التقنية</button>
              <button className="pb-4 text-gray-400 hover:text-white transition">التقييمات</button>
           </div>
           <div className="text-gray-300 leading-relaxed space-y-4">
              <p>
                هذا المنتج مصمم خصيصاً للمبتدئين والمحترفين في مجال الروبوتات. يتميز بجودة تصنيع عالية وتوافق تام مع منصات التحكم الشهيرة مثل الاردوينو والرازبري باي.
              </p>
              <p>
                يحتوي الطقم على جميع الأدوات اللازمة للتركيب والتشغيل، بالإضافة إلى دليل مستخدم شامل باللغة العربية والإنجليزية. سواء كنت طالباً أو هاوياً، سيمنحك هذا المنتج تجربة تعليمية ممتعة وعملية.
              </p>
           </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetails;
