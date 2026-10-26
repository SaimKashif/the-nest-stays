import type { Booking, BlockedDate, BookingRequestPayload } from '../types/index.ts';

/**
 * Calculates number of nights between check-in and check-out.
 * Hotel standard: check-in day is inclusive, check-out day is exclusive.
 */
export function calculateStayNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const inDate = new Date(`${checkIn}T00:00:00Z`);
  const outDate = new Date(`${checkOut}T00:00:00Z`);
  const diffTime = outDate.getTime() - inDate.getTime();
  if (isNaN(diffTime) || diffTime <= 0) return 0;
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Validates checkIn and checkOut dates.
 * Disallows past dates (relative to today or provided reference date) and same-day/inverted dates.
 */
export function isDateRangeValid(
  checkIn: string,
  checkOut: string,
  todayStr: string = new Date().toISOString().split('T')[0]
): { valid: boolean; error?: string } {
  if (!checkIn) return { valid: false, error: 'Check-in date is required.' };
  if (!checkOut) return { valid: false, error: 'Check-out date is required.' };

  if (checkIn < todayStr) {
    return { valid: false, error: 'Check-in date cannot be in the past.' };
  }

  if (checkOut <= checkIn) {
    return { valid: false, error: 'Check-out date must be after check-in date.' };
  }

  const nights = calculateStayNights(checkIn, checkOut);
  if (nights > 30) {
    return { valid: false, error: 'Maximum continuous booking length is 30 nights.' };
  }

  return { valid: true };
}

/**
 * Overlap check for two date intervals [startA, endA) and [startB, endB)
 * Exclusive check-out means endA === startB is valid (same day checkout and checkin).
 */
export function checkDateOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  return startA < endB && endA > startB;
}

/**
 * Checks if a specific room is available for [checkIn, checkOut)
 * Ignores cancelled or rejected bookings.
 */
export function isRoomAvailable(
  roomId: string,
  checkIn: string,
  checkOut: string,
  existingBookings: Booking[],
  blockedDates: BlockedDate[] = []
): boolean {
  // Check overlapping bookings for active or confirmed stays
  const hasBookingOverlap = existingBookings.some((b) => {
    if (b.roomId !== roomId) return false;
    if (b.status === 'cancelled' || b.status === 'rejected') return false;
    return checkDateOverlap(b.checkIn, b.checkOut, checkIn, checkOut);
  });

  if (hasBookingOverlap) return false;

  // Check owner blocked dates (maintenance / private use)
  const hasBlockOverlap = blockedDates.some((block) => {
    if (block.roomId !== 'all' && block.roomId !== roomId) return false;
    return checkDateOverlap(block.startDate, block.endDate, checkIn, checkOut);
  });

  return !hasBlockOverlap;
}

/**
 * Recalculates stay financial breakdown.
 * Tariff Rule:
 * - 1 or 2 guests: Standard rate (e.g. PKR 5,000 / night).
 * - 3 guests: Total rate is PKR 7,000 / night (PKR 2,000 extra guest surcharge per night).
 * - Maximum capacity: 3 guests.
 */
export function calculateStayPrice(
  basePricePerNight: number,
  nights: number,
  advancePercentage: number = 50,
  requireAdvance: boolean = true,
  guestsCount: number = 2
): {
  basePricePerNight: number;
  pricePerNight: number;
  extraGuestSurchargePerNight: number;
  guestsCount: number;
  nights: number;
  subtotal: number;
  advanceRequired: number;
  balanceDue: number;
  total: number;
} {
  const safeNights = Math.max(1, nights);
  const isThreeGuests = guestsCount >= 3;
  const extraGuestSurchargePerNight = isThreeGuests ? 2000 : 0;
  const effectivePricePerNight = isThreeGuests ? (basePricePerNight + 2000) : basePricePerNight;
  const subtotal = Math.round(effectivePricePerNight * safeNights);
  const total = subtotal;

  let advanceRequired = 0;
  if (requireAdvance && advancePercentage > 0) {
    advanceRequired = Math.round((total * Math.min(100, Math.max(0, advancePercentage))) / 100);
  }

  const balanceDue = total - advanceRequired;

  return {
    basePricePerNight,
    pricePerNight: effectivePricePerNight,
    extraGuestSurchargePerNight,
    guestsCount,
    nights: safeNights,
    subtotal,
    advanceRequired,
    balanceDue,
    total,
  };
}

/**
 * Formats numeric PKR amounts with Pakistani/International comma separators.
 */
export function formatPKR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return 'PKR 0';
  return `PKR ${amount.toLocaleString('en-PK')}`;
}

/**
 * Generates an elegant, unambiguous booking reference code like TNS-874291
 */
export function generateBookingReference(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Avoid 0/O, 1/I
  let randomPart = '';
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TNS-${randomPart}`;
}

/**
 * Validates booking submission fields.
 */
export function validateBookingForm(
  payload: Partial<BookingRequestPayload>,
  roomMaxGuests: number
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!payload.guestName || payload.guestName.trim().length < 2) {
    errors.guestName = 'Please enter your full name (minimum 2 characters).';
  }

  if (!payload.guestPhone || payload.guestPhone.trim().length < 7) {
    errors.guestPhone = 'Please provide a valid contact mobile phone number.';
  } else {
    // Basic phone validation (allowing international or local Pakistani formats)
    const phoneClean = payload.guestPhone.replace(/[\s\-\(\)]/g, '');
    if (!/^\+?[0-9]{8,15}$/.test(phoneClean)) {
      errors.guestPhone = 'Please enter a valid phone number (e.g., 0300 1234567 or +92 300 1234567).';
    }
  }

  if (payload.guestEmail && payload.guestEmail.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.guestEmail.trim())) {
      errors.guestEmail = 'Please provide a valid email address.';
    }
  }

  if (!payload.guestsCount || payload.guestsCount < 1) {
    errors.guestsCount = 'At least 1 guest must be specified.';
  } else if (payload.guestsCount > 3) {
    errors.guestsCount = 'A maximum of 3 guests are allowed per room (1-2 guests: PKR 5,000/night; 3 guests: PKR 7,000/night).';
  } else if (payload.guestsCount > roomMaxGuests) {
    errors.guestsCount = `This room accommodates a maximum of ${roomMaxGuests} guest${roomMaxGuests > 1 ? 's' : ''}.`;
  }

  if (!payload.checkIn || !payload.checkOut) {
    errors.dates = 'Please select both check-in and check-out dates.';
  } else {
    const dateCheck = isDateRangeValid(payload.checkIn, payload.checkOut);
    if (!dateCheck.valid) {
      errors.dates = dateCheck.error || 'Invalid date range.';
    }
  }

  if (!payload.paymentMethod) {
    errors.paymentMethod = 'Please select your preferred payment method.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
