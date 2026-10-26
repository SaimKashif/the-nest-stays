export type RoomCategory = 'standard' | 'deluxe' | 'suite' | 'family';

export interface Room {
  id: string;
  name: string;
  category: RoomCategory;
  description: string;
  longDescription: string;
  images: string[];
  beds: string;
  maxGuests: number;
  pricePerNight: number; // In PKR, taxes included
  taxesIncluded: boolean;
  amenities: string[];
  active: boolean;
  sizeSqFt: number;
  view: string;
  featured?: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'beverages';
  price: number; // In PKR
  description?: string;
  note?: string;
  verified: boolean;
  published: boolean;
}

export interface RefreshmentItem {
  id: string;
  name: string;
  size?: string;
  price: number; // In PKR
  unit: string;
}

export type BookingStatus =
  | 'pending_payment'
  | 'awaiting_verification'
  | 'pending_approval'
  | 'confirmed'
  | 'rejected'
  | 'cancelled';

export type PaymentMethod =
  | 'pay_at_property'
  | 'bank_transfer'
  | 'jazzcash'
  | 'easypaisa';

export type PaymentStatus =
  | 'unpaid'
  | 'awaiting_verification'
  | 'verified'
  | 'pay_on_arrival';

export interface PaymentSubmission {
  transactionRef: string;
  amount: number;
  submittedAt: string;
  receiptImage?: string;
  notes?: string;
}

export interface Booking {
  id: string;
  reference: string;
  roomId: string;
  roomName: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  nights: number;
  guestsCount: number;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  expectedArrivalTime?: string;
  specialRequests?: string;
  pricePerNight: number;
  extraGuestFee?: number;
  taxesIncluded: boolean;
  subtotal: number;
  advanceRequired: number;
  balanceDue: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  paymentSubmission?: PaymentSubmission;
  verifiedAmount?: number;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export type FollowUpStatus = 'pending' | 'contacted' | 'vip' | 'regular' | 'needs_attention';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city?: string;
  cnic?: string;
  notes?: string;
  followUpStatus: FollowUpStatus;
  followUpNotes?: string;
  lastContactedAt?: string;
  tags: string[];
  totalBookings: number;
  totalSpent: number;
  lastStayCheckIn?: string;
  lastStayCheckOut?: string;
  bookingReferences: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BlockedDate {
  id: string;
  roomId: string; // 'all' or room ID
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason: string;
}

export interface BankPaymentConfig {
  enabled: boolean;
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban: string;
  instructions: string;
}

export interface MobileWalletPaymentConfig {
  enabled: boolean;
  accountTitle: string;
  accountNumber: string;
  tillId?: string;
  instructions: string;
}

export interface PaymentConfig {
  requireAdvance: boolean;
  advancePercentage: number;
  allowPayAtProperty: boolean;
  payAtPropertyRequiresApproval: boolean;
  bank: BankPaymentConfig;
  jazzCash: MobileWalletPaymentConfig;
  easypaisa: MobileWalletPaymentConfig;
}

export interface PropertySettings {
  businessName: string;
  tagline: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  checkInTime: string;
  checkOutTime: string;
  googleMapsUrl: string;
  policies: {
    cancellation: string;
    payment: string;
    houseRules: string[];
  };
  paymentConfig: PaymentConfig;
  foodMenu: MenuItem[];
  refreshments: RefreshmentItem[];
}

export interface BookingRequestPayload {
  roomId: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  expectedArrivalTime?: string;
  specialRequests?: string;
  paymentMethod: PaymentMethod;
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email?: string;
  subject?: string;
  message: string;
  createdAt: string;
  read: boolean;
}
