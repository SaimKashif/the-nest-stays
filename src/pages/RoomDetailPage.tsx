import React, { useState } from 'react';
import { Room, PropertySettings } from '../types/index.ts';
import { formatPKR } from '../utils/booking-logic.ts';
import {
  ArrowLeft,
  Users,
  Bed,
  Check,
  Calendar,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';

interface RoomDetailPageProps {
  room: Room;
  settings: PropertySettings | null;
  onBack: () => void;
  onBookNow: (room: Room) => void;
}

export const RoomDetailPage: React.FC<RoomDetailPageProps> = ({
  room,
  settings,
  onBack,
  onBookNow,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const images = room.images?.length > 0 ? room.images : ['/src/assets/images/room_deluxe_suite_1792648895537.jpg'];

  return (
    <div className="bg-[#F8F6F0] min-h-screen py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#173F35] hover:text-[#1f5245] mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Rooms</span>
        </button>

        {/* Room Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-[#C5A572] font-semibold mb-1">
              {room.category} Room · {room.view}
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#173F35] tracking-tight">
              {room.name}
            </h1>
          </div>
          <div className="lg:text-right shrink-0">
            <div className="text-2xl sm:text-3xl font-bold text-[#173F35] tabular-nums">
              {formatPKR(room.pricePerNight)}
            </div>
            <div className="text-xs text-[#252A27]/70">PKR 5,000 for 1-2 guests · PKR 7,000 for 3 guests</div>
            <div className="text-[11px] text-emerald-800 font-medium">Applicable taxes included</div>
          </div>
        </div>

        {/* Gallery Section */}
        <div className="mb-12">
          {/* Main Large Image */}
          <div className="relative aspect-[16/9] md:aspect-[21/9] w-full rounded-2xl overflow-hidden shadow-md bg-[#DCE5DC] mb-4">
            <img
              src={images[activeImageIndex]}
              alt={`${room.name} photograph`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnails if multiple images exist */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-24 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    activeImageIndex === idx
                      ? 'border-[#173F35] ring-2 ring-[#173F35]/20'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Two-Column Grid: Details Left, Booking Action Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12">
          {/* Left Column: Room Specs, Long Description, Amenities, Policies */}
          <div className="lg:col-span-2 space-y-10">
            {/* Quick Specs Bar (Anti-Pill unboxed discipline) */}
            <div className="bg-white p-5 rounded-xl border border-[#252A27]/10 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-[#173F35] shrink-0" />
                <div>
                  <span className="block text-[#252A27]/60 text-xs">Capacity</span>
                  <span className="font-semibold text-[#173F35]">Up to {room.maxGuests} Guests</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Bed className="w-5 h-5 text-[#173F35] shrink-0" />
                <div>
                  <span className="block text-[#252A27]/60 text-xs">Bed Setup</span>
                  <span className="font-semibold text-[#173F35]">{room.beds}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-[#173F35] shrink-0" />
                <div>
                  <span className="block text-[#252A27]/60 text-xs">Room Size</span>
                  <span className="font-semibold text-[#173F35]">{room.sizeSqFt || 400} Sq Ft</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#173F35] mb-4">
                About this Room
              </h2>
              <div className="text-sm sm:text-base text-[#252A27]/85 leading-relaxed font-light space-y-3">
                <p>{room.longDescription || room.description}</p>
                <p>
                  Equipped with handcrafted furniture, warm wool throws, ambient lighting, and panoramic mountain window frames. Guests enjoy prompt room service, hot water, and tranquil quietness away from main road traffic.
                </p>
              </div>
            </div>

            {/* Complete Amenities */}
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#173F35] mb-4">
                Room Amenities & Facilities
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[#252A27]/80">
                {room.amenities.map((amenity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-2.5 bg-white rounded-lg border border-[#252A27]/10"
                  >
                    <Check className="w-4 h-4 text-[#173F35] shrink-0" />
                    <span className="font-medium text-xs sm:text-sm">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Check-In Times & Policies */}
            <div className="bg-white p-6 rounded-xl border border-[#252A27]/10 space-y-4">
              <h3 className="font-serif text-xl font-bold text-[#173F35] flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#C5A572]" />
                <span>Stay Policies & Guidelines</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-[#252A27]/80">
                <div>
                  <strong className="text-[#173F35]">Check-In Time:</strong>{' '}
                  {settings?.checkInTime || '2:00 PM'}
                </div>
                <div>
                  <strong className="text-[#173F35]">Check-Out Time:</strong>{' '}
                  {settings?.checkOutTime || '12:00 PM'}
                </div>
              </div>
              <div className="text-xs text-emerald-800 font-medium bg-[#EEF3EE] p-2.5 rounded-lg border border-[#DCE5DC]">
                <strong>Tariff Notice:</strong> Applicable government and municipal taxes are included in the room rate.
              </div>
              <p className="text-xs text-[#252A27]/70 leading-relaxed border-t border-[#252A27]/10 pt-3">
                {settings?.policies.cancellation ||
                  'Free cancellation up to 48 hours before check-in. Valid Original CNIC or Passport is required at check-in.'}
              </p>
            </div>

            {/* Optional In-Room Refreshments Box */}
            <div className="bg-white p-6 rounded-xl border border-[#252A27]/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl font-bold text-[#173F35]">
                  In-Room Refreshments (Optional)
                </h3>
                <span className="text-xs text-[#252A27]/60">Charges apply on consumption</span>
              </div>
              <p className="text-xs text-[#252A27]/75">
                Each room is stocked with select refreshments for your convenience. Consumed items are billed upon check-out:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {(settings?.refreshments || [
                  { id: '1', name: 'Mineral Water', size: '500 ml', price: 150, unit: 'each' },
                  { id: '2', name: 'Coca-Cola Can', size: '330 ml', price: 300, unit: 'each' },
                  { id: '3', name: 'Salted Peanuts', size: 'Pack', price: 150, unit: 'per pack' },
                  { id: '4', name: 'Lays Chips', size: 'Pack', price: 200, unit: 'per pack' },
                  { id: '5', name: 'Chocolate', size: 'Piece', price: 200, unit: 'per piece' },
                ]).map((r) => (
                  <div key={r.id} className="p-2.5 bg-[#F8F6F0] rounded-lg flex items-center justify-between border border-[#252A27]/10">
                    <span className="font-medium text-[#252A27]">{r.name} {r.size ? `(${r.size})` : ''}</span>
                    <strong className="text-[#173F35] tabular-nums">{formatPKR(r.price)}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Direct Booking Card */}
          <div>
            <div className="sticky top-28 bg-white p-6 sm:p-7 rounded-2xl border border-[#252A27]/10 shadow-lg space-y-6">
              <div className="border-b border-[#252A27]/10 pb-4">
                <div className="text-xs uppercase tracking-wider text-[#252A27]/60 mb-1">
                  Standard Tariff
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-3xl font-bold text-[#173F35] tabular-nums">
                    {formatPKR(room.pricePerNight)}
                  </span>
                  <span className="text-xs text-[#252A27]/60">/ night (1-2 guests)</span>
                </div>
                <div className="text-xs text-[#8C6D3B] font-semibold mt-1">
                  PKR 7,000 / night for 3 guests
                </div>
              </div>

              <div className="space-y-3 text-xs text-[#252A27]/75">
                <div className="flex items-center justify-between">
                  <span>Guest Capacity</span>
                  <span className="font-semibold text-[#173F35]">Up to 3 Guests</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Bed Configuration</span>
                  <span className="font-semibold text-[#173F35]">{room.beds}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Breakfast</span>
                  <span className="font-semibold text-emerald-700">Included complimentary</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Advance Deposit</span>
                  <span className="font-semibold text-[#173F35]">
                    {settings?.paymentConfig.requireAdvance
                      ? `${settings.paymentConfig.advancePercentage}% deposit required`
                      : 'Pay on arrival'}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onBookNow(room)}
                  className="w-full py-3.5 px-4 bg-[#173F35] hover:bg-[#1f5245] active:bg-[#0f2c25] text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <Calendar className="w-4 h-4 text-[#C5A572]" />
                  <span>Reserve This Room</span>
                </button>
              </div>

              <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-[#252A27]/60 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-[#173F35]" />
                <span>No instant card charge. Pay via bank, JazzCash or on arrival.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
