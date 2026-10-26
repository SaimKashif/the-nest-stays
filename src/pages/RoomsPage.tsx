import React, { useState } from 'react';
import { Room, RoomCategory } from '../types/index.ts';
import { RoomCard } from '../components/RoomCard.tsx';
import { AvailabilitySearch } from '../components/AvailabilitySearch.tsx';
import { SlidersHorizontal, CheckCircle2 } from 'lucide-react';

interface RoomsPageProps {
  rooms: Room[];
  selectedDates?: { checkIn: string; checkOut: string; guests: number } | null;
  availableRoomIds?: string[] | null;
  onSelectRoomForBooking: (room: Room, checkIn?: string, checkOut?: string, guests?: number) => void;
  onViewRoomDetails: (room: Room) => void;
  onSearch: (checkIn: string, checkOut: string, guests: number) => void;
  onClearDateFilter: () => void;
}

export const RoomsPage: React.FC<RoomsPageProps> = ({
  rooms,
  selectedDates,
  availableRoomIds,
  onSelectRoomForBooking,
  onViewRoomDetails,
  onSearch,
  onClearDateFilter,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [minGuests, setMinGuests] = useState<number>(1);

  const categories: { label: string; value: string }[] = [
    { label: 'All Accommodations', value: 'all' },
    { label: 'Suites', value: 'suite' },
    { label: 'Deluxe Rooms', value: 'deluxe' },
    { label: 'Family Residence', value: 'family' },
    { label: 'Standard', value: 'standard' },
  ];

  const filteredRooms = rooms.filter((room) => {
    if (!room.active) return false;
    if (selectedCategory !== 'all' && room.category !== selectedCategory) return false;
    if (room.maxGuests < minGuests) return false;
    // If date search active, optionally filter or check availability
    if (availableRoomIds !== null && availableRoomIds !== undefined) {
      return availableRoomIds.includes(room.id);
    }
    return true;
  });

  return (
    <div className="bg-[#F8F6F0] min-h-screen py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="max-w-3xl mb-8">
          <div className="text-xs uppercase tracking-[0.2em] text-[#C5A572] font-semibold mb-2">
            The Nest Stays
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#173F35] tracking-tight mb-4">
            Rooms & Suites
          </h1>
          <p className="text-sm sm:text-base text-[#252A27]/80 leading-relaxed font-light">
            Every room at The Nest Stays is thoughtfully designed with plush bedding, heating, scenic mountain views, and attentive room hospitality.
          </p>
        </div>

        {/* Date Search Bar */}
        <div className="mb-10">
          <AvailabilitySearch
            initialCheckIn={selectedDates?.checkIn}
            initialCheckOut={selectedDates?.checkOut}
            initialGuests={selectedDates?.guests}
            onSearch={onSearch}
          />
          {selectedDates && (
            <div className="mt-3 flex items-center justify-between bg-[#EEF3EE] p-3 rounded-lg border border-[#DCE5DC] text-xs text-[#173F35]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#173F35]" />
                <span>
                  Showing rooms available from <strong>{selectedDates.checkIn}</strong> to{' '}
                  <strong>{selectedDates.checkOut}</strong> for{' '}
                  <strong>{selectedDates.guests} guest{selectedDates.guests > 1 ? 's' : ''}</strong>
                </span>
              </div>
              <button
                onClick={onClearDateFilter}
                className="underline hover:text-[#1f5245] font-semibold cursor-pointer"
              >
                Clear Dates
              </button>
            </div>
          )}
        </div>

        {/* Filters Bar (Interactive buttons/tabs per frontend design rules) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-[#252A27]/10">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat.value
                    ? 'bg-[#173F35] text-white shadow-sm'
                    : 'bg-white text-[#252A27]/80 hover:bg-[#DCE5DC]/60 border border-[#252A27]/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Guest Capacity Filter */}
          <div className="flex items-center gap-2 text-xs text-[#252A27]/80 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#173F35]" />
            <span className="font-medium">Capacity:</span>
            <select
              value={minGuests}
              onChange={(e) => setMinGuests(parseInt(e.target.value, 10))}
              className="px-2.5 py-1.5 bg-white border border-[#252A27]/20 rounded-md font-medium text-xs text-[#252A27]"
            >
              <option value={1}>Any capacity</option>
              <option value={2}>2+ Guests</option>
              <option value={3}>3+ Guests (Family)</option>
            </select>
          </div>
        </div>

        {/* Room Grid */}
        {filteredRooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onViewDetails={onViewRoomDetails}
                onBookNow={(r) =>
                  onSelectRoomForBooking(
                    r,
                    selectedDates?.checkIn,
                    selectedDates?.checkOut,
                    selectedDates?.guests
                  )
                }
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-[#252A27]/10 p-8 max-w-lg mx-auto">
            <h3 className="font-serif text-xl font-bold text-[#173F35] mb-2">
              No rooms match your criteria
            </h3>
            <p className="text-sm text-[#252A27]/70 mb-6">
              Try adjusting your guest capacity, changing dates, or contacting our reservations desk directly.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setMinGuests(1);
                  onClearDateFilter();
                }}
                className="px-4 py-2 bg-[#173F35] text-white text-xs font-semibold rounded-lg"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
