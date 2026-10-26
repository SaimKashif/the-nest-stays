import React, { useState } from 'react';
import { Calendar as CalendarIcon, Users, ArrowRight } from 'lucide-react';

interface AvailabilitySearchProps {
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
  onSearch: (checkIn: string, checkOut: string, guests: number) => void;
  className?: string;
}

export const AvailabilitySearch: React.FC<AvailabilitySearchProps> = ({
  initialCheckIn,
  initialCheckOut,
  initialGuests = 2,
  onSearch,
  className = '',
}) => {
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };
  const getDayAfterTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  };

  const [checkIn, setCheckIn] = useState<string>(initialCheckIn || getTomorrowStr());
  const [checkOut, setCheckOut] = useState<string>(initialCheckOut || getDayAfterTomorrowStr());
  const [guests, setGuests] = useState<number>(initialGuests);
  const [error, setError] = useState<string>('');

  const handleCheckInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCheckIn(val);
    setError('');
    // Automatically ensure checkOut is after checkIn
    if (val >= checkOut) {
      const nextDate = new Date(`${val}T00:00:00Z`);
      nextDate.setDate(nextDate.getDate() + 1);
      setCheckOut(nextDate.toISOString().split('T')[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      setError('Please select both check-in and check-out dates.');
      return;
    }
    if (checkOut <= checkIn) {
      setError('Check-out date must be after check-in date.');
      return;
    }
    setError('');
    onSearch(checkIn, checkOut, guests);
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-lg border border-[#252A27]/10 p-4 sm:p-5 ${className}`}
    >
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        {/* Check-In */}
        <div>
          <label
            htmlFor="search-check-in"
            className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1.5 flex items-center gap-1.5"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-[#C5A572]" />
            <span>Check-In</span>
          </label>
          <input
            id="search-check-in"
            type="date"
            min={getTodayStr()}
            value={checkIn}
            onChange={handleCheckInChange}
            required
            className="w-full px-3 py-2.5 text-sm bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-[#252A27] font-medium focus:outline-none focus:ring-2 focus:ring-[#173F35] focus:border-transparent"
          />
        </div>

        {/* Check-Out */}
        <div>
          <label
            htmlFor="search-check-out"
            className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1.5 flex items-center gap-1.5"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-[#C5A572]" />
            <span>Check-Out</span>
          </label>
          <input
            id="search-check-out"
            type="date"
            min={checkIn || getTodayStr()}
            value={checkOut}
            onChange={(e) => {
              setCheckOut(e.target.value);
              setError('');
            }}
            required
            className="w-full px-3 py-2.5 text-sm bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-[#252A27] font-medium focus:outline-none focus:ring-2 focus:ring-[#173F35] focus:border-transparent"
          />
        </div>

        {/* Guests */}
        <div>
          <label
            htmlFor="search-guests"
            className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1.5 flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5 text-[#C5A572]" />
            <span>Guests</span>
          </label>
          <select
            id="search-guests"
            value={guests}
            onChange={(e) => setGuests(parseInt(e.target.value, 10))}
            className="w-full px-3 py-2.5 text-sm bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-[#252A27] font-medium focus:outline-none focus:ring-2 focus:ring-[#173F35] focus:border-transparent"
          >
            <option value={1}>1 Guest</option>
            <option value={2}>2 Guests (Standard - PKR 5k)</option>
            <option value={3}>3 Guests (PKR 7k/night)</option>
          </select>
        </div>

        {/* Search CTA */}
        <div>
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#173F35] hover:bg-[#1f5245] active:bg-[#0f2c25] rounded-lg transition-colors cursor-pointer shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A572] h-[42px]"
          >
            <span>Search Availability</span>
            <ArrowRight className="w-4 h-4 text-[#C5A572]" />
          </button>
        </div>
      </form>

      {error && (
        <p className="text-xs text-rose-700 mt-2.5 font-medium">{error}</p>
      )}
    </div>
  );
};
