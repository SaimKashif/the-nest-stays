import React from 'react';
import { NestLogo } from './NestLogo.tsx';
import { Phone, Mail, MapPin, MessageSquare, ExternalLink, ShieldCheck, Lock } from 'lucide-react';
import { PropertySettings } from '../types/index.ts';

interface FooterProps {
  settings: PropertySettings | null;
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onNavigate }) => {
  const currentYear = new Date().getFullYear();
  const phone = settings?.phone || '0300 1468362';
  const whatsapp = settings?.whatsapp || '+923001468362';
  const email = settings?.email || 'info@theneststays.pk';
  const address = settings?.address || 'Street Number 3, opposite UCP Mufti Town, near Qalma Chownk, Mufti Colony, Gujranwala, 52250, Pakistan';
  const mapsUrl = settings?.googleMapsUrl || 'https://maps.google.com/?q=Street+Number+3+opposite+UCP+Mufti+Town+near+Qalma+Chownk+Mufti+Colony+Gujranwala+52250+Pakistan';

  return (
    <footer className="bg-[#173F35] text-[#F8F6F0] border-t border-[#173F35]/30 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Column 1: Brand & Ethos */}
          <div className="space-y-4">
            <NestLogo variant="light" showSubtitle />
            <p className="text-sm text-[#F8F6F0]/80 leading-relaxed pt-2">
              Where Comfort Meets Care. A welcoming, peaceful guest-house accommodation in Gujranwala with verified tariffs and attentive care.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-[#C5A572]">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Standard Room: PKR 5,000 / night (Taxes included)</span>
            </div>
          </div>

          {/* Column 2: Navigation & Stays */}
          <div>
            <h4 className="font-serif text-lg text-white mb-4 tracking-wide">Explore Stays</h4>
            <ul className="space-y-2.5 text-sm text-[#F8F6F0]/80">
              <li>
                <button
                  onClick={() => onNavigate('/')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Home & Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/rooms')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Standard Room & Rates
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/menu')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Food Menu & Refreshments
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/book')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Check Availability & Book
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/booking-status')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Verify Booking / Payment Status
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/about')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Guest Policies & House Rules
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Direct Inquiries */}
          <div>
            <h4 className="font-serif text-lg text-white mb-4 tracking-wide">Direct Contact</h4>
            <ul className="space-y-3 text-sm text-[#F8F6F0]/85">
              <li>
                <a
                  href={`tel:${phone.replace(/\s+/g, '')}`}
                  className="flex items-center gap-2.5 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#C5A572] shrink-0" />
                  <span>{phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 hover:text-white transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-[#25D366] shrink-0" />
                  <span>WhatsApp: {whatsapp}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-2.5 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4 text-[#C5A572] shrink-0" />
                  <span>{email}</span>
                </a>
              </li>
              <li className="flex items-start gap-2.5 pt-1 text-xs text-[#F8F6F0]/70 leading-relaxed">
                <MapPin className="w-4 h-4 text-[#C5A572] shrink-0 mt-0.5" />
                <div>
                  <span>{address}</span>
                  <div className="mt-1">
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[#C5A572] hover:underline"
                    >
                      <span>Get Directions on Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          {/* Column 4: Enabled Payment Options */}
          <div>
            <h4 className="font-serif text-lg text-white mb-4 tracking-wide">Payment Methods</h4>
            <p className="text-xs text-[#F8F6F0]/75 mb-3 leading-relaxed">
              We support transparent manual payments without card transaction fees:
            </p>
            <div className="space-y-2 text-xs text-[#F8F6F0]/90">
              {settings?.paymentConfig.allowPayAtProperty && (
                <div className="flex items-center gap-2 p-2 bg-[#0f2c25] rounded-md border border-white/5">
                  <span className="font-medium">Cash on Arrival</span>
                  <span className="text-[#F8F6F0]/60 text-[11px]">(Pay at Property)</span>
                </div>
              )}
              {settings?.paymentConfig.bank.enabled && (
                <div className="flex items-center gap-2 p-2 bg-[#0f2c25] rounded-md border border-white/5">
                  <span className="font-medium">Direct Bank Transfer</span>
                  <span className="text-[#C5A572] text-[11px]">{settings.paymentConfig.bank.bankName}</span>
                </div>
              )}
              {settings?.paymentConfig.jazzCash.enabled && (
                <div className="flex items-center gap-2 p-2 bg-[#0f2c25] rounded-md border border-white/5">
                  <span className="font-medium">JazzCash</span>
                  <span className="text-[#F8F6F0]/60 text-[11px]">Mobile Account / Till</span>
                </div>
              )}
              {settings?.paymentConfig.easypaisa.enabled && (
                <div className="flex items-center gap-2 p-2 bg-[#0f2c25] rounded-md border border-white/5">
                  <span className="font-medium">Easypaisa</span>
                  <span className="text-[#F8F6F0]/60 text-[11px]">Mobile Account</span>
                </div>
              )}
            </div>
            <p className="text-[11px] text-[#F8F6F0]/50 mt-3">
              Check-in: {settings?.checkInTime || '14:00'} · Check-out: {settings?.checkOutTime || '11:30 AM'}
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-[#F8F6F0]/60 gap-4">
          <div>
            © {currentYear} The Nest Stays. All rights reserved. Guest house accommodations in Pakistan.
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate('/about')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Policies & House Rules
            </button>
            <button
              onClick={() => onNavigate('/contact')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Contact
            </button>
            <button
              onClick={() => onNavigate('/admin')}
              className="flex items-center gap-1.5 text-[#C5A572] hover:text-white transition-colors cursor-pointer font-medium"
            >
              <Lock className="w-3 h-3" />
              <span>Owner Portal</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
