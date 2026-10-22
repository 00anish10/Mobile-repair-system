import React from 'react';

interface MoonLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark';
  showText?: boolean;
  subtitle?: string;
  className?: string;
  useImageBadge?: boolean;
  onClick?: () => void;
}

// Generated AI Studio brand mark asset
export const MOON_LOGO_IMAGE_URL = '/src/assets/images/moon_mobile_logo_1789270423820.jpg';

export const MoonLogo: React.FC<MoonLogoProps> = ({
  size = 'md',
  variant = 'light',
  showText = true,
  subtitle,
  className = '',
  useImageBadge = true,
  onClick,
}) => {
  const dimensions = {
    sm: { box: 'w-8 h-8', iconSize: 20, title: 'text-lg', sub: 'text-[10px]' },
    md: { box: 'w-10 h-10', iconSize: 26, title: 'text-xl', sub: 'text-[11px]' },
    lg: { box: 'w-12 h-12', iconSize: 32, title: 'text-2xl', sub: 'text-xs' },
    xl: { box: 'w-16 h-16', iconSize: 42, title: 'text-3xl', sub: 'text-sm' },
  }[size];

  const textColor = variant === 'dark' ? 'text-white' : 'text-slate-900';
  const subtitleColor = variant === 'dark' ? 'text-slate-400' : 'text-slate-500';

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick() : undefined}
      className={`flex items-center gap-3 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Unique Logo Emblem: Crescent Moon embracing Smartphone & Repair Trace */}
      <div
        className={`${dimensions.box} relative rounded-xl overflow-hidden shadow-sm flex items-center justify-center shrink-0 border ${
          variant === 'dark' ? 'border-slate-700 bg-slate-900' : 'border-blue-100 bg-white'
        } group-hover:scale-105 transition-all duration-200`}
      >
        {useImageBadge ? (
          <img
            src={MOON_LOGO_IMAGE_URL}
            alt="Moon Mobile Repair Logo"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
        ) : (
          /* Handcrafted Vector SVG Emblem: Crescent Moon + Phone + Circuit/Wrench Spark */
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full p-1"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="moonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#1e3a8a" />
              </linearGradient>
              <linearGradient id="phoneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#cbd5e1" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#2563eb" floodOpacity="0.35" />
              </filter>
            </defs>

            {/* Glowing Crescent Moon */}
            <path
              d="M 68 14 C 42 14 20 34 20 60 C 20 74 27 86 38 94 C 28 88 22 76 22 64 C 22 41 40 23 63 23 C 71 23 79 26 85 30 C 81 20 75 14 68 14 Z"
              fill="url(#moonGrad)"
              filter="url(#glow)"
            />

            {/* Stylized Modern Smartphone Silhouette nestled inside the lunar curve */}
            <rect
              x="42"
              y="28"
              width="36"
              height="58"
              rx="7"
              fill="url(#phoneGrad)"
              stroke="#1e293b"
              strokeWidth="2.5"
            />
            {/* Phone Screen Glass */}
            <rect
              x="45"
              y="33"
              width="30"
              height="48"
              rx="4"
              fill="#0f172a"
            />
            {/* Screen Notch / Speaker */}
            <line x1="56" y1="30.5" x2="64" y2="30.5" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
            {/* Precision Repair Spark / Circuit Star on Screen */}
            <path
              d="M60 49 L62 55 L68 57 L62 59 L60 65 L58 59 L52 57 L58 55 Z"
              fill="#38bdf8"
            />
            <circle cx="60" cy="57" r="1.5" fill="#ffffff" />
          </svg>
        )}
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`font-extrabold ${dimensions.title} tracking-tight ${textColor} leading-tight`}>
              Moon<span className="text-blue-600">Mobile</span>
            </span>
            <span className="hidden sm:inline-flex text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded tracking-wide uppercase">
              Repair
            </span>
          </div>
          <p className={`${dimensions.sub} ${subtitleColor} font-medium tracking-tight`}>
            {subtitle || 'Mobile Phone & Tech Repair'}
          </p>
        </div>
      )}
    </div>
  );
};
