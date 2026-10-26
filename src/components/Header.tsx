import React, { useState } from 'react';
import { NestLogo } from './NestLogo.tsx';
import { Menu, X, Calendar, Phone, MessageSquare } from 'lucide-react';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onBookNowClick: () => void;
  phone?: string;
  whatsapp?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentPath,
  onNavigate,
  onBookNowClick,
  phone = '0300 1468362',
  whatsapp = '+923001468362',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Rooms', path: '/rooms' },
    { label: 'Menu & Dining', path: '/menu' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
    { label: 'Booking Status', path: '/booking-status' },
  ];

  const handleNav = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F8F6F0]/95 backdrop-blur-md border-b border-[#252A27]/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-8">
          {/* Zone 1: Single Brand element */}
          <button
            onClick={() => handleNav('/')}
            className="flex items-center gap-2 cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#173F35] rounded-md"
            aria-label="The Nest Stays - Home"
          >
            <NestLogo variant="dark" />
          </button>

          {/* Zone 2: 4-5 Clean single-line nav links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#252A27]/80">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => handleNav(link.path)}
                  className={`relative py-1 cursor-pointer transition-colors whitespace-nowrap shrink-0 hover:text-[#173F35] ${
                    isActive
                      ? 'text-[#173F35] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#173F35]'
                      : ''
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary CTA button */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onBookNowClick}
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#173F35] hover:bg-[#1f5245] active:bg-[#0f2c25] rounded-lg transition-colors shadow-sm whitespace-nowrap cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A572]"
            >
              <Calendar className="w-4 h-4 text-[#C5A572]" />
              <span>Book Your Room</span>
            </button>

            {/* Mobile menu toggle button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#252A27] hover:text-[#173F35] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#173F35] rounded-lg"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#252A27]/10 bg-[#F8F6F0] px-4 pt-4 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => handleNav(link.path)}
                className={`text-left px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                  currentPath === link.path
                    ? 'bg-[#173F35] text-white'
                    : 'text-[#252A27] hover:bg-[#DCE5DC]/50'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="pt-2 border-t border-[#252A27]/10 flex flex-col gap-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onBookNowClick();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#173F35] text-white font-medium rounded-lg text-center"
            >
              <Calendar className="w-4 h-4 text-[#C5A572]" />
              Book Your Room
            </button>

            <div className="flex items-center justify-between text-xs text-[#252A27]/70 pt-2 px-1">
              <a
                href={`tel:${phone.replace(/\s+/g, '')}`}
                className="flex items-center gap-1.5 hover:text-[#173F35]"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{phone}</span>
              </a>
              <a
                href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-[#173F35] font-medium"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
