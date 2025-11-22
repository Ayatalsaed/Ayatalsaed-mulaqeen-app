import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className = "", size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-5xl'
  };

  return (
    <div className={`font-bold flex items-center gap-2 ${className}`}>
      <div className="relative">
         {/* Abstract representation of the calligraphy logo mark */}
         <svg width={size === 'sm' ? 30 : size === 'md' ? 40 : 60} height={size === 'sm' ? 30 : size === 'md' ? 40 : 60} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M85 20C85 20 70 15 60 35C50 55 40 80 20 80C10 80 5 70 15 60C25 50 35 45 40 45" stroke="#6366f1" strokeWidth="6" strokeLinecap="round" />
            <path d="M45 35C45 35 50 25 60 25C70 25 75 30 75 40" stroke="#f8fafc" strokeWidth="5" strokeLinecap="round" />
            <circle cx="50" cy="20" r="4" fill="#38bdf8" />
            <circle cx="65" cy="15" r="4" fill="#6366f1" />
         </svg>
      </div>
      <div className="flex flex-col">
        <span className={`${sizeClasses[size]} leading-none tracking-wide text-white font-['Tajawal'] font-extrabold`}>
          مُلَقّن
        </span>
        {size !== 'sm' && (
          <span className="text-[0.6rem] tracking-[0.2em] text-highlight uppercase font-latin font-bold mt-0.5">
            Mulaqqen
          </span>
        )}
      </div>
    </div>
  );
};

export default Logo;