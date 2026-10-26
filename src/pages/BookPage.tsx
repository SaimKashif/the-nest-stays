import React, { useState, useEffect } from 'react';
import {
  Room,
  PropertySettings,
  PaymentMethod,
  Booking,
} from '../types/index.ts';
import {
  calculateStayNights,
  calculateStayPrice,
  formatPKR,
  isDateRangeValid,
} from '../utils/booking-logic.ts';
import {
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
  Copy,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Building,
  CreditCard,
  Banknote,
  Smartphone,
  Phone,
  MessageSquare,
  Check,
} from 'lucide-react';

interface BookPageProps {
  rooms: Room[];
  settings: PropertySettings | null;
  initialRoom?: Room | null;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
  onBookingComplete: (booking: Booking) => void;
  onNavigate: (path: string) => void;
}

export const BookPage: React.FC<BookPageProps> = ({
  rooms,
  settings,
  initialRoom,
  initialCheckIn,
  initialCheckOut,
  initialGuests = 2,
  onBookingComplete,
  onNavigate,
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

  // Flow State
  const [step, setStep] = useState<number>(initialRoom ? 3 : 1);

  // Form State
  const [checkIn, setCheckIn] = useState<string>(initialCheckIn || getTomorrowStr());
  const [checkOut, setCheckOut] = useState<string>(initialCheckOut || getDayAfterTomorrowStr());
  const [guestsCount, setGuestsCount] = useState<number>(initialGuests);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(initialRoom || null);

  const [guestName, setGuestName] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [guestEmail, setGuestEmail] = useState<string>('');
  const [expectedArrivalTime, setExpectedArrivalTime] = useState<string>('15:00');
  const [specialRequests, setSpecialRequests] = useState<string>('');

  // Default payment method from enabled ones
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pay_at_property');

  // UI States
  const [availableRooms, setAvailableRooms] = useState<Room[]>(rooms.filter((r) => r.active));
  const [isLoadingAvailability, setIsLoadingAvailability] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Synchronize initial payment method with settings
  useEffect(() => {
    if (settings) {
      if (settings.paymentConfig.allowPayAtProperty) {
        setPaymentMethod('pay_at_property');
      } else if (settings.paymentConfig.bank.enabled) {
        setPaymentMethod('bank_transfer');
      } else if (settings.paymentConfig.jazzCash.enabled) {
        setPaymentMethod('jazzcash');
      } else if (settings.paymentConfig.easypaisa.enabled) {
        setPaymentMethod('easypaisa');
      }
    }
  }, [settings]);

  // Query server availability when dates change
  const queryAvailability = async (inDate: string, outDate: string, guests: number) => {
    setIsLoadingAvailability(true);
    try {
      const res = await fetch(`/api/availability?checkIn=${inDate}&checkOut=${outDate}&guests=${guests}`);
      if (res.ok) {
        const data = await res.json();
        setAvailableRooms(data.availableRooms || []);
      }
    } catch (err) {
      console.error('Error fetching availability:', err);
    } finally {
      setIsLoadingAvailability(false);
    }
  };

  useEffect(() => {
    if (checkIn && checkOut && checkOut > checkIn) {
      queryAvailability(checkIn, checkOut, guestsCount);
    }
  }, [checkIn, checkOut, guestsCount]);

  const nights = calculateStayNights(checkIn, checkOut);
  const pricing = selectedRoom
    ? calculateStayPrice(
        selectedRoom.pricePerNight,
        nights,
        settings?.paymentConfig.advancePercentage ?? 50,
        settings?.paymentConfig.requireAdvance ?? true,
        guestsCount
      )
    : null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Step 1 Validation -> Proceed to Step 2
  const handleDatesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dateCheck = isDateRangeValid(checkIn, checkOut);
    if (!dateCheck.valid) {
      setErrorMsg(dateCheck.error || 'Invalid date range.');
      return;
    }
    setErrorMsg('');
    setStep(2);
  };

  // Step 2 Room Selection -> Proceed to Step 3
  const handleSelectRoom = (room: Room) => {
    setSelectedRoom(room);
    setErrorMsg('');
    setStep(3);
  };

  // Step 3 Guest Details Validation -> Proceed to Step 4
  const handleGuestDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || guestName.trim().length < 2) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!guestPhone || guestPhone.trim().length < 7) {
      setErrorMsg('Please provide a valid mobile phone number.');
      return;
    }
    setErrorMsg('');
    setStep(4);
  };

  // Final Submission to Server
  const handleFinalSubmit = async () => {
    if (!selectedRoom) return;
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId: selectedRoom.id,
          checkIn,
          checkOut,
          guestsCount,
          guestName: guestName.trim(),
          guestPhone: guestPhone.trim(),
          guestEmail: guestEmail.trim() || undefined,
          expectedArrivalTime,
          specialRequests: specialRequests.trim() || undefined,
          paymentMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit booking reservation.');
      }

      // Booking succeeded! Navigate to Confirmation view
      onBookingComplete(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while creating your reservation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F8F6F0] min-h-screen pt-8 pb-28 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Step Indicator Header */}
        <div className="mb-8 sm:mb-10 text-center">
          <div className="text-xs uppercase tracking-[0.2em] text-[#C5A572] font-semibold mb-2">
            Reservation Process
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#173F35]">
            Book Your Stay at The Nest Stays
          </h1>

          {/* Mobile Step Badge */}
          <div className="sm:hidden mt-3 inline-flex items-center gap-2 px-3 py-1 bg-[#EEF3EE] rounded-full text-xs font-semibold text-[#173F35] border border-[#173F35]/15">
            <span className="w-2 h-2 rounded-full bg-[#C5A572]" />
            <span>
              Step {step} of 4:{' '}
              {step === 1 && 'Dates & Guests'}
              {step === 2 && 'Select Room'}
              {step === 3 && 'Guest Information'}
              {step === 4 && 'Payment & Review'}
            </span>
          </div>

          {/* Desktop Clean Stepper */}
          <div className="hidden sm:flex items-center justify-center gap-4 mt-6 text-xs font-semibold text-[#252A27]/70">
            <span className={step >= 1 ? 'text-[#173F35] font-bold' : 'opacity-40'}>1. Dates</span>
            <span className="text-[#252A27]/30">·</span>
            <span className={step >= 2 ? 'text-[#173F35] font-bold' : 'opacity-40'}>2. Room</span>
            <span className="text-[#252A27]/30">·</span>
            <span className={step >= 3 ? 'text-[#173F35] font-bold' : 'opacity-40'}>3. Guest Details</span>
            <span className="text-[#252A27]/30">·</span>
            <span className={step >= 4 ? 'text-[#173F35] font-bold' : 'opacity-40'}>4. Review & Payment</span>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Booking notice:</span>
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 1: CHOOSE DATES & GUEST COUNT */}
        {/* ============================================================== */}
        {step === 1 && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#252A27]/10 shadow-sm">
            <h2 className="font-serif text-2xl font-bold text-[#173F35] mb-2">
              Select Your Travel Dates
            </h2>
            <p className="text-sm text-[#252A27]/75 mb-6">
              Check-in is at {settings?.checkInTime || '2:00 PM'}. Check-out is strictly by {settings?.checkOutTime || '12:00 PM'}. All applicable taxes are included in the room tariff.
            </p>

            <form onSubmit={handleDatesSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="step-check-in" className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-2">
                    Check-in Date
                  </label>
                  <input
                    id="step-check-in"
                    type="date"
                    min={getTodayStr()}
                    value={checkIn}
                    onChange={(e) => {
                      setCheckIn(e.target.value);
                      if (e.target.value >= checkOut) {
                        const d = new Date(`${e.target.value}T00:00:00Z`);
                        d.setDate(d.getDate() + 1);
                        setCheckOut(d.toISOString().split('T')[0]);
                      }
                    }}
                    required
                    className="w-full px-4 py-3 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-sm font-medium text-[#252A27]"
                  />
                </div>

                <div>
                  <label htmlFor="step-check-out" className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-2">
                    Check-out Date
                  </label>
                  <input
                    id="step-check-out"
                    type="date"
                    min={checkIn || getTodayStr()}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-sm font-medium text-[#252A27]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="step-guests-count" className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-2">
                  Number of Guests
                </label>
                <select
                  id="step-guests-count"
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(parseInt(e.target.value, 10))}
                  className="w-full sm:w-96 px-4 py-3 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-sm font-medium text-[#252A27]"
                >
                  <option value={1}>1 Guest (Standard Tariff - PKR 5,000/night)</option>
                  <option value={2}>2 Guests (Standard Tariff - PKR 5,000/night)</option>
                  <option value={3}>3 Guests (PKR 7,000/night · +PKR 2,000 extra person surcharge)</option>
                </select>
                <p className="text-xs text-[#252A27]/70 mt-1.5">
                  Standard tariff accommodates up to 2 guests. When 3 guests stay, total room tariff is PKR 7,000/night (maximum 3 guests per room).
                </p>
              </div>

              {nights > 0 && (
                <div className="p-3 bg-[#EEF3EE] rounded-lg text-xs text-[#173F35] font-medium">
                  Stay duration: <strong>{nights} night{nights > 1 ? 's' : ''}</strong> (Check-in {checkIn} to Check-out {checkOut})
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3.5 bg-[#173F35] hover:bg-[#1f5245] text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
                >
                  <span>Continue to Room Selection</span>
                  <ArrowRight className="w-4 h-4 text-[#C5A572]" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 2: SELECT AN AVAILABLE ROOM */}
        {/* ============================================================== */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-[#252A27]/10">
              <div className="text-xs text-[#252A27]/80">
                Dates: <strong>{checkIn}</strong> to <strong>{checkOut}</strong> ({nights} night{nights > 1 ? 's' : ''}) · <strong>{guestsCount} guest{guestsCount > 1 ? 's' : ''}</strong>
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-xs text-[#173F35] font-semibold underline cursor-pointer"
              >
                Change Dates
              </button>
            </div>

            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#252A27]/10">
              <h2 className="font-serif text-2xl font-bold text-[#173F35] mb-2">
                Choose an Available Room
              </h2>
              <p className="text-sm text-[#252A27]/75 mb-6">
                Showing rooms available for your full stay matching at least {guestsCount} guests.
              </p>

              {isLoadingAvailability ? (
                <div className="text-center py-12 text-[#173F35] text-sm">
                  Checking room availability...
                </div>
              ) : availableRooms.length > 0 ? (
                <div className="space-y-4">
                  {availableRooms.map((room) => {
                    const roomPricing = calculateStayPrice(
                      room.pricePerNight,
                      nights,
                      settings?.paymentConfig.advancePercentage ?? 50,
                      settings?.paymentConfig.requireAdvance ?? true
                    );

                    return (
                      <div
                        key={room.id}
                        className={`p-4 sm:p-5 rounded-xl border transition-all flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between ${
                          selectedRoom?.id === room.id
                            ? 'border-[#173F35] bg-[#EEF3EE]/40 ring-1 ring-[#173F35]'
                            : 'border-[#252A27]/10 hover:border-[#173F35]/40 bg-white'
                        }`}
                      >
                        {/* Thumbnail & Description */}
                        <div className="flex gap-4 items-center">
                          <img
                            src={room.images?.[0] || '/src/assets/images/room_deluxe_suite_1792648895537.jpg'}
                            alt={room.name}
                            referrerPolicy="no-referrer"
                            className="w-24 h-20 sm:w-28 sm:h-24 object-cover rounded-lg shrink-0 bg-[#DCE5DC]"
                          />
                          <div>
                            <span className="text-[10px] uppercase font-semibold text-[#C5A572] tracking-wider block">
                              {room.category}
                            </span>
                            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#173F35]">
                              {room.name}
                            </h3>
                            <div className="text-xs text-[#252A27]/70 mt-1 flex items-center gap-2">
                              <span>Up to {room.maxGuests} Guests</span>
                              <span>·</span>
                              <span>{room.beds}</span>
                            </div>
                          </div>
                        </div>

                        {/* Pricing & CTA */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-[#252A27]/10 gap-3">
                          <div className="sm:text-right">
                            <span className="text-xs text-[#252A27]/60 block">{nights} nights total</span>
                            <span className="font-bold text-lg text-[#173F35] tabular-nums">
                              {formatPKR(roomPricing.total)}
                            </span>
                          </div>
                          <button
                            type="button"
                            aria-label={`Select ${room.name}`}
                            onClick={() => handleSelectRoom(room)}
                            className="px-5 py-2 bg-[#173F35] hover:bg-[#1f5245] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                          >
                            Select Room
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 bg-[#F8F6F0] rounded-xl p-6">
                  <p className="text-sm text-[#252A27]/80 mb-4">
                    No rooms are currently available for the selected dates and guest count.
                  </p>
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2 bg-[#173F35] text-white text-xs font-semibold rounded-lg"
                  >
                    Adjust Dates or Guests
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 3: GUEST DETAILS */}
        {/* ============================================================== */}
        {step === 3 && selectedRoom && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#252A27]/10 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#252A27]/10">
              <div>
                <span className="text-xs text-[#252A27]/60">Selected Room</span>
                <h3 className="font-serif text-xl font-bold text-[#173F35]">
                  {selectedRoom.name}
                </h3>
              </div>
              <button
                onClick={() => setStep(2)}
                className="text-xs text-[#173F35] underline font-semibold cursor-pointer"
              >
                Change Room
              </button>
            </div>

            <form onSubmit={handleGuestDetailsSubmit} className="space-y-5">
              <h2 className="font-serif text-2xl font-bold text-[#173F35]">
                Primary Guest Information
              </h2>
              <p className="text-xs text-[#252A27]/70">
                No account registration required. We only collect details necessary to confirm your reservation and welcome you upon arrival.
              </p>

              <div>
                <label htmlFor="primary-guest-name" className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1.5">
                  Full Name (as on CNIC / Passport) *
                </label>
                <input
                  id="primary-guest-name"
                  type="text"
                  required
                  placeholder="e.g. Muhammad Usman"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-sm text-[#252A27]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="primary-guest-phone" className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1.5">
                    Mobile Phone Number *
                  </label>
                  <input
                    id="primary-guest-phone"
                    type="tel"
                    required
                    placeholder="0300 1234567 or +92 300 1234567"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-sm text-[#252A27]"
                  />
                  <span className="text-[11px] text-[#252A27]/60 mt-1 block">
                    Used for WhatsApp booking updates and stay coordination.
                  </span>
                </div>

                <div>
                  <label htmlFor="primary-guest-email" className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1.5">
                    Email Address (Optional)
                  </label>
                  <input
                    id="primary-guest-email"
                    type="email"
                    placeholder="guest@example.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-sm text-[#252A27]"
                  />
                  <span className="text-[11px] text-[#252A27]/60 mt-1 block">
                    Optional: receive an electronic booking receipt.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="expected-arrival-time" className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1.5">
                    Expected Arrival Time (Optional)
                  </label>
                  <select
                    id="expected-arrival-time"
                    value={expectedArrivalTime}
                    onChange={(e) => setExpectedArrivalTime(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-sm text-[#252A27]"
                  >
                    <option value="14:00 - 16:00">14:00 - 16:00 (Standard Check-in)</option>
                    <option value="16:00 - 18:00">16:00 - 18:00 (Late Afternoon)</option>
                    <option value="18:00 - 20:00">18:00 - 20:00 (Evening)</option>
                    <option value="After 20:00">After 20:00 (Late Night)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="guest-count-verify" className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1.5">
                    Confirmed Guest Count
                  </label>
                  <input
                    id="guest-count-verify"
                    type="number"
                    min={1}
                    max={selectedRoom.maxGuests}
                    value={guestsCount}
                    onChange={(e) => setGuestsCount(parseInt(e.target.value, 10))}
                    className="w-full px-4 py-2.5 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-sm text-[#252A27]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="special-requests-notes" className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1.5">
                  Special Requests / Dietary / Accessibility Notes (Optional)
                </label>
                <textarea
                  id="special-requests-notes"
                  rows={2}
                  placeholder="e.g. Extra blanket, mountain tea setup on arrival, baby cot..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full px-4 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-sm text-[#252A27]"
                />
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-[#252A27]/10">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 text-xs font-semibold text-[#252A27]/70 hover:text-[#252A27] flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#173F35] hover:bg-[#1f5245] text-white font-semibold rounded-lg text-sm flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <span>Review Booking & Payment</span>
                  <ArrowRight className="w-4 h-4 text-[#C5A572]" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 4 & 5: REVIEW BOOKING & CHOOSE PAYMENT METHOD */}
        {/* ============================================================== */}
        {step === 4 && selectedRoom && pricing && (
          <div className="space-y-8">
            {/* Review Summary Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#252A27]/10 shadow-sm space-y-6">
              <h2 className="font-serif text-2xl font-bold text-[#173F35]">
                Review Your Reservation
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-[#F8F6F0] border border-[#252A27]/10 text-xs sm:text-sm">
                <div>
                  <span className="text-[#252A27]/60 block mb-1">Accommodation</span>
                  <strong className="text-base font-serif text-[#173F35] block">
                    {selectedRoom.name}
                  </strong>
                  <span className="text-xs text-[#252A27]/70">{selectedRoom.beds} · Up to {selectedRoom.maxGuests} Guests</span>
                </div>
                <div>
                  <span className="text-[#252A27]/60 block mb-1">Stay Schedule</span>
                  <strong className="text-sm font-semibold text-[#173F35] block">
                    {checkIn} to {checkOut} ({nights} Night{nights > 1 ? 's' : ''})
                  </strong>
                  <span className="text-xs text-[#252A27]/70">Expected arrival: {expectedArrivalTime}</span>
                </div>
                <div>
                  <span className="text-[#252A27]/60 block mb-1">Guest Information</span>
                  <strong className="text-sm font-semibold text-[#173F35] block">{guestName}</strong>
                  <span className="text-xs text-[#252A27]/70">{guestPhone} {guestEmail ? `· ${guestEmail}` : ''}</span>
                </div>
                <div>
                  <span className="text-[#252A27]/60 block mb-1">Guests Staying</span>
                  <strong className="text-sm font-semibold text-[#173F35] block">
                    {guestsCount} Guest{guestsCount > 1 ? 's' : ''}
                  </strong>
                  <span className="text-xs text-emerald-700 font-medium">Complimentary Breakfast Included</span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-[#252A27]/10 pt-4 space-y-2.5 text-sm">
                <div className="flex justify-between text-[#252A27]/80">
                  <span>Base Tariff (1-2 guests)</span>
                  <span className="font-medium tabular-nums">{formatPKR(pricing.basePricePerNight)} / night</span>
                </div>
                {pricing.extraGuestSurchargePerNight > 0 && (
                  <div className="flex justify-between text-amber-900 bg-amber-50 p-2 rounded-lg">
                    <span>3rd Guest Surcharge</span>
                    <span className="font-medium tabular-nums">+{formatPKR(pricing.extraGuestSurchargePerNight)} / night</span>
                  </div>
                )}
                <div className="flex justify-between text-[#252A27]/80">
                  <span>Room Rate ({formatPKR(pricing.pricePerNight)} × {nights} night{nights > 1 ? 's' : ''})</span>
                  <span className="font-medium tabular-nums">{formatPKR(pricing.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#252A27]/80">
                  <span>Applicable Taxes</span>
                  <span className="font-medium text-emerald-700">Included in Tariff</span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#173F35] pt-2 border-t border-[#252A27]/10">
                  <span>Total Amount</span>
                  <span className="tabular-nums text-lg">{formatPKR(pricing.total)}</span>
                </div>

                {settings?.paymentConfig.requireAdvance && paymentMethod !== 'pay_at_property' && (
                  <div className="p-3 bg-[#EEF3EE] rounded-lg mt-3 text-xs space-y-1">
                    <div className="flex justify-between font-semibold text-[#173F35]">
                      <span>Advance Deposit Required ({settings.paymentConfig.advancePercentage}%):</span>
                      <span className="tabular-nums">{formatPKR(pricing.advanceRequired)}</span>
                    </div>
                    <div className="flex justify-between text-[#252A27]/70">
                      <span>Remaining Balance (Payable at Property):</span>
                      <span className="tabular-nums">{formatPKR(pricing.balanceDue)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Cancellation Policy reminder */}
              <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200/50 text-xs text-amber-900 leading-relaxed">
                <strong>Cancellation Policy:</strong>{' '}
                {settings?.policies.cancellation ||
                  'Free cancellation up to 72 hours before check-in. Valid CNIC / Passport required at check-in for all adult guests.'}
              </div>
            </div>

            {/* Payment Method Selection Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#252A27]/10 shadow-sm space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#173F35] mb-1">
                  Select Payment Method
                </h2>
                <p className="text-xs sm:text-sm text-[#252A27]/75">
                  Only owner-enabled payment options are shown. All digital payments are verified manually by property management.
                </p>
              </div>

              <div className="space-y-3">
                {/* Option A: Pay at property */}
                {settings?.paymentConfig.allowPayAtProperty && (
                  <label
                    className={`block p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'pay_at_property'
                        ? 'border-[#173F35] bg-[#EEF3EE]/40 ring-1 ring-[#173F35]'
                        : 'border-[#252A27]/15 hover:border-[#173F35]/40 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="payment_choice"
                        value="pay_at_property"
                        checked={paymentMethod === 'pay_at_property'}
                        onChange={() => setPaymentMethod('pay_at_property')}
                        className="mt-1 text-[#173F35] focus:ring-[#173F35]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Banknote className="w-4 h-4 text-[#173F35]" />
                          <span className="font-bold text-[#173F35] text-sm">
                            Pay at The Nest Stays (Cash on Arrival)
                          </span>
                        </div>
                        <p className="text-xs text-[#252A27]/75 mt-1 leading-relaxed">
                          Prefer to pay in person? You can pay at The Nest Stays upon arrival.
                          {settings.paymentConfig.payAtPropertyRequiresApproval
                            ? ' Please note: Your reservation request is subject to quick property approval.'
                            : ' Immediate reservation confirmation.'}
                        </p>
                      </div>
                    </div>
                  </label>
                )}

                {/* Option B: Bank Transfer */}
                {settings?.paymentConfig.bank.enabled && (
                  <label
                    className={`block p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'bank_transfer'
                        ? 'border-[#173F35] bg-[#EEF3EE]/40 ring-1 ring-[#173F35]'
                        : 'border-[#252A27]/15 hover:border-[#173F35]/40 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="payment_choice"
                        value="bank_transfer"
                        checked={paymentMethod === 'bank_transfer'}
                        onChange={() => setPaymentMethod('bank_transfer')}
                        className="mt-1 text-[#173F35] focus:ring-[#173F35]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-[#173F35]" />
                          <span className="font-bold text-[#173F35] text-sm">
                            Direct Bank Transfer ({settings.paymentConfig.bank.bankName})
                          </span>
                        </div>
                        <p className="text-xs text-[#252A27]/75 mt-1">
                          Transfer the advance deposit directly from your online banking app or ATM.
                        </p>

                        {/* Interactive Bank Details if selected */}
                        {paymentMethod === 'bank_transfer' && (
                          <div className="mt-3 p-3 bg-white rounded-lg border border-[#252A27]/10 text-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[#252A27]/70">Bank Name:</span>
                              <strong className="text-[#173F35]">{settings.paymentConfig.bank.bankName}</strong>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[#252A27]/70">Account Title:</span>
                              <strong className="text-[#173F35]">{settings.paymentConfig.bank.accountTitle}</strong>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[#252A27]/70">Account Number:</span>
                              <div className="flex items-center gap-1.5">
                                <strong className="font-mono text-[#173F35]">{settings.paymentConfig.bank.accountNumber}</strong>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    copyToClipboard(settings.paymentConfig.bank.accountNumber, 'acc');
                                  }}
                                  className="p-1 hover:bg-[#F8F6F0] rounded text-[#173F35]"
                                  title="Copy account number"
                                >
                                  {copiedKey === 'acc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>
                            {settings.paymentConfig.bank.iban && (
                              <div className="flex items-center justify-between">
                                <span className="text-[#252A27]/70">IBAN:</span>
                                <div className="flex items-center gap-1.5">
                                  <strong className="font-mono text-[#173F35] text-[11px]">{settings.paymentConfig.bank.iban}</strong>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      copyToClipboard(settings.paymentConfig.bank.iban, 'iban');
                                    }}
                                    className="p-1 hover:bg-[#F8F6F0] rounded text-[#173F35]"
                                    title="Copy IBAN"
                                  >
                                    {copiedKey === 'iban' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              </div>
                            )}
                            <div className="text-[11px] text-[#252A27]/60 pt-1 border-t border-[#252A27]/10">
                              {settings.paymentConfig.bank.instructions}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </label>
                )}

                {/* Option C: JazzCash */}
                {settings?.paymentConfig.jazzCash.enabled && (
                  <label
                    className={`block p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'jazzcash'
                        ? 'border-[#173F35] bg-[#EEF3EE]/40 ring-1 ring-[#173F35]'
                        : 'border-[#252A27]/15 hover:border-[#173F35]/40 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="payment_choice"
                        value="jazzcash"
                        checked={paymentMethod === 'jazzcash'}
                        onChange={() => setPaymentMethod('jazzcash')}
                        className="mt-1 text-[#173F35] focus:ring-[#173F35]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-[#173F35]" />
                          <span className="font-bold text-[#173F35] text-sm">
                            JazzCash Manual Transfer
                          </span>
                        </div>
                        <p className="text-xs text-[#252A27]/75 mt-1">
                          Transfer advance deposit to official JazzCash merchant account or wallet.
                        </p>

                        {paymentMethod === 'jazzcash' && (
                          <div className="mt-3 p-3 bg-white rounded-lg border border-[#252A27]/10 text-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[#252A27]/70">Account Title:</span>
                              <strong className="text-[#173F35]">{settings.paymentConfig.jazzCash.accountTitle}</strong>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[#252A27]/70">Account / Mobile Number:</span>
                              <div className="flex items-center gap-1.5">
                                <strong className="font-mono text-[#173F35]">{settings.paymentConfig.jazzCash.accountNumber}</strong>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    copyToClipboard(settings.paymentConfig.jazzCash.accountNumber, 'jc');
                                  }}
                                  className="p-1 hover:bg-[#F8F6F0] rounded text-[#173F35]"
                                >
                                  {copiedKey === 'jc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>
                            {settings.paymentConfig.jazzCash.tillId && (
                              <div className="flex items-center justify-between">
                                <span className="text-[#252A27]/70">Till ID:</span>
                                <strong className="font-mono text-[#173F35]">{settings.paymentConfig.jazzCash.tillId}</strong>
                              </div>
                            )}
                            <div className="text-[11px] text-[#252A27]/60 pt-1 border-t border-[#252A27]/10">
                              {settings.paymentConfig.jazzCash.instructions}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </label>
                )}

                {/* Option D: Easypaisa */}
                {settings?.paymentConfig.easypaisa.enabled && (
                  <label
                    className={`block p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'easypaisa'
                        ? 'border-[#173F35] bg-[#EEF3EE]/40 ring-1 ring-[#173F35]'
                        : 'border-[#252A27]/15 hover:border-[#173F35]/40 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="payment_choice"
                        value="easypaisa"
                        checked={paymentMethod === 'easypaisa'}
                        onChange={() => setPaymentMethod('easypaisa')}
                        className="mt-1 text-[#173F35] focus:ring-[#173F35]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-emerald-700" />
                          <span className="font-bold text-[#173F35] text-sm">
                            Easypaisa Manual Transfer
                          </span>
                        </div>
                        <p className="text-xs text-[#252A27]/75 mt-1">
                          Transfer advance deposit to official Easypaisa account.
                        </p>

                        {paymentMethod === 'easypaisa' && (
                          <div className="mt-3 p-3 bg-white rounded-lg border border-[#252A27]/10 text-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[#252A27]/70">Account Title:</span>
                              <strong className="text-[#173F35]">{settings.paymentConfig.easypaisa.accountTitle}</strong>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[#252A27]/70">Account / Mobile Number:</span>
                              <div className="flex items-center gap-1.5">
                                <strong className="font-mono text-[#173F35]">{settings.paymentConfig.easypaisa.accountNumber}</strong>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    copyToClipboard(settings.paymentConfig.easypaisa.accountNumber, 'ep');
                                  }}
                                  className="p-1 hover:bg-[#F8F6F0] rounded text-[#173F35]"
                                >
                                  {copiedKey === 'ep' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>
                            <div className="text-[11px] text-[#252A27]/60 pt-1 border-t border-[#252A27]/10">
                              {settings.paymentConfig.easypaisa.instructions}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </label>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-6 flex items-center justify-between border-t border-[#252A27]/10">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2.5 text-xs font-semibold text-[#252A27]/70 hover:text-[#252A27] flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Guest Details</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleFinalSubmit}
                  className="px-7 py-3 bg-[#173F35] hover:bg-[#1f5245] active:bg-[#0f2c25] disabled:bg-stone-400 text-white font-semibold rounded-lg text-sm sm:text-base flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
                >
                  {isSubmitting ? (
                    <span>Confirming Reservation...</span>
                  ) : (
                    <>
                      <span>Complete Reservation</span>
                      <ArrowRight className="w-4 h-4 text-[#C5A572]" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
