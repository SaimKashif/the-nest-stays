import React from 'react';

interface NestLogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'cream';
  showSubtitle?: boolean;
}

export const NestLogo: React.FC<NestLogoProps> = ({
  className = '',
  variant = 'dark',
  showSubtitle = false,
}) => {
  const isLight = variant === 'light';
  const textColor = isLight ? 'text-white' : 'text-[#173F35]';
  const iconStroke = isLight ? '#F8F6F0' : '#173F35';
  const accentColor = '#C5A572';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Refined Nest & Pine / Mountain geometric icon */}
      <svg
        width="34"
        height="34"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden="true"
      >
        {/* Soft circular foundation */}
        <circle cx="18" cy="18" r="17" stroke={iconStroke} strokeWidth="1.2" strokeOpacity="0.4" />
        {/* Stylized woven nest cradle */}
        <path
          d="M8 20.5C9.5 24.5 13.5 27 18 27C22.5 27 26.5 24.5 28 20.5"
          stroke={iconStroke}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M10.5 23C12.5 25.2 15.2 26.2 18 26.2C20.8 26.2 23.5 25.2 25.5 23"
          stroke={accentColor}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        {/* Peaceful shelter peak / pine crest */}
        <path
          d="M18 9L24.5 18H11.5L18 9Z"
          stroke={iconStroke}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Restrained warm star / ember */}
        <circle cx="18" cy="14.5" r="1.5" fill={accentColor} />
      </svg>

      <div className="flex flex-col">
        <span
          className={`font-serif text-xl sm:text-2xl font-bold tracking-tight leading-none ${textColor}`}
        >
          The Nest Stays
        </span>
        {showSubtitle && (
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#C5A572] font-medium mt-0.5">
            Boutique Lodging
          </span>
        )}
      </div>
    </div>
  );
};
