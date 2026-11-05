import React from 'react';
import { Room } from '../types/index.ts';
import { formatPKR } from '../utils/booking-logic.ts';
import { Users, Bed, Check, ArrowRight } from 'lucide-react';

interface RoomCardProps {
  room: Room;
  onViewDetails: (room: Room) => void;
  onBookNow: (room: Room) => void;
  isAvailable?: boolean;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  room,
  onViewDetails,
  onBookNow,
  isAvailable = true,
}) => {
  const displayImage = room.images?.[0] || '/src/assets/images/room_deluxe_suite_1792648895537.jpg';

  return (
    <article className="group bg-white rounded-xl border border-[#252A27]/10 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      {/* Room Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#DCE5DC]">
        <img
          src={displayImage}
          alt={room.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Subtle category & view kicker */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 text-white">
          <div className="text-xs font-medium text-[#DFCA9E] uppercase tracking-wider">
            {room.category} Room · {room.view}
          </div>
        </div>
      </div>

      {/* Room Content */}
      <div className="p-6 flex flex-col flex-1">
        {/* Title & Price */}
        <div className="flex items-start justify-between gap-4 mb-2">
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#173F35] leading-snug">
            {room.name}
          </h3>
          <div className="text-right shrink-0">
            <span className="block font-semibold text-lg text-[#173F35] tabular-nums">
              {formatPKR(room.pricePerNight)}
            </span>
            <span className="text-[11px] text-[#252A27]/60 block">1-2 guests · taxes included</span>
            <span className="text-[10px] text-[#8C6D3B] font-semibold block">PKR 7,000 for 3 guests</span>
          </div>
        </div>

        {/* Clean unboxed metadata with separators (Anti-Pill discipline) */}
        <div className="flex items-center gap-3 text-xs text-[#252A27]/75 mb-3 font-medium">
          <span className="inline-flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-[#173F35]" />
            <span>Up to {room.maxGuests} Guests</span>
          </span>
          <span aria-hidden="true" className="text-[#252A27]/30">·</span>
          <span className="inline-flex items-center gap-1">
            <Bed className="w-3.5 h-3.5 text-[#173F35]" />
            <span>{room.beds}</span>
          </span>
          {room.sizeSqFt > 0 && (
            <>
              <span aria-hidden="true" className="text-[#252A27]/30">·</span>
              <span>{room.sizeSqFt} sq ft</span>
            </>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-[#252A27]/80 line-clamp-2 mb-4 leading-relaxed">
          {room.description}
        </p>

        {/* Key Amenities */}
        <div className="mt-auto pt-3 border-t border-[#252A27]/10 mb-5">
          <div className="grid grid-cols-2 gap-1.5 text-xs text-[#252A27]/75">
            {room.amenities.slice(0, 4).map((amenity, idx) => (
              <div key={idx} className="flex items-center gap-1.5 truncate">
                <Check className="w-3 h-3 text-[#173F35] shrink-0" />
                <span className="truncate">{amenity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => onViewDetails(room)}
            className="w-full py-2.5 px-3 text-xs sm:text-sm font-semibold text-[#173F35] bg-[#F8F6F0] hover:bg-[#DCE5DC]/60 active:bg-[#DCE5DC] rounded-lg transition-colors border border-[#173F35]/20 text-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#173F35]"
          >
            View Details
          </button>
          <button
            onClick={() => onBookNow(room)}
            disabled={!isAvailable}
            className={`w-full py-2.5 px-3 text-xs sm:text-sm font-semibold text-white rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A572] ${
              isAvailable
                ? 'bg-[#173F35] hover:bg-[#1f5245] active:bg-[#0f2c25]'
                : 'bg-stone-400 cursor-not-allowed'
            }`}
          >
            <span>{isAvailable ? 'Book Now' : 'Unavailable'}</span>
            {isAvailable && <ArrowRight className="w-3.5 h-3.5 text-[#C5A572]" />}
          </button>
        </div>
      </div>
    </article>
  );
};
