import React, { useState } from 'react';
import { Booking, BookingStatus, PaymentStatus } from '../../types/index.ts';
import { formatPKR, calculateStayNights, calculateStayPrice } from '../../utils/booking-logic.ts';
import { X, Save, AlertCircle } from 'lucide-react';

interface BookingEditModalProps {
  booking: Booking | null;
  authToken: string;
  onClose: () => void;
  onSaved: () => Promise<void>;
}

export const BookingEditModal: React.FC<BookingEditModalProps> = ({
  booking,
  authToken,
  onClose,
  onSaved,
}) => {
  if (!booking) return null;

  const [guestName, setGuestName] = useState<string>(booking.guestName || '');
  const [guestPhone, setGuestPhone] = useState<string>(booking.guestPhone || '');
  const [guestEmail, setGuestEmail] = useState<string>(booking.guestEmail || '');
  const [checkIn, setCheckIn] = useState<string>(booking.checkIn);
  const [checkOut, setCheckOut] = useState<string>(booking.checkOut);
  const [guestsCount, setGuestsCount] = useState<number>(booking.guestsCount || 2);
  const [status, setStatus] = useState<BookingStatus>(booking.status);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(booking.paymentStatus);
  const [adminNotes, setAdminNotes] = useState<string>(booking.adminNotes || '');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Live recalculate pricing
  const nights = calculateStayNights(checkIn, checkOut);
  const estimatedPricing = calculateStayPrice(
    5000,
    nights,
    50,
    false,
    guestsCount
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setErrorMsg('Guest name is required.');
      return;
    }
    if (!guestPhone.trim()) {
      setErrorMsg('Contact phone number is required.');
      return;
    }
    if (nights <= 0) {
      setErrorMsg('Check-out date must be after check-in date.');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          guestName: guestName.trim(),
          guestPhone: guestPhone.trim(),
          guestEmail: guestEmail.trim() || undefined,
          checkIn,
          checkOut,
          guestsCount,
          status,
          paymentStatus,
          adminNotes: adminNotes.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to update reservation.');
        return;
      }

      await onSaved();
      onClose();
    } catch (err) {
      console.error('Error updating booking:', err);
      setErrorMsg('Failed to update reservation. Please check server connection.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-[#252A27]/10 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-[#252A27]/10 mb-5">
          <div>
            <h3 className="font-serif text-xl font-bold text-[#173F35]">
              Edit Reservation: <span className="font-mono">{booking.reference}</span>
            </h3>
            <p className="text-xs text-[#252A27]/70">
              Front desk quick edit for dates, guest details, and pricing adjustments.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#F8F6F0] text-[#252A27]/60 hover:text-[#252A27]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-start gap-2 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                Guest Name *
              </label>
              <input
                type="text"
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs font-medium text-[#252A27]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                Mobile Phone *
              </label>
              <input
                type="text"
                required
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs font-medium text-[#252A27]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs font-medium text-[#252A27]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                Number of Guests *
              </label>
              <select
                value={guestsCount}
                onChange={(e) => setGuestsCount(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs font-medium text-[#252A27]"
              >
                <option value={1}>1 Guest (PKR 5,000/night)</option>
                <option value={2}>2 Guests (Standard - PKR 5,000/night)</option>
                <option value={3}>3 Guests (PKR 7,000/night)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                Check-in Date *
              </label>
              <input
                type="date"
                required
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs font-medium text-[#252A27]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                Check-out Date *
              </label>
              <input
                type="date"
                required
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs font-medium text-[#252A27]"
              />
            </div>
          </div>

          {/* Pricing Preview */}
          <div className="p-3 bg-[#EEF3EE] rounded-xl border border-[#DCE5DC] text-xs space-y-1">
            <div className="flex justify-between text-[#173F35]">
              <span>Duration: <strong>{nights} night{nights > 1 ? 's' : ''}</strong></span>
              <span>Rate: <strong>{formatPKR(estimatedPricing.pricePerNight)}/night</strong> {guestsCount === 3 ? '(3 guests)' : '(1-2 guests)'}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-[#173F35] pt-1 border-t border-[#DCE5DC]">
              <span>Updated Total Amount:</span>
              <span className="tabular-nums">{formatPKR(estimatedPricing.total)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                Booking Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as BookingStatus)}
                className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs font-medium text-[#252A27]"
              >
                <option value="confirmed">Confirmed</option>
                <option value="pending_payment">Pending Payment</option>
                <option value="awaiting_verification">Awaiting Verification</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="cancelled">Cancelled</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs font-medium text-[#252A27]"
              >
                <option value="pay_on_arrival">Pay on Arrival</option>
                <option value="verified">Verified / Paid</option>
                <option value="awaiting_verification">Awaiting Verification</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
              Front Desk / Admin Notes
            </label>
            <textarea
              rows={2}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="e.g. Paid in cash at front desk; requested late checkout 1:00 PM."
              className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs font-medium text-[#252A27]"
            />
          </div>

          <div className="pt-4 border-t border-[#252A27]/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#252A27]/20 text-[#252A27] text-xs font-semibold rounded-lg hover:bg-[#F8F6F0]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-[#173F35] hover:bg-[#1f5245] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Updating...' : 'Save Reservation'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
