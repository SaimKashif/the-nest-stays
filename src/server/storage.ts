import fs from 'fs';
import path from 'path';
import type {
  Room,
  Booking,
  BlockedDate,
  PropertySettings,
  ContactMessage,
  MenuItem,
  RefreshmentItem,
  Customer,
  FollowUpStatus,
} from '../types/index.ts';
import {
  isRoomAvailable,
  calculateStayPrice,
  generateBookingReference,
  calculateStayNights,
} from '../utils/booking-logic.ts';

export interface DatabaseSchema {
  rooms: Room[];
  bookings: Booking[];
  customers: Customer[];
  blockedDates: BlockedDate[];
  settings: PropertySettings;
  contactMessages: ContactMessage[];
  admin: {
    username: string;
    passwordHash: string;
  };
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const INITIAL_REFRESHMENTS: RefreshmentItem[] = [
  { id: 'ref-1', name: 'Mineral Water', size: '500 ml', price: 150, unit: 'each' },
  { id: 'ref-2', name: 'Coca-Cola Can', size: '330 ml', price: 300, unit: 'each' },
  { id: 'ref-3', name: 'Salted Peanuts', size: 'Standard pack', price: 150, unit: 'per pack' },
  { id: 'ref-4', name: 'Lays Chips', size: 'Standard pack', price: 200, unit: 'per pack' },
  { id: 'ref-5', name: 'Chocolate', size: 'Individual piece', price: 200, unit: 'per piece' },
];

const INITIAL_FOOD_MENU: MenuItem[] = [
  // Breakfast
  {
    id: 'food-b1',
    name: 'Paratha (Plain / Aloo / Cheese)',
    category: 'breakfast',
    price: 400,
    description: 'Freshly prepared crispy paratha served with butter.',
    verified: true,
    published: true,
  },
  {
    id: 'food-b2',
    name: 'Omelette (2 Eggs)',
    category: 'breakfast',
    price: 300,
    description: 'Classic Pakistani style or plain omelette with green chillies & coriander.',
    verified: true,
    published: true,
  },
  {
    id: 'food-b3',
    name: 'Plain Yogurt',
    category: 'breakfast',
    price: 380,
    description: 'Fresh, chilled homemade plain curd/dahi.',
    verified: true,
    published: true,
  },
  {
    id: 'food-b4',
    name: 'Tea / Coffee',
    category: 'breakfast',
    price: 200,
    description: 'Hot brewed traditional Karak Chai or instant coffee.',
    note: 'Subject to owner verification before publishing',
    verified: false,
    published: true,
  },

  // Lunch & Light Meals
  {
    id: 'food-l1',
    name: 'Chicken Biryani with Raita',
    category: 'lunch',
    price: 850,
    description: 'Aromatic basmati rice cooked with tender chicken and authentic spices, served with fresh mint raita.',
    verified: true,
    published: true,
  },
  {
    id: 'food-l2',
    name: 'Daal Chawal',
    category: 'lunch',
    price: 600,
    description: 'Comforting yellow lentils tempered with cumin, garlic and ghee, served with steamed basmati rice.',
    verified: true,
    published: true,
  },
  {
    id: 'food-l3',
    name: 'Chicken Sandwich with Fries',
    category: 'lunch',
    price: 1500,
    description: 'Toasted sandwich packed with shredded chicken, mayo and herbs, served with golden potato fries.',
    verified: true,
    published: true,
  },
  {
    id: 'food-l4',
    name: 'Club Sandwich with Fries',
    category: 'lunch',
    price: 1500,
    description: 'Triple-decker toasted sandwich with chicken, egg, cucumber, tomato and cheese, served with fries.',
    verified: true,
    published: true,
  },
  {
    id: 'food-l5',
    name: 'Fresh Salad',
    category: 'lunch',
    price: 250,
    description: 'Crisp seasonal vegetables (cucumber, tomato, onion, lemon).',
    verified: true,
    published: true,
  },
  {
    id: 'food-l6',
    name: 'Lunch Chicken Karahi',
    category: 'lunch',
    price: 0,
    description: 'Traditional wok-cooked chicken karahi (lunch portion).',
    note: 'Printed price is unclear; unpublished until verified by owner.',
    verified: false,
    published: false, // Left unpublished until owner verified
  },

  // Dinner
  {
    id: 'food-d1',
    name: 'Chicken Karahi with Naan / Roti',
    category: 'dinner',
    price: 2500,
    description: 'Rich tomato, ginger, garlic wok gravy cooked with chicken, served piping hot with fresh tandoori naan or roti.',
    verified: true,
    published: true,
  },
  {
    id: 'food-d2',
    name: 'Chicken Biryani with Raita',
    category: 'dinner',
    price: 850,
    description: 'Fragrant layered spiced basmati rice with chicken and raita.',
    verified: true,
    published: true,
  },
  {
    id: 'food-d3',
    name: 'Mutton Karahi with Naan / Roti',
    category: 'dinner',
    price: 2900,
    description: 'Succulent mutton slow-simmered in karahi spices, green chillies and fresh ginger, served with fresh naan/roti.',
    verified: true,
    published: true,
  },
  {
    id: 'food-d4',
    name: 'Daal Chawal',
    category: 'dinner',
    price: 600,
    description: 'Homestyle spiced lentils served with warm steamed rice.',
    verified: true,
    published: true,
  },
  {
    id: 'food-d5',
    name: 'Chicken Tikka (6 Pieces)',
    category: 'dinner',
    price: 850,
    description: 'Charcoal-grilled marinated spicy boneless chicken cubes served with mint chutney and lemon wedges.',
    verified: true,
    published: true,
  },
  {
    id: 'food-d6',
    name: 'Raita',
    category: 'dinner',
    price: 200,
    description: 'Seasoned whipped yogurt with cumin and roasted herbs.',
    verified: true,
    published: true,
  },

  // Beverages
  {
    id: 'food-bev1',
    name: 'Coke',
    category: 'beverages',
    price: 300,
    description: 'Chilled 330 ml can.',
    verified: true,
    published: true,
  },
  {
    id: 'food-bev2',
    name: 'Sprite',
    category: 'beverages',
    price: 300,
    description: 'Chilled 330 ml can.',
    verified: true,
    published: true,
  },
  {
    id: 'food-bev3',
    name: 'Mineral Water',
    category: 'beverages',
    price: 150,
    description: '500 ml sealed drinking water bottle.',
    verified: true,
    published: true,
  },
];

const INITIAL_SETTINGS: PropertySettings = {
  businessName: 'The Nest Stays',
  tagline: 'Where Comfort Meets Care',
  address: 'Street Number 3, opposite UCP Mufti Town, near Qalma Chownk, Mufti Colony, Gujranwala, 52250, Pakistan',
  phone: '0300 1468362',
  whatsapp: '+923001468362',
  email: 'info@theneststays.pk',
  checkInTime: '2:00 PM',
  checkOutTime: '12:00 PM',
  googleMapsUrl: 'https://maps.google.com/?q=Street+Number+3+opposite+UCP+Mufti+Town+near+Qalma+Chownk+Mufti+Colony+Gujranwala+52250+Pakistan',
  policies: {
    cancellation:
      'Free cancellation up to 48 hours before check-in. Cancellations within 48 hours are subject to property policy. Applicable taxes are included in room tariff.',
    payment:
      'Applicable taxes are included in the room tariff. Pay at the property upon arrival, or transfer an advance deposit to property-configured accounts. All advance payments undergo manual verification.',
    houseRules: [
      'Check-in is at 2:00 PM; Check-out is strictly at 12:00 PM',
      'Valid Original CNIC / Passport required for all adult guests at check-in',
      'Quiet hours observed after 11:00 PM for the peaceful comfort of all guests',
      'Non-smoking rooms; designated outdoor areas available',
      'In-room refreshments (mini-bar) are optional and charged separately upon consumption',
    ],
  },
  paymentConfig: {
    requireAdvance: false, // Flexible deposit: can pay on arrival or advance
    advancePercentage: 50,
    allowPayAtProperty: true,
    payAtPropertyRequiresApproval: false,
    bank: {
      enabled: false, // Configurable by owner in admin
      bankName: '',
      accountTitle: '',
      accountNumber: '',
      iban: '',
      instructions: 'Please contact front desk or configure bank details in the owner portal.',
    },
    jazzCash: {
      enabled: false,
      accountTitle: '',
      accountNumber: '',
      tillId: '',
      instructions: 'Please configure JazzCash instructions in the owner portal.',
    },
    easypaisa: {
      enabled: false,
      accountTitle: '',
      accountNumber: '',
      instructions: 'Please configure Easypaisa instructions in the owner portal.',
    },
  },
  foodMenu: INITIAL_FOOD_MENU,
  refreshments: INITIAL_REFRESHMENTS,
};

// Verified Room Tariff: Standard Room at PKR 5,000 per night (1-2 guests) or PKR 7,000 per night (3 guests)
const INITIAL_ROOMS: Room[] = [
  {
    id: 'room-standard',
    name: 'Standard Room',
    category: 'standard',
    description:
      'Comfortable guest room with air conditioning, Smart TV, high-speed Wi-Fi, and en-suite bathroom. Standard tariff: 1-2 guests at PKR 5,000/night; 3 guests at PKR 7,000/night.',
    longDescription:
      'The Standard Room at The Nest Stays provides a serene, spotless haven equipped with comfortable queen/double bedding, individual air conditioning, a modern Smart TV, high-speed Wi-Fi, fresh linens, plush towels, and daily housekeeping. Standard tariff: PKR 5,000/night for 1-2 guests; PKR 7,000/night for 3 guests. Applicable taxes included.',
    images: ['/src/assets/images/room_deluxe_suite_1792648895537.jpg'],
    beds: '1 Queen Bed',
    maxGuests: 3,
    pricePerNight: 5000,
    taxesIncluded: true,
    amenities: [
      'High-speed Wi-Fi',
      'Smart TV',
      'Air conditioning',
      'Fresh towels',
      'Toiletries',
      'Wardrobe',
      'Housekeeping',
    ],
    active: true,
    sizeSqFt: 280,
    view: 'Mufti Colony View',
    featured: true,
  },
];

class StorageService {
  private db: DatabaseSchema;
  private writeLock: Promise<void> = Promise.resolve();

