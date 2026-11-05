import React from 'react';
import { PropertySettings } from '../types/index.ts';
import { ShieldCheck, Clock, FileText, CheckCircle2, HeartHandshake } from 'lucide-react';

interface AboutPageProps {
  settings: PropertySettings | null;
  onNavigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ settings, onNavigate }) => {
  const policies = settings?.policies || {
    cancellation:
      'Free cancellation up to 72 hours before check-in. Cancellations within 72 hours are subject to a 50% charge of the advance deposit. No-shows are non-refundable.',
    payment:
      'A 50% advance deposit is required to confirm advance reservations. For Pay at Property bookings, room availability is reserved pending owner confirmation. Manual transfers must be verified by the owner.',
    houseRules: [
      'Quiet hours from 10:30 PM to 07:00 AM',
      'Non-smoking rooms (designated outdoor patio smoking allowed)',
      'Valid CNIC / Passport required at check-in for all adult guests',
      'Outside guests not permitted past 9:00 PM without prior approval',
      'Pets are allowed only in designated ground-level patio rooms by request',
    ],
  };

  return (
    <div className="bg-[#F8F6F0] min-h-screen py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Story & Heritage */}
        <section className="bg-white rounded-2xl p-6 sm:p-10 border border-[#252A27]/10 shadow-sm">
          <div className="text-xs uppercase tracking-[0.2em] text-[#C5A572] font-semibold mb-2">
            Our Story
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#173F35] tracking-tight mb-6">
            About The Nest Stays
          </h1>

          <div className="space-y-4 text-sm sm:text-base text-[#252A27]/85 leading-relaxed font-light">
            <p>
              The Nest Stays — <em>Where Comfort Meets Care</em> — was established to provide visitors, students, and traveling professionals with a clean, peaceful, and welcoming guest-house experience in Gujranwala.
            </p>
            <p>
              Conveniently located on Street Number 3, opposite the University of Central Punjab (UCP) Mufti Town, near Qalma Chownk in Mufti Colony, Gujranwala (Postal Code 52250), our accommodations provide a quiet sanctuary away from bustling city traffic while keeping key educational and commercial hubs easily accessible.
            </p>
            <p>
              Every room is equipped with individual air conditioning, high-speed Wi-Fi, modern Smart TV, fresh linens, toiletries, and attentive housekeeping. Our transparent tariff of PKR 5,000 includes all applicable taxes with zero hidden surprises.
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-[#252A27]/10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="p-4 bg-[#F8F6F0] rounded-xl">
              <span className="block font-serif text-2xl font-bold text-[#173F35]">PKR 5,000</span>
              <span className="text-xs text-[#252A27]/70">Standard Room (Taxes Included)</span>
            </div>
            <div className="p-4 bg-[#F8F6F0] rounded-xl">
              <span className="block font-serif text-2xl font-bold text-[#173F35]">Fresh Dining</span>
              <span className="text-xs text-[#252A27]/70">Breakfast, Lunch & Dinner Menu</span>
            </div>
            <div className="p-4 bg-[#F8F6F0] rounded-xl">
              <span className="block font-serif text-2xl font-bold text-[#173F35]">2:00 PM / 12:00 PM</span>
              <span className="text-xs text-[#252A27]/70">Standard Check-In / Check-Out</span>
            </div>
          </div>
        </section>

        {/* Guest Policies & House Rules */}
        <section className="bg-white rounded-2xl p-6 sm:p-10 border border-[#252A27]/10 shadow-sm space-y-8">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-[#C5A572] font-semibold mb-1">
              Guest Guidelines
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#173F35]">
              Stay Policies & House Rules
            </h2>
            <p className="text-xs sm:text-sm text-[#252A27]/70 mt-1">
              To ensure every guest enjoys peace and safety, we kindly ask all visitors to observe these guidelines.
            </p>
          </div>

          {/* Timings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#F8F6F0] border border-[#252A27]/10 text-xs sm:text-sm">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-[#173F35] shrink-0" />
              <div>
                <span className="text-[#252A27]/60 block text-xs">Standard Check-In</span>
                <strong className="text-[#173F35]">{settings?.checkInTime || '2:00 PM'}</strong>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-[#173F35] shrink-0" />
              <div>
                <span className="text-[#252A27]/60 block text-xs">Standard Check-Out</span>
                <strong className="text-[#173F35]">{settings?.checkOutTime || '12:00 PM'}</strong>
              </div>
            </div>
          </div>

          {/* House Rules */}
          <div>
            <h3 className="font-serif text-xl font-bold text-[#173F35] mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#C5A572]" />
              <span>House Rules</span>
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm text-[#252A27]/85">
              {policies.houseRules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#173F35] shrink-0 mt-0.5" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cancellation Policy */}
          <div className="border-t border-[#252A27]/10 pt-6">
            <h3 className="font-serif text-xl font-bold text-[#173F35] mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#C5A572]" />
              <span>Cancellation & Refund Policy</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#252A27]/80 leading-relaxed font-light">
              {policies.cancellation}
            </p>
          </div>

          {/* Payment & Verification Policy */}
          <div className="border-t border-[#252A27]/10 pt-6">
            <h3 className="font-serif text-xl font-bold text-[#173F35] mb-2 flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-[#C5A572]" />
              <span>Payment & Verification Policy</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#252A27]/80 leading-relaxed font-light mb-3">
              {policies.payment}
            </p>
            <p className="text-xs text-[#252A27]/70 leading-relaxed bg-[#EEF3EE] p-3 rounded-lg">
              <strong>Notice:</strong> For direct bank transfers, JazzCash, or Easypaisa advance deposits, guests must submit their transaction reference number. Reservations are confirmed once our management independently verifies receipt of funds in the property account.
            </p>
          </div>

          {/* CTA */}
          <div className="pt-4 flex justify-center">
            <button
              onClick={() => onNavigate('/rooms')}
              className="px-6 py-3 bg-[#173F35] hover:bg-[#1f5245] text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer"
            >
              Explore Available Rooms
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
