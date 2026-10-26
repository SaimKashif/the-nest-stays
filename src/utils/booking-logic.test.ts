import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateStayNights,
  calculateStayPrice,
  isDateRangeValid,
  checkDateOverlap,
  isRoomAvailable,
  formatPKR,
  generateBookingReference,
  validateBookingForm,
} from './booking-logic.ts';
import type { Booking, BlockedDate } from '../types/index.ts';

test('calculateStayNights calculates standard hotel nights accurately', () => {
  assert.equal(calculateStayNights('2026-11-01', '2026-11-03'), 2);
  assert.equal(calculateStayNights('2026-11-01', '2026-11-02'), 1);
  assert.equal(calculateStayNights('2026-11-01', '2026-11-01'), 0);
  assert.equal(calculateStayNights('2026-11-05', '2026-11-02'), 0);
});

test('isDateRangeValid rejects past dates and invalid ranges', () => {
  const today = '2026-10-22';
  assert.equal(isDateRangeValid('2026-10-21', '2026-10-24', today).valid, false);
  assert.equal(isDateRangeValid('2026-10-23', '2026-10-23', today).valid, false);
  assert.equal(isDateRangeValid('2026-10-25', '2026-10-22', today).valid, false);
  assert.equal(isDateRangeValid('2026-10-23', '2026-10-25', today).valid, true);
});

test('checkDateOverlap respects exclusive check-out standard', () => {
  // Same day checkout and checkin does NOT overlap
  assert.equal(checkDateOverlap('2026-11-01', '2026-11-03', '2026-11-03', '2026-11-05'), false);
  assert.equal(checkDateOverlap('2026-11-03', '2026-11-05', '2026-11-01', '2026-11-03'), false);

  // Overlapping stays
  assert.equal(checkDateOverlap('2026-11-01', '2026-11-04', '2026-11-02', '2026-11-05'), true);
  assert.equal(checkDateOverlap('2026-11-02', '2026-11-03', '2026-11-01', '2026-11-05'), true);
  assert.equal(checkDateOverlap('2026-11-01', '2026-11-05', '2026-11-02', '2026-11-03'), true);
});

test('calculateStayPrice computes subtotal, advance deposit, and balance for 1-2 vs 3 guests', () => {
  // 1-2 guests: base PKR 5,000 per night
  const twoGuests = calculateStayPrice(5000, 3, 50, true, 2);
  assert.equal(twoGuests.pricePerNight, 5000);
  assert.equal(twoGuests.extraGuestSurchargePerNight, 0);
  assert.equal(twoGuests.subtotal, 15000);
  assert.equal(twoGuests.advanceRequired, 7500);
  assert.equal(twoGuests.balanceDue, 7500);
  assert.equal(twoGuests.total, 15000);

  // 3 guests: PKR 7,000 per night (+2,000 extra person surcharge)
  const threeGuests = calculateStayPrice(5000, 2, 50, true, 3);
  assert.equal(threeGuests.pricePerNight, 7000);
  assert.equal(threeGuests.extraGuestSurchargePerNight, 2000);
  assert.equal(threeGuests.subtotal, 14000);
  assert.equal(threeGuests.advanceRequired, 7000);
  assert.equal(threeGuests.balanceDue, 7000);
  assert.equal(threeGuests.total, 14000);

  // Zero advance required
  const noAdvance = calculateStayPrice(5000, 2, 0, false, 2);
  assert.equal(noAdvance.advanceRequired, 0);
  assert.equal(noAdvance.balanceDue, 10000);
  assert.equal(noAdvance.total, 10000);
});

test('isRoomAvailable accounts for confirmed bookings and maintenance blocks', () => {
  const mockBookings: Booking[] = [
    {
      id: 'b1',
      reference: 'TNS-123456',
      roomId: 'room-1',
      roomName: 'Deluxe Suite',
      checkIn: '2026-11-10',
      checkOut: '2026-11-14',
      nights: 4,
      guestsCount: 2,
      guestName: 'Ali Khan',
      guestPhone: '03001234567',
      pricePerNight: 15000,
      taxesIncluded: true,
      subtotal: 60000,
      advanceRequired: 30000,
      balanceDue: 30000,
      total: 60000,
      paymentMethod: 'bank_transfer',
      paymentStatus: 'verified',
      status: 'confirmed',
      createdAt: '2026-10-20',
      updatedAt: '2026-10-20',
    },
    {
      id: 'b2',
      reference: 'TNS-999999',
      roomId: 'room-1',
      roomName: 'Deluxe Suite',
      checkIn: '2026-11-15',
      checkOut: '2026-11-18',
      nights: 3,
      guestsCount: 2,
      guestName: 'Cancelled Guest',
      guestPhone: '03009999999',
      pricePerNight: 15000,
      taxesIncluded: true,
      subtotal: 45000,
      advanceRequired: 22500,
      balanceDue: 22500,
      total: 45000,
      paymentMethod: 'bank_transfer',
      paymentStatus: 'unpaid',
      status: 'cancelled',
      createdAt: '2026-10-20',
      updatedAt: '2026-10-20',
    },
  ];

  const mockBlocks: BlockedDate[] = [
    {
      id: 'block-1',
      roomId: 'room-1',
      startDate: '2026-11-20',
      endDate: '2026-11-22',
      reason: 'Deep Cleaning',
    },
  ];

  // Overlap with confirmed booking
  assert.equal(isRoomAvailable('room-1', '2026-11-12', '2026-11-15', mockBookings, mockBlocks), false);

  // Directly after checkout date (hotel standard: checkout morning, checkin afternoon)
  assert.equal(isRoomAvailable('room-1', '2026-11-14', '2026-11-15', mockBookings, mockBlocks), true);

  // Overlap with cancelled booking should still be AVAILABLE
  assert.equal(isRoomAvailable('room-1', '2026-11-15', '2026-11-18', mockBookings, mockBlocks), true);

  // Overlap with blocked maintenance date
  assert.equal(isRoomAvailable('room-1', '2026-11-21', '2026-11-23', mockBookings, mockBlocks), false);

  // Different room is available
  assert.equal(isRoomAvailable('room-2', '2026-11-10', '2026-11-14', mockBookings, mockBlocks), true);
});

test('formatPKR formats currency cleanly', () => {
  assert.equal(formatPKR(18500), 'PKR 18,500');
  assert.equal(formatPKR(0), 'PKR 0');
});

test('generateBookingReference creates format TNS-XXXXXX', () => {
  const ref = generateBookingReference();
  assert.match(ref, /^TNS-[2-9A-HJ-NP-Z]{6}$/);
});

test('validateBookingForm detects errors and passes valid payload', () => {
  const invalid = validateBookingForm(
    {
      guestName: 'A',
      guestPhone: '123',
      guestEmail: 'not-an-email',
      guestsCount: 5,
    },
    2
  );
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.guestName);
  assert.ok(invalid.errors.guestPhone);
  assert.ok(invalid.errors.guestEmail);
  assert.ok(invalid.errors.guestsCount);
  assert.ok(invalid.errors.dates);
  assert.ok(invalid.errors.paymentMethod);

  const valid = validateBookingForm(
    {
      guestName: 'Usman Tariq',
      guestPhone: '+92 300 4567890',
      guestEmail: 'usman@example.com',
      guestsCount: 2,
      checkIn: '2026-11-10',
      checkOut: '2026-11-13',
      paymentMethod: 'bank_transfer',
    },
    3
  );
  assert.equal(valid.valid, true);
  assert.equal(Object.keys(valid.errors).length, 0);
});
