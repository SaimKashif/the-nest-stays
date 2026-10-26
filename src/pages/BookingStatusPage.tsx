import React, { useState, useEffect } from 'react';
import { Booking, PropertySettings } from '../types/index.ts';
import { formatPKR } from '../utils/booking-logic.ts';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  Building,
  Smartphone,
  Banknote,
  MessageSquare,
  Upload,
  Calendar,
  Users,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

interface BookingStatusPageProps {
  initialReference?: string;
  initialBooking?: Booking | null;
  settings: PropertySettings | null;
  onNavigate: (path: string) => void;
}

export const BookingStatusPage: React.FC<BookingStatusPageProps> = ({
  initialReference = '',
  initialBooking = null,
  settings,
  onNavigate,
}) => {
  const [referenceQuery, setReferenceQuery] = useState<string>(
    initialReference || initialBooking?.reference || ''
  );
  const [booking, setBooking] = useState<Booking | null>(initialBooking);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Payment Submission State
  const [txnRef, setTxnRef] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [receiptImageBase64, setReceiptImageBase64] = useState<string>('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState<boolean>(false);
  const [paymentSubmitSuccess, setPaymentSubmitSuccess] = useState<boolean>(false);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleLookup = async (refToFetch?: string) => {
    const ref = (refToFetch || referenceQuery).trim().toUpperCase();
    if (!ref) {
      setErrorMsg('Please enter a booking reference code.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setPaymentSubmitSuccess(false);

    try {
      const res = await fetch(`/api/bookings/${ref}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(`No booking found with reference "${ref}". Please check and try again.`);
        }
        throw new Error('Failed to retrieve booking.');
      }
      const data = await res.json();
      setBooking(data);
      if (data.advanceRequired) {
        setPaymentAmount(data.advanceRequired.toString());
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error looking up booking.');
      setBooking(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialReference && !booking) {
      handleLookup(initialReference);
    }
  }, [initialReference]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaymentSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;

    if (!txnRef.trim()) {
      setErrorMsg('Please enter the transaction reference number.');
      return;
    }
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      setErrorMsg('Please enter the amount transferred.');
      return;
    }

    setIsSubmittingPayment(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/bookings/${booking.reference}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionRef: txnRef.trim(),
          amount: parseFloat(paymentAmount),
          receiptImage: receiptImageBase64 || undefined,
          notes: notes.trim() || undefined,
        }),
      });

      const updated = await res.json();
      if (!res.ok) {
        throw new Error(updated.error || 'Failed to submit payment details.');
      }

      setBooking(updated);
      setPaymentSubmitSuccess(true);
      setTxnRef('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment submission failed.');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const whatsappNumber = settings?.whatsapp || '+923001468362';
  const cleanWhatsApp = whatsappNumber.replace(/[^0-9]/g, '');
  const whatsAppMessage = booking
    ? encodeURIComponent(
        `Hello The Nest Stays, inquiring about my reservation reference: ${booking.reference} for ${booking.roomName}.`
      )
    : encodeURIComponent('Hello The Nest Stays, inquiring about my reservation.');

  return (
    <div className="bg-[#F8F6F0] min-h-screen py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="text-xs uppercase tracking-[0.2em] text-[#C5A572] font-semibold mb-2">
            Reservation Management
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#173F35]">
            Booking Status & Payment Verification
          </h1>
          <p className="text-sm text-[#252A27]/75 mt-2">
            Look up your reservation details, submit manual payment confirmation, or coordinate with the property.
          </p>
        </div>

        {/* Lookup Form */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#252A27]/10 shadow-sm mb-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLookup();
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Enter booking reference (e.g. TNS-847291)"
                value={referenceQuery}
                onChange={(e) => setReferenceQuery(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 pl-10 bg-[#F8F6F0] border border-[#252A27]/20 rounded-xl font-mono text-sm uppercase tracking-wider text-[#173F35] font-semibold placeholder:font-sans placeholder:normal-case placeholder:font-normal"
              />
              <Search className="w-4 h-4 text-[#252A27]/50 absolute left-3.5 top-3.5" />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-[#173F35] hover:bg-[#1f5245] text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer shrink-0"
            >
              {isLoading ? 'Searching...' : 'Find Reservation'}
            </button>
          </form>

          {errorMsg && (
            <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* BOOKING DETAILS PRESENTATION */}
        {/* ============================================================== */}
        {booking && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Status Hero Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#252A27]/10 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#252A27]/10 gap-4">
                <div>
                  <div className="text-xs text-[#252A27]/60 uppercase tracking-wider font-semibold">
                    Booking Reference
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-2xl sm:text-3xl font-bold text-[#173F35] tracking-tight">
                      {booking.reference}
                    </span>
                    <button
                      onClick={() => copyToClipboard(booking.reference, 'ref')}
                      className="p-1 hover:bg-[#F8F6F0] rounded text-[#173F35]"
                      title="Copy Reference"
                    >
                      {copiedKey === 'ref' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Explicit Status Badge (Clean, clear semantics) */}
                <div className="shrink-0">
                  {booking.status === 'confirmed' && (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>Reservation Confirmed</span>
                    </div>
                  )}

                  {booking.status === 'awaiting_verification' && (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                      <Clock className="w-4 h-4 text-amber-700" />
                      <span>Payment Verification Pending</span>
                    </div>
                  )}

                  {booking.status === 'pending_payment' && (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-800 text-xs font-semibold">
                      <Clock className="w-4 h-4 text-sky-700" />
                      <span>Awaiting Advance Payment</span>
                    </div>
                  )}

                  {booking.status === 'pending_approval' && (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold">
                      <Clock className="w-4 h-4 text-blue-700" />
                      <span>Booking Request Received (Pending Approval)</span>
                    </div>
                  )}

                  {booking.status === 'cancelled' && (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                      <AlertCircle className="w-4 h-4 text-rose-700" />
                      <span>Booking Cancelled</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Explanation Message */}
              <div className="pt-6">
                {booking.status === 'confirmed' && (
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-emerald-900 text-xs sm:text-sm leading-relaxed">
                    <p className="font-semibold mb-1">Your reservation is fully confirmed.</p>
                    <p>
                      We look forward to welcoming you to The Nest Stays on <strong>{booking.checkIn}</strong>.
                      {booking.balanceDue > 0
                        ? ` The remaining balance of ${formatPKR(booking.balanceDue)} is payable upon arrival.`
                        : ' All advance charges have been cleared.'}
                    </p>
                  </div>
                )}

                {booking.status === 'awaiting_verification' && (
                  <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-900 text-xs sm:text-sm leading-relaxed">
                    <p className="font-semibold mb-1">Payment proof received — awaiting property verification.</p>
                    <p>
                      Your transaction reference <strong>{booking.paymentSubmission?.transactionRef}</strong> has been submitted. Our manager will verify receipt of funds in the property account and confirm your reservation shortly.
                    </p>
                  </div>
                )}

                {booking.status === 'pending_payment' && (
                  <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-xl text-sky-900 text-xs sm:text-sm leading-relaxed">
                    <p className="font-semibold mb-1">Advance deposit required to confirm your reservation.</p>
                    <p>
                      Please transfer the advance deposit of <strong>{formatPKR(booking.advanceRequired)}</strong> using the payment instructions below, then submit your transaction reference to confirm.
                    </p>
                  </div>
                )}

                {booking.status === 'pending_approval' && (
                  <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900 text-xs sm:text-sm leading-relaxed">
                    <p className="font-semibold mb-1">Reservation request received for Cash on Arrival.</p>
                    <p>
                      Our property manager will review room schedules and approve your reservation shortly. You may also contact us directly via WhatsApp.
                    </p>
                  </div>
                )}
              </div>

              {/* Summary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 mt-6 border-t border-[#252A27]/10 text-xs sm:text-sm">
                <div>
                  <span className="text-[#252A27]/60 block mb-1">Room Reserved</span>
                  <strong className="text-[#173F35] font-serif text-base block">{booking.roomName}</strong>
                  <span className="text-xs text-[#252A27]/70">{booking.guestsCount} Guests · {booking.nights} Nights</span>
                </div>

                <div>
                  <span className="text-[#252A27]/60 block mb-1">Stay Dates</span>
                  <strong className="text-[#173F35] block">
                    {booking.checkIn} to {booking.checkOut}
                  </strong>
                  <span className="text-xs text-[#252A27]/70">Arrival: {booking.expectedArrivalTime || '14:00 - 16:00'}</span>
                </div>

                <div>
                  <span className="text-[#252A27]/60 block mb-1">Primary Guest</span>
                  <strong className="text-[#173F35] block">{booking.guestName}</strong>
                  <span className="text-xs text-[#252A27]/70">{booking.guestPhone}</span>
                </div>
              </div>

              {/* Pricing Snapshot */}
              <div className="mt-6 pt-6 border-t border-[#252A27]/10 bg-[#F8F6F0] p-4 rounded-xl text-xs sm:text-sm space-y-2">
                <div className="flex justify-between text-[#252A27]/80">
                  <span>Total Amount for {booking.nights} nights:</span>
                  <strong className="tabular-nums font-semibold text-[#173F35]">{formatPKR(booking.total)}</strong>
                </div>
                {booking.advanceRequired > 0 && (
                  <div className="flex justify-between text-[#252A27]/80">
                    <span>Advance Deposit Required:</span>
                    <span className="tabular-nums font-semibold text-[#173F35]">{formatPKR(booking.advanceRequired)}</span>
                  </div>
                )}
                {booking.verifiedAmount !== undefined && (
                  <div className="flex justify-between text-emerald-800 font-semibold">
                    <span>Verified Advance Paid:</span>
                    <span className="tabular-nums">{formatPKR(booking.verifiedAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#173F35] font-bold pt-2 border-t border-[#252A27]/15">
                  <span>Balance Due upon Arrival:</span>
                  <span className="tabular-nums text-base">{formatPKR(booking.balanceDue)}</span>
                </div>
              </div>

              {/* WhatsApp direct contact button */}
              <div className="mt-6 pt-6 border-t border-[#252A27]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-[#252A27]/70">
                  Questions about your stay? Contact our guest-house desk:
                </div>
                <a
                  href={`https://wa.me/${cleanWhatsApp}?text=${whatsAppMessage}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2.5 px-5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-lg font-semibold text-xs transition-colors"
                >
                  <MessageSquare className="w-4 h-4 fill-white" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* ============================================================== */}
            {/* SUBMIT ADVANCE PAYMENT SECTION (IF PENDING PAYMENT) */}
            {/* ============================================================== */}
            {booking.status === 'pending_payment' && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#252A27]/10 shadow-sm space-y-6">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#173F35] mb-1">
                    Submit Advance Payment Details
                  </h2>
                  <p className="text-xs sm:text-sm text-[#252A27]/75">
                    After completing the transfer to our property account, please submit your transaction reference below.
                  </p>
                </div>

                {paymentSubmitSuccess && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Payment reference submitted successfully! Our manager will verify receipt and confirm your reservation.</span>
                  </div>
                )}

                {/* Display Configured Payment Instructions based on method */}
                {booking.paymentMethod === 'bank_transfer' && settings?.paymentConfig.bank && (
                  <div className="p-4 bg-[#F8F6F0] rounded-xl border border-[#252A27]/10 text-xs space-y-2">
                    <div className="font-semibold text-[#173F35] text-sm flex items-center gap-2">
                      <Building className="w-4 h-4 text-[#173F35]" />
                      <span>Bank Transfer Instructions</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <div>Bank: <strong>{settings.paymentConfig.bank.bankName}</strong></div>
                      <div>Title: <strong>{settings.paymentConfig.bank.accountTitle}</strong></div>
                      <div className="flex items-center gap-1.5">
                        <span>Account:</span>
                        <strong className="font-mono">{settings.paymentConfig.bank.accountNumber}</strong>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(settings.paymentConfig.bank.accountNumber, 'b-acc')}
                          className="p-0.5 hover:bg-white rounded text-[#173F35]"
                        >
                          {copiedKey === 'b-acc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      {settings.paymentConfig.bank.iban && (
                        <div className="flex items-center gap-1.5">
                          <span>IBAN:</span>
                          <strong className="font-mono text-[11px]">{settings.paymentConfig.bank.iban}</strong>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(settings.paymentConfig.bank.iban, 'b-iban')}
                            className="p-0.5 hover:bg-white rounded text-[#173F35]"
                          >
                            {copiedKey === 'b-iban' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {booking.paymentMethod === 'jazzcash' && settings?.paymentConfig.jazzCash && (
                  <div className="p-4 bg-[#F8F6F0] rounded-xl border border-[#252A27]/10 text-xs space-y-2">
                    <div className="font-semibold text-[#173F35] text-sm flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-[#173F35]" />
                      <span>JazzCash Payment Instructions</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <div>Title: <strong>{settings.paymentConfig.jazzCash.accountTitle}</strong></div>
                      <div className="flex items-center gap-1.5">
                        <span>Account / Phone:</span>
                        <strong className="font-mono">{settings.paymentConfig.jazzCash.accountNumber}</strong>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(settings.paymentConfig.jazzCash.accountNumber, 'jc-acc')}
                          className="p-0.5 hover:bg-white rounded text-[#173F35]"
                        >
                          {copiedKey === 'jc-acc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      {settings.paymentConfig.jazzCash.tillId && (
                        <div>Till ID: <strong className="font-mono">{settings.paymentConfig.jazzCash.tillId}</strong></div>
                      )}
                    </div>
                  </div>
                )}

                {booking.paymentMethod === 'easypaisa' && settings?.paymentConfig.easypaisa && (
                  <div className="p-4 bg-[#F8F6F0] rounded-xl border border-[#252A27]/10 text-xs space-y-2">
                    <div className="font-semibold text-[#173F35] text-sm flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-emerald-700" />
                      <span>Easypaisa Payment Instructions</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <div>Title: <strong>{settings.paymentConfig.easypaisa.accountTitle}</strong></div>
                      <div className="flex items-center gap-1.5">
                        <span>Account / Phone:</span>
                        <strong className="font-mono">{settings.paymentConfig.easypaisa.accountNumber}</strong>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(settings.paymentConfig.easypaisa.accountNumber, 'ep-acc')}
                          className="p-0.5 hover:bg-white rounded text-[#173F35]"
                        >
                          {copiedKey === 'ep-acc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form to submit proof */}
                <form onSubmit={handlePaymentSubmission} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="payment-txn-ref" className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1.5">
                        Transaction Reference / Bank TID *
                      </label>
                      <input
                        id="payment-txn-ref"
                        type="text"
                        required
                        placeholder="e.g. MEZN-998812 or JC-48192"
                        value={txnRef}
                        onChange={(e) => setTxnRef(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-sm text-[#252A27]"
                      />
                    </div>

                    <div>
                      <label htmlFor="payment-stated-amount" className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1.5">
                        Transferred Amount (PKR) *
                      </label>
                      <input
                        id="payment-stated-amount"
                        type="number"
                        required
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-sm text-[#252A27]"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="payment-receipt-upload" className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1.5">
                      Optional Payment Receipt Screenshot (PNG/JPG up to 5MB)
                    </label>
                    <input
                      id="payment-receipt-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="w-full text-xs text-[#252A27]/70 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#173F35] file:text-white hover:file:bg-[#1f5245] cursor-pointer"
                    />
                    {receiptImageBase64 && (
                      <div className="mt-2 text-xs text-emerald-700 font-medium">
                        Receipt image attached successfully.
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="payment-notes-input" className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1.5">
                      Additional Notes (Optional)
                    </label>
                    <input
                      id="payment-notes-input"
                      type="text"
                      placeholder="e.g. Sent from Meezan App under title Usman"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-sm text-[#252A27]"
                    />
                  </div>

                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-[11px] text-amber-900 leading-relaxed">
                    <strong>Important:</strong> Submitting a transaction reference or receipt notifies management for verification. A reservation is only confirmed once funds are independently verified in the property account.
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmittingPayment}
                      className="px-6 py-2.5 bg-[#173F35] hover:bg-[#1f5245] active:bg-[#0f2c25] disabled:bg-stone-400 text-white font-semibold rounded-lg text-sm cursor-pointer transition-colors"
                    >
                      {isSubmittingPayment ? 'Submitting Details...' : 'Submit Payment Reference'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