  constructor() {
    this.db = this.loadFromDisk();
  }

  private loadFromDisk(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);

        // Ensure new schema keys exist
        if (!parsed.customers) parsed.customers = [];
        if (!parsed.settings.foodMenu) parsed.settings.foodMenu = INITIAL_FOOD_MENU;
        if (!parsed.settings.refreshments) parsed.settings.refreshments = INITIAL_REFRESHMENTS;
        parsed.settings.tagline = 'Where Comfort Meets Care';
        parsed.settings.address = 'Street Number 3, opposite UCP Mufti Town, near Qalma Chownk, Mufti Colony, Gujranwala, 52250, Pakistan';
        parsed.settings.phone = '0300 1468362';
        parsed.settings.whatsapp = '+923001468362';
        parsed.settings.googleMapsUrl = 'https://maps.google.com/?q=Street+Number+3+opposite+UCP+Mufti+Town+near+Qalma+Chownk+Mufti+Colony+Gujranwala+52250+Pakistan';
        parsed.settings.checkInTime = '2:00 PM';
        parsed.settings.checkOutTime = '12:00 PM';

        // Sync standard room rate and capacity
        const stdRoom = parsed.rooms.find((r: Room) => r.id === 'room-standard');
        if (stdRoom) {
          stdRoom.maxGuests = 3;
          stdRoom.pricePerNight = 5000;
          stdRoom.taxesIncluded = true;
          stdRoom.description =
            'Comfortable guest room with air conditioning, Smart TV, high-speed Wi-Fi, and en-suite bathroom. Standard tariff: 1-2 guests at PKR 5,000/night; 3 guests at PKR 7,000/night.';
          stdRoom.longDescription =
            'The Standard Room at The Nest Stays provides a serene, spotless haven equipped with comfortable queen/double bedding, individual air conditioning, a modern Smart TV, high-speed Wi-Fi, fresh linens, plush towels, and daily housekeeping. Standard tariff: PKR 5,000/night for 1-2 guests; PKR 7,000/night for 3 guests. Applicable taxes included.';
          stdRoom.amenities = [
            'High-speed Wi-Fi',
            'Smart TV',
            'Air conditioning',
            'Fresh towels',
            'Toiletries',
            'Wardrobe',
            'Housekeeping',
          ];
        } else {
          parsed.rooms = INITIAL_ROOMS;
        }

