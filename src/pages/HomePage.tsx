import React from 'react';
import { Room, PropertySettings, MenuItem, RefreshmentItem } from '../types/index.ts';
import { AvailabilitySearch } from '../components/AvailabilitySearch.tsx';
import { RoomCard } from '../components/RoomCard.tsx';
import { formatPKR } from '../utils/booking-logic.ts';
import {
  Wifi,
  Tv,
  Wind,
  Bath,
  Sparkles,
  Shirt,
  ShieldCheck,
  MapPin,
  MessageSquare,
  Phone,
  ArrowRight,
  Utensils,
  Package,
  Clock,
} from 'lucide-react';

interface HomePageProps {
  rooms: Room[];
  settings: PropertySettings | null;
  onNavigate: (path: string) => void;
  onSelectRoomForBooking: (room: Room, checkIn?: string, checkOut?: string, guests?: number) => void;
  onViewRoomDetails: (room: Room) => void;
  onSearch: (checkIn: string, checkOut: string, guests: number) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  rooms,
  settings,
  onNavigate,
  onSelectRoomForBooking,
  onViewRoomDetails,
  onSearch,
}) => {
  const whatsapp = settings?.whatsapp || '+923001468362';
  const phone = settings?.phone || '0300 1468362';
  const address = settings?.address || 'Street Number 3, opposite UCP Mufti Town, near Qalma Chownk, Mufti Colony, Gujranwala, 52250, Pakistan';
  const tagline = settings?.tagline || 'Where Comfort Meets Care';

  // Verified amenities from printed tariff
  const verifiedAmenities = [
    {
      icon: <Wifi className="w-5 h-5 text-[#173F35]" />,
      title: 'High-speed Wi-Fi',
      desc: 'Fast, reliable internet for business, study, or entertainment.',
    },
    {
      icon: <Tv className="w-5 h-5 text-[#173F35]" />,
      title: 'Smart TV',
      desc: 'In-room digital entertainment with streaming capabilities.',
    },
    {
      icon: <Wind className="w-5 h-5 text-[#173F35]" />,
      title: 'Air Conditioning',
      desc: 'Individual climate control for cooling and seasonal comfort.',
    },
    {
      icon: <Bath className="w-5 h-5 text-[#173F35]" />,
      title: 'Fresh Towels',
      desc: 'Pristine, hygienically laundered bath linens provided in every stay.',
    },
    {
      icon: <Sparkles className="w-5 h-5 text-[#173F35]" />,
      title: 'Essential Toiletries',
      desc: 'Complimentary soap, shampoo, and bath care essentials.',
    },
    {
      icon: <Shirt className="w-5 h-5 text-[#173F35]" />,
      title: 'Wardrobe & Storage',
      desc: 'Dedicated wardrobe and hanger space to unpack your attire.',
    },
    {
      icon: <Clock className="w-5 h-5 text-[#173F35]" />,
      title: 'Housekeeping Service',
      desc: 'Attentive daily room cleaning and hygienic room care.',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#173F35]" />,
      title: 'Peace of Mind Stay',
      desc: 'Transparent pricing with taxes included and dedicated guest support.',
    },
  ];

  const sampleRefreshments: RefreshmentItem[] = settings?.refreshments || [
    { id: '1', name: 'Mineral Water', size: '500 ml', price: 150, unit: 'each' },
    { id: '2', name: 'Coca-Cola Can', size: '330 ml', price: 300, unit: 'each' },
    { id: '3', name: 'Salted Peanuts', size: 'Pack', price: 150, unit: 'per pack' },
    { id: '4', name: 'Lays Chips', size: 'Pack', price: 200, unit: 'per pack' },
    { id: '5', name: 'Chocolate', size: 'Piece', price: 200, unit: 'per piece' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative bg-[#173F35] text-white">
        {/* Background Photography with overflow-hidden restricted to image */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1920&q=80"
            alt="The Nest Stays boutique guest house interior"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center brightness-[0.70]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#173F35] via-[#173F35]/65 to-black/45" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-16 sm:pt-24 sm:pb-24">
          <div className="max-w-3xl">
            {/* Tagline kicker */}
            <div className="text-xs uppercase tracking-[0.25em] text-[#DFCA9E] font-medium mb-3">
              {tagline} · Mufti Colony, Gujranwala
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#F8F6F0] mb-5 leading-[1.1] text-balance">
              Find Your Perfect Stay.
            </h1>

            <p className="text-base sm:text-xl text-[#F8F6F0]/90 font-light leading-relaxed mb-6 max-w-2xl">
              Comfort, convenience, and a welcoming place to feel at home. Experience restful accommodation opposite UCP in Gujranwala.
            </p>

            {/* Verified Tariff Ribbon */}
            <div className="inline-flex flex-wrap items-center gap-2 sm:gap-4 p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 mb-8 text-xs sm:text-sm">
              <span className="text-[#DFCA9E] font-semibold">Standard Room Tariff:</span>
              <span className="font-bold text-white text-base">PKR 5,000</span>
              <span className="text-[#F8F6F0]/75 text-xs font-normal">per night · Applicable taxes included</span>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <button
                onClick={() => onNavigate('/book')}
                className="w-full sm:w-auto px-6 py-3.5 bg-[#C5A572] hover:bg-[#b89560] active:bg-[#a68450] text-[#173F35] font-semibold rounded-lg shadow-md transition-colors cursor-pointer text-sm sm:text-base text-center"
              >
                Book Your Room
              </button>
              <div className="grid grid-cols-2 sm:flex sm:items-center gap-3">
                <button
                  onClick={() => onNavigate('/rooms')}
                  className="px-5 py-3.5 bg-white/10 hover:bg-white/20 active:bg-white/25 text-[#F8F6F0] font-medium rounded-lg backdrop-blur-sm border border-white/20 transition-colors cursor-pointer text-sm sm:text-base text-center whitespace-nowrap"
                >
                  Explore Rooms
                </button>
                <button
                  onClick={() => onNavigate('/menu')}
                  className="px-5 py-3.5 bg-white/10 hover:bg-white/20 active:bg-white/25 text-[#F8F6F0] font-medium rounded-lg backdrop-blur-sm border border-white/20 transition-colors cursor-pointer text-sm sm:text-base text-center whitespace-nowrap flex items-center justify-center gap-2"
                >
                  <Utensils className="w-4 h-4 text-[#C5A572]" />
                  <span>Food Menu</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-[#F8F6F0]/50 mt-4 italic">
              * Sample accommodation photography shown prior to property owner photo upload.
            </p>
          </div>
        </div>

        {/* Embedded Booking Search Strip without clipping */}
        <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mb-12 sm:-mb-14">
          <AvailabilitySearch onSearch={onSearch} className="shadow-2xl" />
        </div>
      </section>

      {/* Spacing for overlapping availability search */}
      <div className="h-16 sm:h-20 bg-[#F8F6F0]" />

      {/* 2. ACCOMMODATION LISTING */}
      <section className="py-16 sm:py-20 bg-[#F8F6F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-[#C5A572] font-semibold mb-2">
                Verified Printed Tariff
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#173F35] tracking-tight">
                Guest Accommodations
              </h2>
            </div>
            <div className="text-xs text-[#252A27]/70 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#173F35]" />
              <span>Check-in: <strong>{settings?.checkInTime || '2:00 PM'}</strong> · Check-out: <strong>{settings?.checkOutTime || '12:00 PM'}</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onViewDetails={onViewRoomDetails}
                onBookNow={(r) => onSelectRoomForBooking(r)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 3. VERIFIED TARIFF AMENITIES */}
      <section className="py-16 sm:py-20 bg-white border-y border-[#252A27]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs uppercase tracking-[0.2em] text-[#C5A572] font-semibold mb-2">
              Included In Every Stay
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#173F35] tracking-tight">
              Room Amenities
            </h2>
            <p className="text-sm text-[#252A27]/75 mt-2">
              Every facility listed is verified and provided as part of the room tariff.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {verifiedAmenities.map((item, i) => (
              <div
                key={i}
                className="p-5 bg-[#F8F6F0] rounded-xl border border-[#252A27]/10 shadow-sm flex items-start gap-4"
              >
                <div className="p-3 bg-[#EEF3EE] rounded-lg shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-[#173F35] text-sm sm:text-base mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#252A27]/75 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. IN-ROOM REFRESHMENTS & FOOD PREVIEW */}
      <section className="py-16 sm:py-20 bg-[#F8F6F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
            {/* Refreshments Box */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#252A27]/10 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C5A572] mb-2">
                  <Package className="w-4 h-4 text-[#173F35]" />
                  <span>In-Room Refreshments (Optional Mini-Bar)</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#173F35] mb-2">
                  Transparent In-Room Snacks & Drinks
                </h3>
                <p className="text-xs sm:text-sm text-[#252A27]/75 mb-4 leading-relaxed">
                  Available in each room for your comfort. Optional items are billed strictly upon consumption—never added automatically to your room tariff.
                </p>

                <div className="divide-y divide-[#252A27]/10 text-xs">
                  {sampleRefreshments.map((r) => (
                    <div key={r.id} className="py-2.5 flex items-center justify-between">
                      <span className="font-medium text-[#252A27]">{r.name} {r.size ? `(${r.size})` : ''}</span>
                      <strong className="text-[#173F35] tabular-nums">{formatPKR(r.price)} {r.unit}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#252A27]/10 flex items-center justify-between">
                <span className="text-[11px] text-[#252A27]/60">Charges apply on check-out</span>
                <button
                  onClick={() => onNavigate('/menu')}
                  className="text-xs font-semibold text-[#173F35] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View Full Refreshment List</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C5A572]" />
                </button>
              </div>
            </div>

            {/* Food Menu Highlights Box */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#252A27]/10 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C5A572] mb-2">
                  <Utensils className="w-4 h-4 text-[#173F35]" />
                  <span>Fresh Kitchen Dining</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#173F35] mb-2">
                  Home-Style Meals & Specialties
                </h3>
                <p className="text-xs sm:text-sm text-[#252A27]/75 mb-4 leading-relaxed">
                  Fresh breakfast, lunch, and dinner cooked to order for staying guests. Chicken Biryani, Karahi with naan, hot Daal Chawal, and freshly prepared Parathas.
                </p>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#F8F6F0] rounded-lg">
                    <span className="text-[11px] text-[#252A27]/60 block">Breakfast</span>
                    <strong className="text-sm text-[#173F35] block mt-0.5">Parathas & Omelette</strong>
                    <span className="text-[11px] text-emerald-800 font-semibold">From PKR 300</span>
                  </div>
                  <div className="p-3 bg-[#F8F6F0] rounded-lg">
                    <span className="text-[11px] text-[#252A27]/60 block">Lunch & Dinner</span>
                    <strong className="text-sm text-[#173F35] block mt-0.5">Chicken Biryani & Raita</strong>
                    <span className="text-[11px] text-emerald-800 font-semibold">PKR 850</span>
                  </div>
                  <div className="p-3 bg-[#F8F6F0] rounded-lg">
                    <span className="text-[11px] text-[#252A27]/60 block">Dinner Special</span>
                    <strong className="text-sm text-[#173F35] block mt-0.5">Chicken Karahi w/ Naan</strong>
                    <span className="text-[11px] text-emerald-800 font-semibold">PKR 2,500</span>
                  </div>
                  <div className="p-3 bg-[#F8F6F0] rounded-lg">
                    <span className="text-[11px] text-[#252A27]/60 block">Comfort Meal</span>
                    <strong className="text-sm text-[#173F35] block mt-0.5">Daal Chawal</strong>
                    <span className="text-[11px] text-emerald-800 font-semibold">PKR 600</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#252A27]/10 flex items-center justify-between">
                <span className="text-[11px] text-[#252A27]/60">Subject to kitchen hours</span>
                <button
                  onClick={() => onNavigate('/menu')}
                  className="text-xs font-semibold text-[#173F35] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Explore Full Food Menu</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C5A572]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. LOCATION & DIRECT WHATSAPP */}
      <section className="py-16 sm:py-20 bg-[#173F35] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-[#DFCA9E] font-medium mb-2">
                Location & Accessibility
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#F8F6F0] mb-4">
                Conveniently Located in Gujranwala
              </h2>
              <p className="text-sm sm:text-base text-[#F8F6F0]/80 leading-relaxed mb-6 font-light">
                Positioned on Street Number 3, opposite UCP Mufti Town, near Qalma Chownk, Mufti Colony, Gujranwala. Convenient access for visitors, students, families, and professionals seeking quiet, respectful accommodation.
              </p>
              <div className="flex items-start gap-3 text-sm text-[#F8F6F0]/90 mb-6">
                <MapPin className="w-5 h-5 text-[#C5A572] shrink-0 mt-0.5" />
                <span>{address}</span>
              </div>
              <a
                href={settings?.googleMapsUrl || 'https://maps.google.com/?q=Street+Number+3+opposite+UCP+Mufti+Town+near+Qalma+Chownk+Mufti+Colony+Gujranwala+52250+Pakistan'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-xs font-semibold tracking-wide uppercase transition-colors"
              >
                <span>Open in Google Maps</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#C5A572]" />
              </a>
            </div>

            {/* Direct Contact Card */}
            <div className="bg-[#0f2c25] rounded-2xl p-8 border border-white/10 shadow-xl">
              <h3 className="font-serif text-2xl font-bold text-white mb-2">
                Have a Stay or Room Inquiry?
              </h3>
              <p className="text-sm text-[#F8F6F0]/75 leading-relaxed mb-6">
                Connect directly with our property desk via WhatsApp or phone call for immediate reservation assistance.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=Hello%20The%20Nest%20Stays,%20inquiring%20about%20room%20availability.`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2.5 py-3 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold rounded-lg text-sm transition-colors shadow-sm"
                >
                  <MessageSquare className="w-4 h-4 fill-white" />
                  <span>WhatsApp Us</span>
                </a>
                <a
                  href={`tel:${phone.replace(/\s+/g, '')}`}
                  className="flex-1 inline-flex items-center justify-center gap-2.5 py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-lg text-sm transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#C5A572]" />
                  <span>Call Property Desk</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
