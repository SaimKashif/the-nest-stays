import express, { type Request, type Response, type NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { storage } from './src/server/storage.ts';
import { validateBookingForm } from './src/utils/booking-logic.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body parsing with support for payment receipt image uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple in-memory token store for owner session
const ADMIN_TOKENS = new Set<string>();

function generateToken(): string {
  return `tns-sec-${Date.now()}-${Math.random().toString(36).substring(2, 12)}`;
}

// Admin Authentication Middleware
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication required.' });
  }
  const token = authHeader.split(' ')[1];
  if (!ADMIN_TOKENS.has(token)) {
    return res.status(403).json({ error: 'Forbidden: Invalid or expired session token.' });
  }
  next();
}

// ==========================================
// PUBLIC API ROUTES
// ==========================================

// 1. Get Property Settings & Enabled Payment Details
app.get('/api/settings', (req: Request, res: Response) => {
  try {
    const settings = storage.getSettings();
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 1b. Get Food Menu
app.get('/api/menu', (req: Request, res: Response) => {
  try {
    const onlyPublished = req.query.all !== 'true';
    const menu = storage.getFoodMenu(onlyPublished);
    res.json(menu);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 1c. Get In-Room Refreshments
app.get('/api/refreshments', (req: Request, res: Response) => {
  try {
    const items = storage.getRefreshments();
    res.json(items);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get All Active Rooms
app.get('/api/rooms', (req: Request, res: Response) => {
  try {
    const rooms = storage.getRooms(true);
    res.json(rooms);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Get Individual Room by ID
app.get('/api/rooms/:id', (req: Request, res: Response) => {
  try {
    const room = storage.getRoomById(req.params.id);
    if (!room) {
      return res.status(404).json({ error: 'Room not found.' });
    }
    res.json(room);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Check Room Availability
app.get('/api/availability', (req: Request, res: Response) => {
  try {
    const checkIn = req.query.checkIn as string;
    const checkOut = req.query.checkOut as string;
    const guests = parseInt(req.query.guests as string, 10) || 1;

    if (!checkIn || !checkOut) {
      return res.status(400).json({ error: 'checkIn and checkOut dates are required.' });
    }

    const result = storage.checkAvailability(checkIn, checkOut, guests);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Create Booking Reservation (Atomic Server-Side Logic)
app.post('/api/bookings', async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const room = storage.getRoomById(payload.roomId);
    if (!room) {
      return res.status(404).json({ error: 'Specified room was not found.' });
    }

    const validation = validateBookingForm(payload, room.maxGuests);
    if (!validation.valid) {
      return res.status(400).json({ error: 'Validation failed', details: validation.errors });
    }

    const result = await storage.createBooking(payload);
    if (!result.success) {
      return res.status(409).json({ error: result.error });
    }

    res.status(201).json(result.booking);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Get Booking by Reference Code
app.get('/api/bookings/:reference', (req: Request, res: Response) => {
  try {
    const booking = storage.getBookingByReference(req.params.reference);
    if (!booking) {
      return res.status(404).json({ error: 'Booking reference not found.' });
    }
    res.json(booking);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Submit Advance Payment Details (Bank/JazzCash/Easypaisa)
app.post('/api/bookings/:reference/payment', async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;
    const { transactionRef, amount, receiptImage, notes } = req.body;

    if (!transactionRef || !amount) {
      return res.status(400).json({ error: 'Transaction reference and payment amount are required.' });
    }

    const result = await storage.submitAdvancePayment(reference, {
      transactionRef,
      amount: parseFloat(amount),
      receiptImage,
      notes,
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result.booking);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Contact Message Submission
app.post('/api/contact', async (req: Request, res: Response) => {
  try {
    const { name, phone, email, subject, message } = req.body;
    if (!name || !phone || !message) {
      return res.status(400).json({ error: 'Name, phone, and message are required.' });
    }
    const msg = await storage.addContactMessage({
      name,
      phone,
      email,
      subject,
      message,
    });
    res.status(201).json({ success: true, message: 'Message sent successfully.', id: msg.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// ADMIN AUTHENTICATION
// ==========================================

app.post('/api/admin/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const isValid = storage.verifyAdminCredentials(username, password);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid owner credentials.' });
  }

  const token = generateToken();
  ADMIN_TOKENS.add(token);

  res.json({
    success: true,
    token,
    user: { username, role: 'owner' },
  });
});

app.post('/api/admin/logout', requireAdmin, (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    ADMIN_TOKENS.delete(token);
  }
  res.json({ success: true });
});

// ==========================================
// PROTECTED ADMIN ROUTES
// ==========================================

// Get All Bookings
app.get('/api/admin/bookings', requireAdmin, (req: Request, res: Response) => {
  const bookings = storage.getAllBookings();
  res.json(bookings);
});

// Verify or Reject Advance Payment
app.post('/api/admin/bookings/:id/verify-payment', requireAdmin, async (req: Request, res: Response) => {
  const { action, verifiedAmount, adminNotes } = req.body;
  if (!action || !['verify', 'reject'].includes(action)) {
    return res.status(400).json({ error: 'Valid action (verify or reject) is required.' });
  }

  const result = await storage.verifyPayment(
    req.params.id,
    action,
    verifiedAmount !== undefined ? parseFloat(verifiedAmount) : undefined,
    adminNotes
  );

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  res.json(result.booking);
});

// Update Booking Status (confirm, reject, cancel)
app.post('/api/admin/bookings/:id/status', requireAdmin, async (req: Request, res: Response) => {
  const { status, adminNotes } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status is required.' });
  }

  const result = await storage.updateBookingStatus(req.params.id, status, adminNotes);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  res.json(result.booking);
});

// Front Desk Full Booking Edit (guestsCount, dates, guest details, notes)
app.patch('/api/admin/bookings/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const result = await storage.updateBooking(req.params.id, req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.json(result.booking);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// CUSTOMER DIRECTORY & FOLLOW-UP ROUTES
// ==========================================

// Get All Customers
app.get('/api/admin/customers', requireAdmin, (req: Request, res: Response) => {
  try {
    const customers = storage.getCustomers();
    res.json(customers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create Customer (Manual / Walk-in)
app.post('/api/admin/customers', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name, phone } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone number are required.' });
    }
    const customer = await storage.createCustomer(req.body);
    res.status(201).json(customer);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update Customer (notes, status, follow-up, tags, cnic, city)
app.put('/api/admin/customers/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const result = await storage.updateCustomer(req.params.id, req.body);
    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }
    res.json(result.customer);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Customer
app.delete('/api/admin/customers/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const success = await storage.deleteCustomer(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Customer not found.' });
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Change Owner Password
app.post('/api/admin/change-password', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    const isValid =
      storage.verifyAdminCredentials('admin', currentPassword) ||
      storage.verifyAdminCredentials('owner@theneststays.pk', currentPassword);

    if (!isValid) {
      return res.status(403).json({ error: 'Current password does not match.' });
    }

    await storage.updateAdminPassword(newPassword);
    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Rooms CRUD
app.get('/api/admin/rooms', requireAdmin, (req: Request, res: Response) => {
  const rooms = storage.getRooms(false); // including inactive
  res.json(rooms);
});

app.post('/api/admin/rooms', requireAdmin, async (req: Request, res: Response) => {
  const roomData = req.body;
  if (!roomData.name || !roomData.pricePerNight || !roomData.beds) {
    return res.status(400).json({ error: 'Room name, price per night, and bed configuration are required.' });
  }

  if (!roomData.id) {
    roomData.id = `room-${Date.now()}`;
  }

  const saved = await storage.saveRoom(roomData);
  res.json(saved);
});

app.delete('/api/admin/rooms/:id', requireAdmin, async (req: Request, res: Response) => {
  const success = await storage.deleteRoom(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Room not found or could not be deleted.' });
  }
  res.json({ success: true });
});

// Admin Blocked Dates
app.get('/api/admin/blocked-dates', requireAdmin, (req: Request, res: Response) => {
  const dates = storage.getBlockedDates();
  res.json(dates);
});

app.post('/api/admin/blocked-dates', requireAdmin, async (req: Request, res: Response) => {
  const { roomId, startDate, endDate, reason } = req.body;
  if (!startDate || !endDate || !reason) {
    return res.status(400).json({ error: 'Start date, end date, and reason are required.' });
  }
  const blocked = await storage.addBlockedDate({
    roomId: roomId || 'all',
    startDate,
    endDate,
    reason,
  });
  res.status(201).json(blocked);
});

app.delete('/api/admin/blocked-dates/:id', requireAdmin, async (req: Request, res: Response) => {
  const success = await storage.deleteBlockedDate(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Blocked date record not found.' });
  }
  res.json({ success: true });
});

// Admin Settings
app.get('/api/admin/settings', requireAdmin, (req: Request, res: Response) => {
  res.json(storage.getSettings());
});

app.put('/api/admin/settings', requireAdmin, async (req: Request, res: Response) => {
  const updated = await storage.updateSettings(req.body);
  res.json(updated);
});

// Admin Food Menu & Refreshments Update
app.get('/api/admin/menu', requireAdmin, (req: Request, res: Response) => {
  res.json(storage.getFoodMenu(false));
});

app.put('/api/admin/menu', requireAdmin, async (req: Request, res: Response) => {
  const updated = await storage.updateFoodMenu(req.body);
  res.json(updated);
});

app.get('/api/admin/refreshments', requireAdmin, (req: Request, res: Response) => {
  res.json(storage.getRefreshments());
});

app.put('/api/admin/refreshments', requireAdmin, async (req: Request, res: Response) => {
  const updated = await storage.updateRefreshments(req.body);
  res.json(updated);
});

// Admin Contact Messages
app.get('/api/admin/messages', requireAdmin, (req: Request, res: Response) => {
  res.json(storage.getContactMessages());
});

app.post('/api/admin/messages/:id/read', requireAdmin, async (req: Request, res: Response) => {
  const ok = await storage.markContactMessageRead(req.params.id);
  res.json({ success: ok });
});

// ==========================================
// VITE DEV MIDDLEWARE & STATIC SERVING
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    // Production: serve built static files
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`The Nest Stays server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