        // Sync customers from bookings if any are missing
        this.syncCustomersFromBookings(parsed);

        return parsed;
      }
    } catch (err) {
      console.error('Error loading db.json, initializing defaults:', err);
    }

    const defaultDb: DatabaseSchema = {
      rooms: INITIAL_ROOMS,
      bookings: [],
      customers: [],
      blockedDates: [],
      settings: INITIAL_SETTINGS,
      contactMessages: [],
      admin: {
        username: 'owner@theneststays.pk',
        passwordHash: 'NestStays@2026',
      },
    };
    this.saveToDiskSync(defaultDb);
    return defaultDb;
  }

  private syncCustomersFromBookings(data: DatabaseSchema) {
    if (!Array.isArray(data.bookings)) return;
    if (!Array.isArray(data.customers)) data.customers = [];

    for (const b of data.bookings) {
      const cleanPhone = b.guestPhone.replace(/[\s\-\(\)]/g, '');
      let cust = data.customers.find(
        (c) => c.phone.replace(/[\s\-\(\)]/g, '') === cleanPhone
      );
      if (!cust) {
        cust = {
          id: `cust-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: b.guestName,
          phone: b.guestPhone,
          email: b.guestEmail,
          followUpStatus: 'pending',
          tags: ['Guest'],
          totalBookings: 1,
          totalSpent: b.total || 0,
          lastStayCheckIn: b.checkIn,
          lastStayCheckOut: b.checkOut,
          bookingReferences: [b.reference],
          createdAt: b.createdAt || new Date().toISOString(),
          updatedAt: b.updatedAt || new Date().toISOString(),
        };
        data.customers.push(cust);
      } else {
        if (!cust.bookingReferences.includes(b.reference)) {
          cust.bookingReferences.push(b.reference);
          cust.totalBookings += 1;
          cust.totalSpent += (b.total || 0);
        }
        if (!cust.lastStayCheckIn || b.checkIn > cust.lastStayCheckIn) {
          cust.lastStayCheckIn = b.checkIn;
          cust.lastStayCheckOut = b.checkOut;
        }
      }
    }
  }

  private saveToDiskSync(data: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write db.json:', err);
    }
  }

  private async persist(): Promise<void> {
    this.writeLock = this.writeLock.then(async () => {
      await fs.promises.writeFile(DB_FILE, JSON.stringify(this.db, null, 2), 'utf-8');
    });
    return this.writeLock;
  }

  // Settings
  public getSettings(): PropertySettings {
    return this.db.settings;
  }

  public async updateSettings(newSettings: Partial<PropertySettings>): Promise<PropertySettings> {
    this.db.settings = { ...this.db.settings, ...newSettings };
    await this.persist();
    return this.db.settings;
  }

  // Food Menu
  public getFoodMenu(onlyPublished = true): MenuItem[] {
    const menu = this.db.settings.foodMenu || INITIAL_FOOD_MENU;
    if (onlyPublished) {
      return menu.filter((item) => item.published);
    }
    return menu;
  }

  public async updateFoodMenu(menu: MenuItem[]): Promise<MenuItem[]> {
    this.db.settings.foodMenu = menu;
    await this.persist();
    return this.db.settings.foodMenu;
  }

  // Refreshments
  public getRefreshments(): RefreshmentItem[] {
    return this.db.settings.refreshments || INITIAL_REFRESHMENTS;
  }

  public async updateRefreshments(items: RefreshmentItem[]): Promise<RefreshmentItem[]> {
    this.db.settings.refreshments = items;
    await this.persist();
    return this.db.settings.refreshments;
  }

  // Rooms
  public getRooms(onlyActive = true): Room[] {
    if (onlyActive) {
      return this.db.rooms.filter((r) => r.active);
    }
    return this.db.rooms;
  }

  public getRoomById(id: string): Room | undefined {
    return this.db.rooms.find((r) => r.id === id);
  }

  public async saveRoom(room: Room): Promise<Room> {
    const idx = this.db.rooms.findIndex((r) => r.id === room.id);
    if (idx >= 0) {
      this.db.rooms[idx] = room;
    } else {
      this.db.rooms.push(room);
    }
    await this.persist();
    return room;
  }

  public async deleteRoom(id: string): Promise<boolean> {
    const prevLen = this.db.rooms.length;
    this.db.rooms = this.db.rooms.filter((r) => r.id !== id);
    if (this.db.rooms.length !== prevLen) {
      await this.persist();
      return true;
    }
    return false;
  }

  // Blocked Dates
  public getBlockedDates(): BlockedDate[] {
    return this.db.blockedDates;
  }

  public async addBlockedDate(block: Omit<BlockedDate, 'id'>): Promise<BlockedDate> {
    const newBlock: BlockedDate = {
      ...block,
      id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    this.db.blockedDates.push(newBlock);
    await this.persist();
    return newBlock;
  }

  public async deleteBlockedDate(id: string): Promise<boolean> {
    const prev = this.db.blockedDates.length;
    this.db.blockedDates = this.db.blockedDates.filter((b) => b.id !== id);
    if (this.db.blockedDates.length !== prev) {
      await this.persist();
      return true;
    }
    return false;
  }

  // Availability checking
  public checkAvailability(checkIn: string, checkOut: string, guestsCount: number) {
    const availableRooms = this.db.rooms.filter((room) => {
      if (!room.active) return false;
      if (guestsCount && room.maxGuests < guestsCount) return false;
      return isRoomAvailable(room.id, checkIn, checkOut, this.db.bookings, this.db.blockedDates);
    });

    return {
      checkIn,
      checkOut,
      guestsCount,
      nights: calculateStayNights(checkIn, checkOut),
      availableRooms,
    };
  }

  // Bookings
  public async createBooking(payload: {
    roomId: string;
    checkIn: string;
    checkOut: string;
    guestsCount: number;
    guestName: string;
    guestPhone: string;
    guestEmail?: string;
    expectedArrivalTime?: string;
    specialRequests?: string;
    paymentMethod: Booking['paymentMethod'];
  }): Promise<{ success: boolean; booking?: Booking; error?: string }> {
    const room = this.getRoomById(payload.roomId);
    if (!room || !room.active) {
      return { success: false, error: 'Selected room is not available or does not exist.' };
    }

    if (payload.guestsCount > room.maxGuests) {
      return {
        success: false,
        error: `Room ${room.name} accommodates at most ${room.maxGuests} guests.`,
      };
    }

    const available = isRoomAvailable(
      room.id,
      payload.checkIn,
      payload.checkOut,
      this.db.bookings,
      this.db.blockedDates
    );

    if (!available) {
      return {
        success: false,
        error: 'This room is no longer available for the selected dates. Please pick alternative dates or another room.',
      };
    }

    const nights = calculateStayNights(payload.checkIn, payload.checkOut);
    if (nights <= 0) {
      return { success: false, error: 'Invalid stay duration.' };
    }

    const { paymentConfig } = this.db.settings;

    if (payload.paymentMethod === 'bank_transfer' && !paymentConfig.bank.enabled) {
      return { success: false, error: 'Bank transfer is currently disabled by property.' };
    }
    if (payload.paymentMethod === 'jazzcash' && !paymentConfig.jazzCash.enabled) {
      return { success: false, error: 'JazzCash payment is currently disabled by property.' };
    }
    if (payload.paymentMethod === 'easypaisa' && !paymentConfig.easypaisa.enabled) {
      return { success: false, error: 'Easypaisa payment is currently disabled by property.' };
    }
    if (payload.paymentMethod === 'pay_at_property' && !paymentConfig.allowPayAtProperty) {
      return { success: false, error: 'Pay at property is currently disabled.' };
    }

    const pricing = calculateStayPrice(
      room.pricePerNight,
      nights,
      paymentConfig.advancePercentage,
      paymentConfig.requireAdvance,
      payload.guestsCount
    );

    let status: Booking['status'] = 'pending_payment';
    let paymentStatus: Booking['paymentStatus'] = 'unpaid';

    if (payload.paymentMethod === 'pay_at_property') {
      paymentStatus = 'pay_on_arrival';
      status = paymentConfig.payAtPropertyRequiresApproval ? 'pending_approval' : 'confirmed';
    }

    const newBooking: Booking = {
      id: `book-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      reference: generateBookingReference(),
      roomId: room.id,
      roomName: room.name,
      checkIn: payload.checkIn,
      checkOut: payload.checkOut,
      nights,
      guestsCount: payload.guestsCount,
      guestName: payload.guestName.trim(),
      guestPhone: payload.guestPhone.trim(),
      guestEmail: payload.guestEmail?.trim(),
      expectedArrivalTime: payload.expectedArrivalTime?.trim(),
      specialRequests: payload.specialRequests?.trim(),
      pricePerNight: pricing.pricePerNight,
      extraGuestFee: pricing.extraGuestSurchargePerNight,
      taxesIncluded: true,
      subtotal: pricing.subtotal,
      advanceRequired: payload.paymentMethod === 'pay_at_property' ? 0 : pricing.advanceRequired,
      balanceDue: payload.paymentMethod === 'pay_at_property' ? pricing.total : pricing.balanceDue,
      total: pricing.total,
      paymentMethod: payload.paymentMethod,
      paymentStatus,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.db.bookings.push(newBooking);

    // Record or update customer directory for front desk and follow-up
    this.recordCustomerStay({
      name: newBooking.guestName,
      phone: newBooking.guestPhone,
      email: newBooking.guestEmail,
      bookingRef: newBooking.reference,
      totalAmount: newBooking.total,
      checkIn: newBooking.checkIn,
      checkOut: newBooking.checkOut,
    });

    await this.persist();

    return { success: true, booking: newBooking };
  }

  public getBookingByReference(reference: string): Booking | undefined {
    return this.db.bookings.find(
      (b) => b.reference.toUpperCase() === reference.toUpperCase()
    );
  }

  public getBookingById(id: string): Booking | undefined {
    return this.db.bookings.find((b) => b.id === id);
  }

  public getAllBookings(): Booking[] {
    return [...this.db.bookings].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public async submitAdvancePayment(
    reference: string,
    submission: {
      transactionRef: string;
      amount: number;
      receiptImage?: string;
      notes?: string;
    }
  ): Promise<{ success: boolean; booking?: Booking; error?: string }> {
    const booking = this.getBookingByReference(reference);
    if (!booking) {
      return { success: false, error: 'Booking reference not found.' };
    }

    if (booking.status === 'cancelled' || booking.status === 'rejected') {
      return { success: false, error: 'Cannot submit payment for a cancelled or rejected booking.' };
    }

    if (!submission.transactionRef || submission.transactionRef.trim().length < 3) {
      return { success: false, error: 'Please provide a valid transaction reference.' };
    }

    if (!submission.amount || submission.amount <= 0) {
      return { success: false, error: 'Please enter the amount transferred.' };
    }

    booking.paymentSubmission = {
      transactionRef: submission.transactionRef.trim(),
      amount: Number(submission.amount),
      submittedAt: new Date().toISOString(),
      receiptImage: submission.receiptImage,
      notes: submission.notes?.trim(),
    };

    booking.paymentStatus = 'awaiting_verification';
    booking.status = 'awaiting_verification';
    booking.updatedAt = new Date().toISOString();

    await this.persist();
    return { success: true, booking };
  }

  public async verifyPayment(
    bookingId: string,
    action: 'verify' | 'reject',
    verifiedAmount?: number,
    adminNotes?: string
  ): Promise<{ success: boolean; booking?: Booking; error?: string }> {
    const booking = this.getBookingById(bookingId);
    if (!booking) {
      return { success: false, error: 'Booking not found.' };
    }

    if (action === 'verify') {
      const amount = verifiedAmount !== undefined ? verifiedAmount : booking.advanceRequired;
      booking.verifiedAmount = amount;
      booking.paymentStatus = 'verified';
      booking.status = 'confirmed';
      booking.balanceDue = Math.max(0, booking.total - amount);
      if (adminNotes) booking.adminNotes = adminNotes;
    } else {
      booking.paymentStatus = 'unpaid';
      booking.status = 'pending_payment';
      if (adminNotes) booking.adminNotes = adminNotes;
    }

    booking.updatedAt = new Date().toISOString();
    await this.persist();
    return { success: true, booking };
  }

  public async updateBookingStatus(
    bookingId: string,
    status: Booking['status'],
    adminNotes?: string
  ): Promise<{ success: boolean; booking?: Booking; error?: string }> {
    const booking = this.getBookingById(bookingId);
    if (!booking) {
      return { success: false, error: 'Booking not found.' };
    }

    booking.status = status;
    if (status === 'confirmed' && booking.paymentMethod === 'pay_at_property') {
      booking.paymentStatus = 'pay_on_arrival';
    }
    if (adminNotes) booking.adminNotes = adminNotes;
    booking.updatedAt = new Date().toISOString();

    await this.persist();
    return { success: true, booking };
  }

  // Customer Directory & Follow-Up Management
  public recordCustomerStay(params: {
    name: string;
    phone: string;
    email?: string;
    bookingRef: string;
    totalAmount: number;
    checkIn: string;
    checkOut: string;
  }): void {
    if (!this.db.customers) this.db.customers = [];
    const cleanPhone = params.phone.replace(/[\s\-\(\)]/g, '');
    let customer = this.db.customers.find(
      (c) => c.phone.replace(/[\s\-\(\)]/g, '') === cleanPhone
    );

    if (!customer) {
      customer = {
        id: `cust-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: params.name,
        phone: params.phone,
        email: params.email,
        followUpStatus: 'pending',
        tags: ['New Guest'],
        totalBookings: 1,
        totalSpent: params.totalAmount,
        lastStayCheckIn: params.checkIn,
        lastStayCheckOut: params.checkOut,
        bookingReferences: [params.bookingRef],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.db.customers.push(customer);
    } else {
      // Update existing customer record
      if (!customer.bookingReferences.includes(params.bookingRef)) {
        customer.bookingReferences.push(params.bookingRef);
        customer.totalBookings += 1;
        customer.totalSpent += params.totalAmount;
      }
      if (params.email && !customer.email) {
        customer.email = params.email;
      }
      if (params.name && params.name.length >= customer.name.length) {
        customer.name = params.name;
      }
      if (!customer.lastStayCheckIn || params.checkIn > customer.lastStayCheckIn) {
        customer.lastStayCheckIn = params.checkIn;
        customer.lastStayCheckOut = params.checkOut;
      }
      customer.updatedAt = new Date().toISOString();
    }
  }

  public getCustomers(): Customer[] {
    if (!this.db.customers) this.db.customers = [];
    return [...this.db.customers].sort((a, b) => {
      const aTime = a.lastStayCheckIn ? new Date(a.lastStayCheckIn).getTime() : new Date(a.createdAt).getTime();
      const bTime = b.lastStayCheckIn ? new Date(b.lastStayCheckIn).getTime() : new Date(b.createdAt).getTime();
      return bTime - aTime;
    });
  }

  public getCustomerById(id: string): Customer | undefined {
    if (!this.db.customers) this.db.customers = [];
    return this.db.customers.find((c) => c.id === id);
  }

  public async createCustomer(payload: Partial<Customer>): Promise<Customer> {
    if (!this.db.customers) this.db.customers = [];
    const newCustomer: Customer = {
      id: `cust-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: payload.name?.trim() || 'Guest',
      phone: payload.phone?.trim() || '',
      email: payload.email?.trim(),
      city: payload.city?.trim(),
      cnic: payload.cnic?.trim(),
      notes: payload.notes?.trim(),
      followUpStatus: payload.followUpStatus || 'pending',
      followUpNotes: payload.followUpNotes?.trim(),
      lastContactedAt: payload.lastContactedAt,
      tags: Array.isArray(payload.tags) && payload.tags.length > 0 ? payload.tags : ['Guest'],
      totalBookings: payload.totalBookings || 0,
      totalSpent: payload.totalSpent || 0,
      lastStayCheckIn: payload.lastStayCheckIn,
      lastStayCheckOut: payload.lastStayCheckOut,
      bookingReferences: Array.isArray(payload.bookingReferences) ? payload.bookingReferences : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.db.customers.push(newCustomer);
    await this.persist();
    return newCustomer;
  }

  public async updateCustomer(
    id: string,
    updates: Partial<Customer>
  ): Promise<{ success: boolean; customer?: Customer; error?: string }> {
    if (!this.db.customers) this.db.customers = [];
    const idx = this.db.customers.findIndex((c) => c.id === id);
    if (idx < 0) {
      return { success: false, error: 'Customer not found.' };
    }

    const current = this.db.customers[idx];
    const updated: Customer = {
      ...current,
      ...updates,
      id: current.id,
      updatedAt: new Date().toISOString(),
    };

    this.db.customers[idx] = updated;
    await this.persist();
    return { success: true, customer: updated };
  }

  public async deleteCustomer(id: string): Promise<boolean> {
    if (!this.db.customers) return false;
    const prev = this.db.customers.length;
    this.db.customers = this.db.customers.filter((c) => c.id !== id);
    if (this.db.customers.length !== prev) {
      await this.persist();
      return true;
    }
    return false;
  }

  // Edit / Update Booking by Front Desk
  public async updateBooking(
    bookingId: string,
    updates: Partial<Booking>
  ): Promise<{ success: boolean; booking?: Booking; error?: string }> {
    const booking = this.getBookingById(bookingId);
    if (!booking) {
      return { success: false, error: 'Booking not found.' };
    }

    // If dates or guests count changed, recheck pricing
    if (updates.checkIn || updates.checkOut || updates.guestsCount) {
      const room = this.getRoomById(booking.roomId) || INITIAL_ROOMS[0];
      const newIn = updates.checkIn || booking.checkIn;
      const newOut = updates.checkOut || booking.checkOut;
      const newGuests = updates.guestsCount || booking.guestsCount;
      const nights = calculateStayNights(newIn, newOut);

      if (nights > 0) {
        const pricing = calculateStayPrice(
          room.pricePerNight,
          nights,
          this.db.settings.paymentConfig.advancePercentage,
          this.db.settings.paymentConfig.requireAdvance,
          newGuests
        );
        booking.nights = nights;
        booking.checkIn = newIn;
        booking.checkOut = newOut;
        booking.guestsCount = newGuests;
        booking.pricePerNight = pricing.pricePerNight;
        booking.extraGuestFee = pricing.extraGuestSurchargePerNight;
        booking.subtotal = pricing.subtotal;
        booking.total = pricing.total;
        booking.balanceDue = Math.max(0, pricing.total - (booking.verifiedAmount || 0));
      }
    }

    if (updates.guestName !== undefined) booking.guestName = updates.guestName.trim();
    if (updates.guestPhone !== undefined) booking.guestPhone = updates.guestPhone.trim();
    if (updates.guestEmail !== undefined) booking.guestEmail = updates.guestEmail.trim();
    if (updates.expectedArrivalTime !== undefined) booking.expectedArrivalTime = updates.expectedArrivalTime;
    if (updates.specialRequests !== undefined) booking.specialRequests = updates.specialRequests;
    if (updates.adminNotes !== undefined) booking.adminNotes = updates.adminNotes;
    if (updates.status !== undefined) booking.status = updates.status;
    if (updates.paymentStatus !== undefined) booking.paymentStatus = updates.paymentStatus;

    booking.updatedAt = new Date().toISOString();
    await this.persist();

    return { success: true, booking };
  }

  // Contact Messages
  public async addContactMessage(msg: Omit<ContactMessage, 'id' | 'createdAt' | 'read'>): Promise<ContactMessage> {
    const newMsg: ContactMessage = {
      ...msg,
      id: `msg-${Date.now()}`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    this.db.contactMessages.push(newMsg);
    await this.persist();
    return newMsg;
  }

  public getContactMessages(): ContactMessage[] {
    return [...this.db.contactMessages].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public async markContactMessageRead(id: string): Promise<boolean> {
    const msg = this.db.contactMessages.find((m) => m.id === id);
    if (msg) {
      msg.read = true;
      await this.persist();
      return true;
    }
    return false;
  }

  public verifyAdminCredentials(username: string, pass: string): boolean {
    return (
      (username === this.db.admin.username || username === 'admin') &&
      pass === this.db.admin.passwordHash
    );
  }

  public async updateAdminPassword(newPassword: string): Promise<boolean> {
    this.db.admin.passwordHash = newPassword;
    await this.persist();
    return true;
  }
}

export const storage = new StorageService();
