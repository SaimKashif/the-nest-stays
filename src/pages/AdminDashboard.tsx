import React, { useState, useEffect } from 'react';
import {
  Booking,
  Room,
  PropertySettings,
  BlockedDate,
  ContactMessage,
  MenuItem,
  RefreshmentItem,
  Customer,
} from '../types/index.ts';
import { formatPKR } from '../utils/booking-logic.ts';
import { CustomerManagement } from '../components/admin/CustomerManagement.tsx';
import { BookingEditModal } from '../components/admin/BookingEditModal.tsx';
import {
  Lock,
  LogOut,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Eye,
  Check,
  X,
  Plus,
  Trash2,
  Edit,
  Save,
  Building,
  Smartphone,
  Banknote,
  Calendar,
  MessageSquare,
  ShieldCheck,
  ArrowLeft,
  Mail,
  Sliders,
  Utensils,
  Coffee,
  Users,
} from 'lucide-react';

interface AdminDashboardProps {
  onReturnToSite: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onReturnToSite }) => {
  // Auth state
  const [authToken, setAuthToken] = useState<string>(() => localStorage.getItem('nest_admin_token') || '');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'bookings' | 'customers' | 'rooms' | 'blocks' | 'settings' | 'messages' | 'menu'>('bookings');

  // Data states
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [editingBookingForModal, setEditingBookingForModal] = useState<Booking | null>(null);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [settings, setSettings] = useState<PropertySettings | null>(null);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [foodMenu, setFoodMenu] = useState<MenuItem[]>([]);
  const [refreshments, setRefreshments] = useState<RefreshmentItem[]>([]);
  const [menuSaveSuccess, setMenuSaveSuccess] = useState<boolean>(false);
  const [refreshmentSaveSuccess, setRefreshmentSaveSuccess] = useState<boolean>(false);
  const [selectedMenuCategory, setSelectedMenuCategory] = useState<'all' | 'breakfast' | 'lunch' | 'dinner' | 'beverages'>('all');
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Bookings Filter & Search
  const [bookingFilter, setBookingFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Booking for Payment Verification Modal
  const [verificationModalBooking, setVerificationModalBooking] = useState<Booking | null>(null);
  const [verifiedAmountInput, setVerifiedAmountInput] = useState<string>('');
  const [adminNotesInput, setAdminNotesInput] = useState<string>('');
  const [isProcessingAction, setIsProcessingAction] = useState<boolean>(false);

  // Room Editor State
  const [editingRoom, setEditingRoom] = useState<Partial<Room> | null>(null);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState<boolean>(false);

  // Date Blocker State
  const [blockStartDate, setBlockStartDate] = useState<string>('');
  const [blockEndDate, setBlockEndDate] = useState<string>('');
  const [blockRoomId, setBlockRoomId] = useState<string>('all');
  const [blockReason, setBlockReason] = useState<string>('Routine Maintenance');

  // Settings form dirty state
  const [settingsForm, setSettingsForm] = useState<PropertySettings | null>(null);
  const [settingsSaveSuccess, setSettingsSaveSuccess] = useState<boolean>(false);

  // Password change state
  const [currentPasswordInput, setCurrentPasswordInput] = useState<string>('');
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState<string>('');
  const [passwordChangeMessage, setPasswordChangeMessage] = useState<string>('');
  const [passwordChangeError, setPasswordChangeError] = useState<string>('');
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }
      setAuthToken(data.token);
      localStorage.setItem('nest_admin_token', data.token);
    } catch (err: any) {
      setLoginError(err.message || 'Login failed.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      });
    } catch (e) {
      // ignore
    }
    setAuthToken('');
    localStorage.removeItem('nest_admin_token');
  };

  // Fetch all admin data
  const loadAdminData = async () => {
    if (!authToken) return;
    setIsLoadingData(true);
    try {
      const headers = { Authorization: `Bearer ${authToken}` };

      const [bRes, cRes, rRes, blkRes, sRes, mRes, menuRes, refRes] = await Promise.all([
        fetch('/api/admin/bookings', { headers }),
        fetch('/api/admin/customers', { headers }),
        fetch('/api/admin/rooms', { headers }),
        fetch('/api/admin/blocked-dates', { headers }),
        fetch('/api/admin/settings', { headers }),
        fetch('/api/admin/messages', { headers }),
        fetch('/api/admin/menu', { headers }),
        fetch('/api/admin/refreshments', { headers }),
      ]);

      if (bRes.status === 401 || bRes.status === 403) {
        handleLogout();
        return;
      }

      if (bRes.ok) setBookings(await bRes.json());
      if (cRes.ok) setCustomers(await cRes.json());
      if (rRes.ok) setRooms(await rRes.json());
      if (blkRes.ok) setBlockedDates(await blkRes.json());
      if (sRes.ok) {
        const sData = await sRes.json();
        setSettings(sData);
        setSettingsForm(sData);
      }
      if (mRes.ok) setMessages(await mRes.json());
      if (menuRes.ok) setFoodMenu(await menuRes.json());
      if (refRes.ok) setRefreshments(await refRes.json());
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (authToken) {
      loadAdminData();
    }
  }, [authToken]);

  // Payment Verification API call
  const handleVerifyPayment = async (action: 'verify' | 'reject') => {
    if (!verificationModalBooking) return;
    setIsProcessingAction(true);
    try {
      const res = await fetch(`/api/admin/bookings/${verificationModalBooking.id}/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          action,
          verifiedAmount: verifiedAmountInput ? parseFloat(verifiedAmountInput) : undefined,
          adminNotes: adminNotesInput,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to update payment status.');
        return;
      }

      const updated = await res.json();
      setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      setVerificationModalBooking(null);
    } catch (err) {
      console.error('Error verifying payment:', err);
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Update Booking Status API call
  const handleUpdateStatus = async (bookingId: string, status: Booking['status']) => {
    setIsProcessingAction(true);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to update status.');
        return;
      }

      const updated = await res.json();
      setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Save Room API call
  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom || !editingRoom.name || !editingRoom.pricePerNight) return;
    setIsProcessingAction(true);

    try {
      const res = await fetch('/api/admin/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(editingRoom),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to save room.');
        return;
      }

      const saved = await res.json();
      setRooms((prev) => {
        const idx = prev.findIndex((r) => r.id === saved.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = saved;
          return updated;
        }
        return [...prev, saved];
      });

      setIsRoomModalOpen(false);
      setEditingRoom(null);
    } catch (err) {
      console.error('Error saving room:', err);
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Add Blocked Date API call
  const handleAddBlockedDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockStartDate || !blockEndDate) return;
    setIsProcessingAction(true);

    try {
      const res = await fetch('/api/admin/blocked-dates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          roomId: blockRoomId,
          startDate: blockStartDate,
          endDate: blockEndDate,
          reason: blockReason,
        }),
      });

      if (res.ok) {
        const newBlock = await res.json();
        setBlockedDates((prev) => [...prev, newBlock]);
        setBlockStartDate('');
        setBlockEndDate('');
      }
    } catch (err) {
      console.error('Error adding block:', err);
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleDeleteBlockedDate = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/blocked-dates/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        setBlockedDates((prev) => prev.filter((b) => b.id !== id));
      }
    } catch (err) {
      console.error('Error deleting block:', err);
    }
  };

  // Save Settings API call
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsForm) return;
    setIsProcessingAction(true);
    setSettingsSaveSuccess(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(settingsForm),
      });

      if (res.ok) {
        const updated = await res.json();
        setSettings(updated);
        setSettingsForm(updated);
        setSettingsSaveSuccess(true);
        setTimeout(() => setSettingsSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Change Admin Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeMessage('');
    setPasswordChangeError('');

    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordChangeError('New passwords do not match.');
      return;
    }

    if (newPasswordInput.length < 6) {
      setPasswordChangeError('New password must be at least 6 characters.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          currentPassword: currentPasswordInput,
          newPassword: newPasswordInput,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPasswordChangeError(data.error || 'Failed to update password.');
        return;
      }

      setPasswordChangeMessage('Password updated successfully. Remember your new password for subsequent sign-ins.');
      setCurrentPasswordInput('');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
    } catch (err: any) {
      setPasswordChangeError(err.message || 'Error updating password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Mark Message as Read
  const handleMarkMessageRead = async (id: string) => {
    try {
      await fetch(`/api/admin/messages/${id}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, read: true } : m))
      );
    } catch (e) {
      // ignore
    }
  };

  // Save Food Menu
  const handleSaveMenu = async () => {
    setIsProcessingAction(true);
    setMenuSaveSuccess(false);
    try {
      const res = await fetch('/api/admin/menu', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(foodMenu),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to update food menu.');
        return;
      }
      const saved = await res.json();
      setFoodMenu(saved);
      setMenuSaveSuccess(true);
      setTimeout(() => setMenuSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving menu:', err);
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Save In-Room Refreshments
  const handleSaveRefreshments = async () => {
    setIsProcessingAction(true);
    setRefreshmentSaveSuccess(false);
    try {
      const res = await fetch('/api/admin/refreshments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(refreshments),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to update refreshments.');
        return;
      }
      const saved = await res.json();
      setRefreshments(saved);
      setRefreshmentSaveSuccess(true);
      setTimeout(() => setRefreshmentSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving refreshments:', err);
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Update a food menu item field
  const handleUpdateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    setFoodMenu((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  // Update a refreshment item field
  const handleUpdateRefreshment = (id: string, updates: Partial<RefreshmentItem>) => {
    setRefreshments((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  // Add new menu item
  const handleAddMenuItem = (category: MenuItem['category']) => {
    const newItem: MenuItem = {
      id: `menu-custom-${Date.now()}`,
      name: 'New Menu Special',
      category,
      price: 500,
      description: 'Freshly prepared upon guest order by property staff',
      verified: true,
      published: true,
    };
    setFoodMenu((prev) => [...prev, newItem]);
  };

  // Delete menu item
  const handleDeleteMenuItem = (id: string) => {
    setFoodMenu((prev) => prev.filter((item) => item.id !== id));
  };

  // Filter Bookings
  const filteredBookings = bookings.filter((b) => {
    if (bookingFilter !== 'all' && b.status !== bookingFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRef = b.reference.toLowerCase().includes(q);
      const matchName = b.guestName.toLowerCase().includes(q);
      const matchPhone = b.guestPhone.toLowerCase().includes(q);
      const matchRoom = b.roomName.toLowerCase().includes(q);
      return matchRef || matchName || matchPhone || matchRoom;
    }
    return true;
  });

  // =========================================================================
  // VIEW 1: LOGIN GATE IF NOT AUTHENTICATED
  // =========================================================================
  if (!authToken) {
    return (
      <div className="bg-[#F8F6F0] min-h-screen py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-[#252A27]/10 shadow-lg space-y-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-[#173F35] text-[#C5A572] flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#173F35]">
              The Nest Stays Owner Portal
            </h1>
            <p className="text-xs text-[#252A27]/70 mt-1">
              Secure administrative access for room management, bookings, and payment verification.
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                Owner Email / Username
              </label>
              <input
                type="text"
                required
                autoComplete="username"
                placeholder="Enter username or email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-sm text-[#252A27] focus:outline-none focus:ring-2 focus:ring-[#173F35]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-sm text-[#252A27] focus:outline-none focus:ring-2 focus:ring-[#173F35]"
              />
            </div>

            <div className="text-[11px] text-[#252A27]/60 text-center py-1">
              Restricted portal for authorized management and front desk staff.
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 bg-[#173F35] hover:bg-[#1f5245] text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer"
            >
              {isLoggingIn ? 'Verifying Credentials...' : 'Sign In to Dashboard'}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onReturnToSite}
              className="text-xs text-[#173F35] hover:underline inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Website</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: AUTHENTICATED OWNER DASHBOARD
  // =========================================================================
  return (
    <div className="bg-[#F8F6F0] min-h-screen pb-16">
      {/* Top Admin Bar */}
      <header className="bg-[#173F35] text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-serif text-xl font-bold tracking-tight text-white">
              The Nest Stays
            </span>
            <span className="text-[11px] uppercase tracking-wider bg-[#0f2c25] px-2 py-0.5 rounded text-[#C5A572] font-semibold border border-white/10">
              Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={onReturnToSite}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-md transition-colors"
            >
              View Public Site
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-900/60 hover:bg-rose-900 rounded-md text-white transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/10 flex overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`py-3 px-4 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'bookings'
                ? 'border-[#C5A572] text-[#DFCA9E]'
                : 'border-transparent text-white/70 hover:text-white'
            }`}
          >
            Reservations ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`py-3 px-4 border-b-2 whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'customers'
                ? 'border-[#C5A572] text-[#DFCA9E]'
                : 'border-transparent text-white/70 hover:text-white'
            }`}
          >
            <span>Guest Directory & Follow-Up</span>
            <span className="bg-[#C5A572]/20 text-[#DFCA9E] px-1.5 py-0.5 rounded text-[10px]">
              {customers.length}
            </span>
            {customers.filter((c) => c.followUpStatus === 'pending').length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400" title="Pending follow-up" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('rooms')}
            className={`py-3 px-4 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'rooms'
                ? 'border-[#C5A572] text-[#DFCA9E]'
                : 'border-transparent text-white/70 hover:text-white'
            }`}
          >
            Room Listings ({rooms.length})
          </button>
          <button
            onClick={() => setActiveTab('blocks')}
            className={`py-3 px-4 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'blocks'
                ? 'border-[#C5A572] text-[#DFCA9E]'
                : 'border-transparent text-white/70 hover:text-white'
            }`}
          >
            Maintenance / Date Blocks ({blockedDates.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-4 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'settings'
                ? 'border-[#C5A572] text-[#DFCA9E]'
                : 'border-transparent text-white/70 hover:text-white'
            }`}
          >
            Payment & Property Settings
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`py-3 px-4 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'messages'
                ? 'border-[#C5A572] text-[#DFCA9E]'
                : 'border-transparent text-white/70 hover:text-white'
            }`}
          >
            Inquiries ({messages.filter((m) => !m.read).length} unread)
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`py-3 px-4 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'menu'
                ? 'border-[#C5A572] text-[#DFCA9E]'
                : 'border-transparent text-white/70 hover:text-white'
            }`}
          >
            Food Menu & Refreshments ({foodMenu.length})
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* ================================================================= */}
        {/* TAB 1: RESERVATIONS & PAYMENT VERIFICATION */}
        {/* ================================================================= */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-xl border border-[#252A27]/10 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-semibold">
                {[
                  { label: 'All', value: 'all' },
                  { label: 'Awaiting Payment', value: 'pending_payment' },
                  { label: 'Payment Submitted', value: 'awaiting_verification' },
                  { label: 'Confirmed', value: 'confirmed' },
                  { label: 'Pay at Property (Pending)', value: 'pending_approval' },
                  { label: 'Cancelled', value: 'cancelled' },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setBookingFilter(item.value)}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                      bookingFilter === item.value
                        ? 'bg-[#173F35] text-white'
                        : 'bg-[#F8F6F0] text-[#252A27]/70 hover:bg-[#DCE5DC]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative w-full md:w-72">
                <input
                  type="text"
                  placeholder="Search ref, guest name, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 pl-9 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs"
                />
                <Search className="w-3.5 h-3.5 text-[#252A27]/50 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-xl border border-[#252A27]/10 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#173F35] text-[#F8F6F0] uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Reference</th>
                      <th className="py-3 px-4">Guest Details</th>
                      <th className="py-3 px-4">Room & Dates</th>
                      <th className="py-3 px-4">Pricing</th>
                      <th className="py-3 px-4">Payment Method</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#252A27]/10 text-[#252A27]">
                    {filteredBookings.length > 0 ? (
                      filteredBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-[#F8F6F0]/60 transition-colors">
                          {/* Reference */}
                          <td className="py-4 px-4 font-mono font-bold text-[#173F35]">
                            {b.reference}
                            <span className="block text-[10px] text-[#252A27]/50 font-sans font-normal">
                              {new Date(b.createdAt).toLocaleDateString()}
                            </span>
                          </td>

                          {/* Guest */}
                          <td className="py-4 px-4">
                            <strong className="block text-sm text-[#173F35]">{b.guestName}</strong>
                            <span className="block text-[#252A27]/80">{b.guestPhone}</span>
                            {b.guestEmail && <span className="block text-[#252A27]/60 text-[11px]">{b.guestEmail}</span>}
                            {b.specialRequests && (
                              <span className="block text-amber-800 text-[10px] italic mt-0.5">
                                Note: {b.specialRequests}
                              </span>
                            )}
                          </td>

                          {/* Room & Dates */}
                          <td className="py-4 px-4">
                            <strong className="block font-medium">{b.roomName}</strong>
                            <span className="text-[#252A27]/70 text-[11px]">
                              {b.checkIn} to {b.checkOut} ({b.nights}n · {b.guestsCount}g)
                            </span>
                          </td>

                          {/* Pricing */}
                          <td className="py-4 px-4 tabular-nums">
                            <div className="font-semibold text-[#173F35]">{formatPKR(b.total)}</div>
                            {b.advanceRequired > 0 && (
                              <div className="text-[10px] text-[#252A27]/70">
                                Adv: {formatPKR(b.advanceRequired)}
                              </div>
                            )}
                            {b.verifiedAmount !== undefined && (
                              <div className="text-[10px] text-emerald-700 font-semibold">
                                Paid: {formatPKR(b.verifiedAmount)}
                              </div>
                            )}
                            {b.balanceDue > 0 && (
                              <div className="text-[10px] text-[#252A27]/60">
                                Bal: {formatPKR(b.balanceDue)}
                              </div>
                            )}
                          </td>

                          {/* Payment Method */}
                          <td className="py-4 px-4">
                            <span className="capitalize font-medium block">
                              {b.paymentMethod.replace(/_/g, ' ')}
                            </span>
                            {b.paymentSubmission && (
                              <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-0.5 inline-block font-mono">
                                Ref: {b.paymentSubmission.transactionRef}
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4">
                            {b.status === 'confirmed' && (
                              <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-1 rounded text-[11px] font-semibold border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Confirmed
                              </span>
                            )}
                            {b.status === 'awaiting_verification' && (
                              <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 px-2 py-1 rounded text-[11px] font-semibold border border-amber-200">
                                <Clock className="w-3 h-3 text-amber-600" />
                                Payment Verification
                              </span>
                            )}
                            {b.status === 'pending_payment' && (
                              <span className="inline-flex items-center gap-1 text-sky-800 bg-sky-50 px-2 py-1 rounded text-[11px] font-semibold border border-sky-200">
                                <Clock className="w-3 h-3 text-sky-600" />
                                Unpaid
                              </span>
                            )}
                            {b.status === 'pending_approval' && (
                              <span className="inline-flex items-center gap-1 text-blue-800 bg-blue-50 px-2 py-1 rounded text-[11px] font-semibold border border-blue-200">
                                <Clock className="w-3 h-3 text-blue-600" />
                                Needs Approval
                              </span>
                            )}
                            {b.status === 'cancelled' && (
                              <span className="inline-flex items-center gap-1 text-rose-800 bg-rose-50 px-2 py-1 rounded text-[11px] font-semibold border border-rose-200">
                                <XCircle className="w-3 h-3 text-rose-600" />
                                Cancelled
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4 text-right space-x-1.5 whitespace-nowrap">
                            {/* Front Desk Edit Reservation */}
                            <button
                              onClick={() => setEditingBookingForModal(b)}
                              className="px-2.5 py-1 bg-[#F8F6F0] hover:bg-[#DCE5DC] text-[#173F35] border border-[#173F35]/20 rounded font-semibold text-[11px] transition-colors"
                            >
                              Edit
                            </button>

                            {/* If submitted proof exists */}
                            {b.paymentSubmission && (
                              <button
                                aria-label={`Review proof for ${b.reference}`}
                                onClick={() => {
                                  setVerificationModalBooking(b);
                                  setVerifiedAmountInput(
                                    b.paymentSubmission?.amount.toString() || b.advanceRequired.toString()
                                  );
                                  setAdminNotesInput(b.adminNotes || '');
                                }}
                                className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded font-semibold text-[11px] transition-colors"
                              >
                                Review Proof
                              </button>
                            )}

                            {/* Direct Confirm Button */}
                            {b.status !== 'confirmed' && (
                              <button
                                onClick={() => handleUpdateStatus(b.id, 'confirmed')}
                                className="px-2.5 py-1 bg-[#173F35] hover:bg-[#1f5245] text-white rounded font-semibold text-[11px] transition-colors"
                              >
                                Confirm
                              </button>
                            )}

                            {/* Reject / Cancel */}
                            {b.status !== 'cancelled' && (
                              <button
                                onClick={() => {
                                  if (confirm(`Cancel reservation ${b.reference}?`)) {
                                    handleUpdateStatus(b.id, 'cancelled');
                                  }
                                }}
                                className="px-2.5 py-1 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded font-semibold text-[11px] transition-colors"
                              >
                                Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-[#252A27]/60">
                          No reservations match the filter criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB: GUEST DIRECTORY & FOLLOW-UP CRM */}
        {/* ================================================================= */}
        {activeTab === 'customers' && (
          <CustomerManagement
            authToken={authToken}
            customers={customers}
            bookings={bookings}
            onRefresh={loadAdminData}
          />
        )}

        {/* ================================================================= */}
        {/* TAB 2: ROOM MANAGEMENT */}
        {/* ================================================================= */}
        {activeTab === 'rooms' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-[#252A27]/10">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#173F35]">
                  Property Accommodations
                </h2>
                <p className="text-xs text-[#252A27]/70">
                  Update nightly rates in PKR, manage room details, amenities, and visibility.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingRoom({
                    name: 'New Guest Room',
                    category: 'deluxe',
                    description: '',
                    longDescription: '',
                    images: ['/src/assets/images/room_deluxe_suite_1792648895537.jpg'],
                    beds: '1 Queen Bed',
                    maxGuests: 2,
                    pricePerNight: 12000,
                    amenities: ['Ensuite Bathroom', 'High-Speed Wi-Fi', 'Heating', 'Complimentary Breakfast'],
                    active: true,
                    sizeSqFt: 350,
                    view: 'Mountain View',
                  });
                  setIsRoomModalOpen(true);
                }}
                className="px-4 py-2 bg-[#173F35] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Room</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className={`bg-white rounded-xl border p-5 flex flex-col justify-between shadow-sm ${
                    room.active ? 'border-[#252A27]/10' : 'border-rose-200 opacity-60'
                  }`}
                >
                  <div>
                    <img
                      src={room.images?.[0] || '/src/assets/images/room_deluxe_suite_1792648895537.jpg'}
                      alt={room.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-36 object-cover rounded-lg mb-3 bg-[#DCE5DC]"
                    />
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-serif text-lg font-bold text-[#173F35]">
                        {room.name}
                      </h3>
                      <span className="font-semibold text-sm tabular-nums text-[#173F35]">
                        {formatPKR(room.pricePerNight)}
                      </span>
                    </div>
                    <div className="text-xs text-[#252A27]/70 mt-1">
                      {room.beds} · Up to {room.maxGuests} Guests · {room.view}
                    </div>
                    <p className="text-xs text-[#252A27]/75 mt-2 line-clamp-2">
                      {room.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#252A27]/10 flex items-center justify-between">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        room.active
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'bg-rose-50 text-rose-800'
                      }`}
                    >
                      {room.active ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={() => {
                        setEditingRoom({ ...room });
                        setIsRoomModalOpen(true);
                      }}
                      className="text-xs text-[#173F35] font-semibold flex items-center gap-1 hover:underline"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Room & Price</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: DATE BLOCKS (MAINTENANCE) */}
        {/* ================================================================= */}
        {activeTab === 'blocks' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-[#252A27]/10 shadow-sm space-y-4">
              <h2 className="font-serif text-xl font-bold text-[#173F35]">
                Block Dates for Maintenance
              </h2>
              <p className="text-xs text-[#252A27]/70">
                Prevent guests from booking specific dates during renovations, deep cleaning, or private use.
              </p>

              <form onSubmit={handleAddBlockedDate} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                    Room to Block
                  </label>
                  <select
                    value={blockRoomId}
                    onChange={(e) => setBlockRoomId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs"
                  >
                    <option value="all">Entire Property (All Rooms)</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                    Start Date (Inclusive)
                  </label>
                  <input
                    type="date"
                    required
                    value={blockStartDate}
                    onChange={(e) => setBlockStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                    End Date (Exclusive)
                  </label>
                  <input
                    type="date"
                    required
                    value={blockEndDate}
                    onChange={(e) => setBlockEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                    Reason / Internal Note
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Deep wood restoration & polishing"
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isProcessingAction}
                  className="w-full py-2.5 bg-[#173F35] hover:bg-[#1f5245] text-white text-xs font-semibold rounded-lg"
                >
                  Block Selected Dates
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#252A27]/10 shadow-sm">
              <h2 className="font-serif text-xl font-bold text-[#173F35] mb-4">
                Active Maintenance Blocks ({blockedDates.length})
              </h2>

              {blockedDates.length > 0 ? (
                <div className="space-y-3">
                  {blockedDates.map((block) => {
                    const roomName =
                      block.roomId === 'all'
                        ? 'Entire Property'
                        : rooms.find((r) => r.id === block.roomId)?.name || block.roomId;

                    return (
                      <div
                        key={block.id}
                        className="p-3.5 bg-[#F8F6F0] rounded-xl border border-[#252A27]/10 flex items-center justify-between text-xs"
                      >
                        <div>
                          <strong className="text-[#173F35] block text-sm">{roomName}</strong>
                          <span className="text-[#252A27]/75">
                            {block.startDate} to {block.endDate} · {block.reason}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteBlockedDate(block.id)}
                          className="p-1.5 text-rose-700 hover:bg-rose-50 rounded"
                          title="Remove block"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-[#252A27]/60 py-6 text-center">
                  No active maintenance blocks. All rooms are open according to standard schedules.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: SETTINGS & PAYMENT INSTRUCTIONS */}
        {/* ================================================================= */}
        {activeTab === 'settings' && settingsForm && (
          <div className="space-y-8">
            <form onSubmit={handleSaveSettings} className="space-y-8">
            {settingsSaveSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Property settings and payment instructions saved successfully!</span>
              </div>
            )}

            {/* General Property Info */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#252A27]/10 shadow-sm space-y-4">
              <h2 className="font-serif text-xl font-bold text-[#173F35]">
                General Property & Contact Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={settingsForm.businessName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, businessName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={settingsForm.tagline}
                    onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                    Official Phone
                  </label>
                  <input
                    type="text"
                    value={settingsForm.phone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="text"
                    value={settingsForm.whatsapp}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={settingsForm.email}
                    onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                    Google Maps URL
                  </label>
                  <input
                    type="url"
                    value={settingsForm.googleMapsUrl}
                    onChange={(e) => setSettingsForm({ ...settingsForm, googleMapsUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                  Property Physical Address
                </label>
                <input
                  type="text"
                  value={settingsForm.address}
                  onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                    Check-in Time
                  </label>
                  <input
                    type="text"
                    value={settingsForm.checkInTime}
                    onChange={(e) => setSettingsForm({ ...settingsForm, checkInTime: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                    Check-out Time
                  </label>
                  <input
                    type="text"
                    value={settingsForm.checkOutTime}
                    onChange={(e) => setSettingsForm({ ...settingsForm, checkOutTime: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Advance Deposit Rules */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#252A27]/10 shadow-sm space-y-4">
              <h2 className="font-serif text-xl font-bold text-[#173F35]">
                Advance Payment Rules
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-3 bg-[#F8F6F0] rounded-xl border border-[#252A27]/10 cursor-pointer text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={settingsForm.paymentConfig.requireAdvance}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        paymentConfig: {
                          ...settingsForm.paymentConfig,
                          requireAdvance: e.target.checked,
                        },
                      })
                    }
                    className="rounded text-[#173F35]"
                  />
                  <span>Require Advance Deposit for Reservations</span>
                </label>

                <div>
                  <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                    Advance Percentage (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={settingsForm.paymentConfig.advancePercentage}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        paymentConfig: {
                          ...settingsForm.paymentConfig,
                          advancePercentage: parseInt(e.target.value, 10) || 0,
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <label className="flex items-center gap-3 p-3 bg-[#F8F6F0] rounded-xl border border-[#252A27]/10 cursor-pointer text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={settingsForm.paymentConfig.allowPayAtProperty}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        paymentConfig: {
                          ...settingsForm.paymentConfig,
                          allowPayAtProperty: e.target.checked,
                        },
                      })
                    }
                    className="rounded text-[#173F35]"
                  />
                  <span>Enable Pay at Property (Cash on Arrival)</span>
                </label>

                <label className="flex items-center gap-3 p-3 bg-[#F8F6F0] rounded-xl border border-[#252A27]/10 cursor-pointer text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={settingsForm.paymentConfig.payAtPropertyRequiresApproval}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        paymentConfig: {
                          ...settingsForm.paymentConfig,
                          payAtPropertyRequiresApproval: e.target.checked,
                        },
                      })
                    }
                    className="rounded text-[#173F35]"
                  />
                  <span>Cash on Arrival Requires Owner Approval First</span>
                </label>
              </div>
            </div>

            {/* Bank Transfer Instructions */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#252A27]/10 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl font-bold text-[#173F35] flex items-center gap-2">
                  <Building className="w-5 h-5 text-[#C5A572]" />
                  <span>Bank Transfer Configuration</span>
                </h2>
                <label className="flex items-center gap-2 text-xs font-semibold text-[#173F35] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settingsForm.paymentConfig.bank.enabled}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        paymentConfig: {
                          ...settingsForm.paymentConfig,
                          bank: {
                            ...settingsForm.paymentConfig.bank,
                            enabled: e.target.checked,
                          },
                        },
                      })
                    }
                    className="rounded text-[#173F35]"
                  />
                  <span>Enable Bank Transfer</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={settingsForm.paymentConfig.bank.bankName}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        paymentConfig: {
                          ...settingsForm.paymentConfig,
                          bank: {
                            ...settingsForm.paymentConfig.bank,
                            bankName: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                    Account Title
                  </label>
                  <input
                    type="text"
                    value={settingsForm.paymentConfig.bank.accountTitle}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        paymentConfig: {
                          ...settingsForm.paymentConfig,
                          bank: {
                            ...settingsForm.paymentConfig.bank,
                            accountTitle: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={settingsForm.paymentConfig.bank.accountNumber}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        paymentConfig: {
                          ...settingsForm.paymentConfig,
                          bank: {
                            ...settingsForm.paymentConfig.bank,
                            accountNumber: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                    IBAN
                  </label>
                  <input
                    type="text"
                    value={settingsForm.paymentConfig.bank.iban}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        paymentConfig: {
                          ...settingsForm.paymentConfig,
                          bank: {
                            ...settingsForm.paymentConfig.bank,
                            iban: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                  Payment Instructions for Guests
                </label>
                <textarea
                  rows={2}
                  value={settingsForm.paymentConfig.bank.instructions}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      paymentConfig: {
                        ...settingsForm.paymentConfig,
                        bank: {
                          ...settingsForm.paymentConfig.bank,
                          instructions: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs"
                />
              </div>
            </div>

            {/* JazzCash Instructions */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#252A27]/10 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl font-bold text-[#173F35] flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-[#C5A572]" />
                  <span>JazzCash Configuration</span>
                </h2>
                <label className="flex items-center gap-2 text-xs font-semibold text-[#173F35] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settingsForm.paymentConfig.jazzCash.enabled}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        paymentConfig: {
                          ...settingsForm.paymentConfig,
                          jazzCash: {
                            ...settingsForm.paymentConfig.jazzCash,
                            enabled: e.target.checked,
                          },
                        },
                      })
                    }
                    className="rounded text-[#173F35]"
                  />
                  <span>Enable JazzCash</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                    Account Title
                  </label>
                  <input
                    type="text"
                    value={settingsForm.paymentConfig.jazzCash.accountTitle}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        paymentConfig: {
                          ...settingsForm.paymentConfig,
                          jazzCash: {
                            ...settingsForm.paymentConfig.jazzCash,
                            accountTitle: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                    Phone / Account Number
                  </label>
                  <input
                    type="text"
                    value={settingsForm.paymentConfig.jazzCash.accountNumber}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        paymentConfig: {
                          ...settingsForm.paymentConfig,
                          jazzCash: {
                            ...settingsForm.paymentConfig.jazzCash,
                            accountNumber: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                    Till ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={settingsForm.paymentConfig.jazzCash.tillId || ''}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        paymentConfig: {
                          ...settingsForm.paymentConfig,
                          jazzCash: {
                            ...settingsForm.paymentConfig.jazzCash,
                            tillId: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                  Instructions for JazzCash
                </label>
                <textarea
                  rows={2}
                  value={settingsForm.paymentConfig.jazzCash.instructions}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      paymentConfig: {
                        ...settingsForm.paymentConfig,
                        jazzCash: {
                          ...settingsForm.paymentConfig.jazzCash,
                          instructions: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs"
                />
              </div>
            </div>

            {/* Easypaisa Instructions */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#252A27]/10 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl font-bold text-[#173F35] flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-700" />
                  <span>Easypaisa Configuration</span>
                </h2>
                <label className="flex items-center gap-2 text-xs font-semibold text-[#173F35] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settingsForm.paymentConfig.easypaisa.enabled}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        paymentConfig: {
                          ...settingsForm.paymentConfig,
                          easypaisa: {
                            ...settingsForm.paymentConfig.easypaisa,
                            enabled: e.target.checked,
                          },
                        },
                      })
                    }
                    className="rounded text-[#173F35]"
                  />
                  <span>Enable Easypaisa</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                    Account Title
                  </label>
                  <input
                    type="text"
                    value={settingsForm.paymentConfig.easypaisa.accountTitle}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        paymentConfig: {
                          ...settingsForm.paymentConfig,
                          easypaisa: {
                            ...settingsForm.paymentConfig.easypaisa,
                            accountTitle: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                    Phone / Account Number
                  </label>
                  <input
                    type="text"
                    value={settingsForm.paymentConfig.easypaisa.accountNumber}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        paymentConfig: {
                          ...settingsForm.paymentConfig,
                          easypaisa: {
                            ...settingsForm.paymentConfig.easypaisa,
                            accountNumber: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                  Instructions for Easypaisa
                </label>
                <textarea
                  rows={2}
                  value={settingsForm.paymentConfig.easypaisa.instructions}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      paymentConfig: {
                        ...settingsForm.paymentConfig,
                        easypaisa: {
                          ...settingsForm.paymentConfig.easypaisa,
                          instructions: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isProcessingAction}
                className="px-6 py-3 bg-[#173F35] hover:bg-[#1f5245] text-white font-semibold rounded-lg text-sm flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Save className="w-4 h-4 text-[#C5A572]" />
                <span>Save All Changes</span>
              </button>
            </div>
          </form>

          {/* Security & Password Change */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#252A27]/10 shadow-sm space-y-4">
            <div className="border-b border-[#252A27]/10 pb-3">
              <h2 className="font-serif text-xl font-bold text-[#173F35] flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#C5A572]" />
                <span>Admin Access & Security</span>
              </h2>
              <p className="text-xs text-[#252A27]/70 mt-1">
                Update your management login password to protect your online booking system.
              </p>
            </div>

            {passwordChangeMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs rounded-lg font-medium">
                {passwordChangeMessage}
              </div>
            )}

            {passwordChangeError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg font-medium">
                {passwordChangeError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter current password"
                  value={currentPasswordInput}
                  onChange={(e) => setCurrentPasswordInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter new password"
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isChangingPassword}
                className="px-4 py-2 bg-[#173F35] hover:bg-[#1f5245] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Lock className="w-3.5 h-3.5 text-[#C5A572]" />
                <span>{isChangingPassword ? 'Updating Password...' : 'Update Password'}</span>
              </button>
            </form>
          </div>
        </div>
        )}

        {/* ================================================================= */}
        {/* TAB 5: CONTACT INQUIRIES */}
        {/* ================================================================= */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#252A27]/10 shadow-sm space-y-4">
            <h2 className="font-serif text-xl font-bold text-[#173F35]">
              Customer Inquiries ({messages.length})
            </h2>

            {messages.length > 0 ? (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-xl border transition-colors ${
                      msg.read ? 'bg-white border-[#252A27]/10' : 'bg-[#EEF3EE] border-[#173F35]/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <strong className="text-sm font-semibold text-[#173F35]">{msg.name}</strong>
                        <span className="text-xs text-[#252A27]/70 block">
                          Phone: {msg.phone} {msg.email ? `· ${msg.email}` : ''}
                        </span>
                      </div>
                      <div className="text-right text-[11px] text-[#252A27]/60">
                        {new Date(msg.createdAt).toLocaleString()}
                        {!msg.read && (
                          <button
                            onClick={() => handleMarkMessageRead(msg.id)}
                            className="block text-[#173F35] font-semibold underline mt-1"
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                    </div>
                    {msg.subject && (
                      <div className="text-xs font-semibold text-[#173F35] mb-1">
                        Subject: {msg.subject}
                      </div>
                    )}
                    <p className="text-xs text-[#252A27]/85 leading-relaxed bg-white/70 p-2.5 rounded border border-[#252A27]/5">
                      {msg.message}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#252A27]/60 py-8 text-center">
                No customer inquiries received yet.
              </p>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 6: FOOD MENU & IN-ROOM REFRESHMENTS */}
        {/* ================================================================= */}
        {activeTab === 'menu' && (
          <div className="space-y-8">
            {/* Operational Policy Header */}
            <div className="bg-[#173F35] text-white p-6 sm:p-8 rounded-2xl shadow-sm border border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Utensils className="w-5 h-5 text-[#C5A572]" />
                    <span className="text-xs uppercase tracking-widest text-[#C5A572] font-semibold">
                      Property Dining & Refreshment Tariffs
                    </span>
                  </div>
                  <h2 className="font-serif text-2xl font-bold">
                    Food Menu & Mini-Bar Price Controls
                  </h2>
                  <p className="text-xs text-white/80 max-w-2xl mt-1 leading-relaxed">
                    Update food menu prices, verify unconfirmed items, and maintain in-room refreshment rates.
                    All prices are in Pakistani Rupees (PKR). Note: In-room refreshments are strictly optional
                    and are never auto-billed to room reservations.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSaveMenu}
                    disabled={isProcessingAction}
                    className="px-5 py-2.5 bg-[#C5A572] hover:bg-[#b09160] text-[#173F35] font-semibold rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-sm transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Menu Changes</span>
                  </button>
                </div>
              </div>

              {menuSaveSuccess && (
                <div className="mt-4 p-3 bg-emerald-800/80 border border-emerald-400 text-emerald-100 text-xs rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Food menu prices and publication statuses updated successfully!</span>
                </div>
              )}
            </div>

            {/* In-Room Refreshments Management Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#252A27]/10 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#252A27]/10 pb-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#173F35] flex items-center gap-2">
                    <Coffee className="w-5 h-5 text-[#C5A572]" />
                    <span>In-Room Refreshments (Mini-Bar / Snacks)</span>
                  </h3>
                  <p className="text-xs text-[#252A27]/70 mt-1">
                    Displayed transparently on room detail pages and the dining portal. Charged only upon guest consumption.
                  </p>
                </div>
                <button
                  onClick={handleSaveRefreshments}
                  disabled={isProcessingAction}
                  className="self-start sm:self-auto px-4 py-2 bg-[#173F35] hover:bg-[#1f5245] text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                >
                  <Save className="w-3.5 h-3.5 text-[#C5A572]" />
                  <span>Save Refreshment Rates</span>
                </button>
              </div>

              {refreshmentSaveSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>In-room refreshment rates saved successfully!</span>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#252A27]/10 text-[#173F35] uppercase tracking-wider font-semibold">
                      <th className="py-2.5 px-3">Refreshment Item</th>
                      <th className="py-2.5 px-3">Serving Size / Spec</th>
                      <th className="py-2.5 px-3">Unit</th>
                      <th className="py-2.5 px-3 w-40">Price (PKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#252A27]/5">
                    {refreshments.map((ref) => (
                      <tr key={ref.id} className="hover:bg-[#F8F6F0]/60 transition-colors">
                        <td className="py-3 px-3">
                          <input
                            type="text"
                            value={ref.name}
                            onChange={(e) => handleUpdateRefreshment(ref.id, { name: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-[#F8F6F0] border border-[#252A27]/20 rounded text-xs font-semibold text-[#173F35]"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="text"
                            value={ref.size || ''}
                            onChange={(e) => handleUpdateRefreshment(ref.id, { size: e.target.value })}
                            placeholder="e.g. 500 ml"
                            className="w-full px-2.5 py-1.5 bg-[#F8F6F0] border border-[#252A27]/20 rounded text-xs text-[#252A27]"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="text"
                            value={ref.unit}
                            onChange={(e) => handleUpdateRefreshment(ref.id, { unit: e.target.value })}
                            placeholder="e.g. bottle / can"
                            className="w-full px-2.5 py-1.5 bg-[#F8F6F0] border border-[#252A27]/20 rounded text-xs text-[#252A27]"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[#252A27]/60 font-semibold">PKR</span>
                            <input
                              type="number"
                              min="0"
                              step="50"
                              value={ref.price}
                              onChange={(e) => handleUpdateRefreshment(ref.id, { price: parseFloat(e.target.value) || 0 })}
                              className="w-full px-2.5 py-1.5 bg-[#F8F6F0] border border-[#252A27]/20 rounded text-xs font-bold text-[#173F35] tabular-nums"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Food Menu Items Management */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#252A27]/10 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#252A27]/10 pb-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#173F35]">
                    Dining & Room Service Menu Items
                  </h3>
                  <p className="text-xs text-[#252A27]/70 mt-1">
                    Manage food offerings, update prices, confirm printed tariff items, and publish unverified dishes.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleAddMenuItem(selectedMenuCategory === 'all' ? 'breakfast' : selectedMenuCategory)}
                    className="px-3.5 py-2 bg-[#EEF3EE] hover:bg-[#DCE5DC] text-[#173F35] font-semibold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                  <button
                    onClick={handleSaveMenu}
                    disabled={isProcessingAction}
                    className="px-4 py-2 bg-[#173F35] hover:bg-[#1f5245] text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                  >
                    <Save className="w-3.5 h-3.5 text-[#C5A572]" />
                    <span>Save All Changes</span>
                  </button>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
                {[
                  { label: 'All Dishes', value: 'all' },
                  { label: 'Breakfast', value: 'breakfast' },
                  { label: 'Lunch & Light Meals', value: 'lunch' },
                  { label: 'Dinner', value: 'dinner' },
                  { label: 'Beverages', value: 'beverages' },
                ].map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedMenuCategory(cat.value as any)}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                      selectedMenuCategory === cat.value
                        ? 'bg-[#173F35] text-white'
                        : 'bg-[#F8F6F0] text-[#252A27]/70 hover:bg-[#EEF3EE]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Items List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {foodMenu
                  .filter((item) => selectedMenuCategory === 'all' || item.category === selectedMenuCategory)
                  .map((item) => {
                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-xl border space-y-3 transition-colors ${
                          !item.published
                            ? 'bg-amber-50/60 border-amber-300'
                            : 'bg-[#F8F6F0]/40 border-[#252A27]/10'
                        }`}
                      >
                        {/* Top bar with category tag, status badge, and delete */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#173F35] text-[#DFCA9E]">
                              {item.category}
                            </span>
                            {!item.published && (
                              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-200 text-amber-900 border border-amber-400">
                                Unpublished / Needs Verification
                              </span>
                            )}
                            {item.note && (
                              <span className="text-[10px] text-amber-800 italic">
                                ({item.note})
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteMenuItem(item.id)}
                            className="text-[#252A27]/40 hover:text-rose-600 p-1 transition-colors"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Item Name & Price inputs */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-2">
                            <label className="block text-[10px] font-semibold text-[#173F35] uppercase mb-0.5">
                              Dish Name
                            </label>
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => handleUpdateMenuItem(item.id, { name: e.target.value })}
                              className="w-full px-2.5 py-1.5 bg-white border border-[#252A27]/20 rounded text-xs font-semibold text-[#173F35]"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-[#173F35] uppercase mb-0.5">
                              Price (PKR)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="50"
                              value={item.price}
                              onChange={(e) => handleUpdateMenuItem(item.id, { price: parseFloat(e.target.value) || 0 })}
                              className="w-full px-2.5 py-1.5 bg-white border border-[#252A27]/20 rounded text-xs font-bold text-[#173F35] tabular-nums"
                            />
                          </div>
                        </div>

                        {/* Category & Note */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-semibold text-[#173F35] uppercase mb-0.5">
                              Meal Category
                            </label>
                            <select
                              value={item.category}
                              onChange={(e) => handleUpdateMenuItem(item.id, { category: e.target.value as any })}
                              className="w-full px-2.5 py-1.5 bg-white border border-[#252A27]/20 rounded text-xs text-[#252A27]"
                            >
                              <option value="breakfast">Breakfast</option>
                              <option value="lunch">Lunch & Light Meals</option>
                              <option value="dinner">Dinner</option>
                              <option value="beverages">Beverages</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-[#173F35] uppercase mb-0.5">
                              Verification Note (Optional)
                            </label>
                            <input
                              type="text"
                              value={item.note || ''}
                              placeholder="e.g. Subject to owner verification"
                              onChange={(e) => handleUpdateMenuItem(item.id, { note: e.target.value })}
                              className="w-full px-2.5 py-1.5 bg-white border border-[#252A27]/20 rounded text-xs text-[#252A27]"
                            />
                          </div>
                        </div>

                        {/* Description input */}
                        <div>
                          <label className="block text-[10px] font-semibold text-[#173F35] uppercase mb-0.5">
                            Description
                          </label>
                          <input
                            type="text"
                            value={item.description || ''}
                            placeholder="Brief description for guests"
                            onChange={(e) => handleUpdateMenuItem(item.id, { description: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-white border border-[#252A27]/20 rounded text-xs text-[#252A27]"
                          />
                        </div>

                        {/* Toggles: Verified & Published */}
                        <div className="pt-2 border-t border-[#252A27]/10 flex items-center justify-between text-xs">
                          <label className="flex items-center gap-2 cursor-pointer font-medium text-[#173F35]">
                            <input
                              type="checkbox"
                              checked={item.verified}
                              onChange={(e) => handleUpdateMenuItem(item.id, { verified: e.target.checked })}
                              className="rounded text-[#173F35]"
                            />
                            <span>Verified Price</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#173F35]">
                            <input
                              type="checkbox"
                              checked={item.published}
                              onChange={(e) => handleUpdateMenuItem(item.id, { published: e.target.checked })}
                              className="rounded text-[#173F35]"
                            />
                            <span>Publish on Public Menu</span>
                          </label>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Bottom Action Bar */}
              <div className="pt-4 border-t border-[#252A27]/10 flex items-center justify-between">
                <p className="text-xs text-[#252A27]/60 italic">
                  * Changes made above take effect immediately on public dining page once saved.
                </p>
                <button
                  onClick={handleSaveMenu}
                  disabled={isProcessingAction}
                  className="px-6 py-2.5 bg-[#173F35] hover:bg-[#1f5245] text-white font-semibold rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-md transition-colors"
                >
                  <Save className="w-4 h-4 text-[#C5A572]" />
                  <span>Save All Menu Changes</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================================================================= */}
      {/* MODAL 1: PAYMENT VERIFICATION MODAL */}
      {/* ================================================================= */}
      {verificationModalBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-[#252A27]/10 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#252A27]/10 pb-3">
              <h3 className="font-serif text-xl font-bold text-[#173F35]">
                Verify Advance Payment
              </h3>
              <button
                onClick={() => setVerificationModalBooking(null)}
                className="text-[#252A27]/60 hover:text-[#252A27]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-2 p-3 bg-[#F8F6F0] rounded-xl border border-[#252A27]/10">
              <div className="flex justify-between">
                <span>Reference:</span>
                <strong className="font-mono text-[#173F35]">{verificationModalBooking.reference}</strong>
              </div>
              <div className="flex justify-between">
                <span>Guest:</span>
                <strong>{verificationModalBooking.guestName} ({verificationModalBooking.guestPhone})</strong>
              </div>
              <div className="flex justify-between">
                <span>Room:</span>
                <strong>{verificationModalBooking.roomName}</strong>
              </div>
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <strong className="capitalize">{verificationModalBooking.paymentMethod.replace(/_/g, ' ')}</strong>
              </div>
              <div className="flex justify-between text-amber-800 font-semibold border-t border-[#252A27]/10 pt-1.5">
                <span>Stated Transaction ID:</span>
                <span className="font-mono">{verificationModalBooking.paymentSubmission?.transactionRef}</span>
              </div>
              <div className="flex justify-between text-[#173F35] font-semibold">
                <span>Stated Transferred Amount:</span>
                <span className="tabular-nums">
                  {formatPKR(verificationModalBooking.paymentSubmission?.amount || 0)}
                </span>
              </div>
              {verificationModalBooking.paymentSubmission?.notes && (
                <div className="text-[11px] text-[#252A27]/70 italic border-t border-[#252A27]/10 pt-1">
                  Guest Note: "{verificationModalBooking.paymentSubmission.notes}"
                </div>
              )}
            </div>

            {/* Receipt Image Preview if attached */}
            {verificationModalBooking.paymentSubmission?.receiptImage && (
              <div>
                <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                  Uploaded Receipt Screenshot
                </label>
                <div className="border border-[#252A27]/10 rounded-lg overflow-hidden max-h-48 bg-stone-100 flex justify-center">
                  <img
                    src={verificationModalBooking.paymentSubmission.receiptImage}
                    alt="Payment receipt proof"
                    className="max-h-48 object-contain"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                Verified Amount Received in Bank/Wallet (PKR) *
              </label>
              <input
                type="number"
                value={verifiedAmountInput}
                onChange={(e) => setVerifiedAmountInput(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                Internal Verification Note (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Verified in Meezan Bank portal via Ref #998812"
                value={adminNotesInput}
                onChange={(e) => setAdminNotesInput(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs"
              />
            </div>

            <div className="pt-3 border-t border-[#252A27]/10 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isProcessingAction}
                onClick={() => handleVerifyPayment('reject')}
                className="px-4 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold rounded-lg"
              >
                Reject Proof (Unverified)
              </button>
              <button
                type="button"
                disabled={isProcessingAction}
                onClick={() => handleVerifyPayment('verify')}
                className="px-5 py-2 bg-[#173F35] hover:bg-[#1f5245] text-white text-xs font-semibold rounded-lg"
              >
                Mark Verified & Confirm Stay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL 2: ROOM EDIT / CREATE MODAL */}
      {/* ================================================================= */}
      {isRoomModalOpen && editingRoom && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 border border-[#252A27]/10 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#252A27]/10 pb-3">
              <h3 className="font-serif text-xl font-bold text-[#173F35]">
                {editingRoom.id ? 'Edit Accommodation' : 'Add New Accommodation'}
              </h3>
              <button
                onClick={() => setIsRoomModalOpen(false)}
                className="text-[#252A27]/60 hover:text-[#252A27]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoom} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                    Room Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingRoom.name || ''}
                    onChange={(e) => setEditingRoom({ ...editingRoom, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={editingRoom.category || 'deluxe'}
                    onChange={(e) => setEditingRoom({ ...editingRoom, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs"
                  >
                    <option value="suite">Master Suite</option>
                    <option value="deluxe">Deluxe Room</option>
                    <option value="family">Family Residence</option>
                    <option value="standard">Standard Retreat</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                    Price per Night (PKR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={editingRoom.pricePerNight || 0}
                    onChange={(e) =>
                      setEditingRoom({ ...editingRoom, pricePerNight: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                    Max Occupancy *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={10}
                    value={editingRoom.maxGuests || 2}
                    onChange={(e) =>
                      setEditingRoom({ ...editingRoom, maxGuests: parseInt(e.target.value, 10) || 1 })
                    }
                    className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                    Bed Configuration *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1 King Bed"
                    value={editingRoom.beds || ''}
                    onChange={(e) => setEditingRoom({ ...editingRoom, beds: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={editingRoom.description || ''}
                  onChange={(e) => setEditingRoom({ ...editingRoom, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                  Amenities (comma-separated)
                </label>
                <input
                  type="text"
                  value={editingRoom.amenities?.join(', ') || ''}
                  onChange={(e) =>
                    setEditingRoom({
                      ...editingRoom,
                      amenities: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-[#173F35] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingRoom.active ?? true}
                    onChange={(e) => setEditingRoom({ ...editingRoom, active: e.target.checked })}
                    className="rounded text-[#173F35]"
                  />
                  <span>Active & Bookable</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-[#173F35] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingRoom.featured ?? false}
                    onChange={(e) => setEditingRoom({ ...editingRoom, featured: e.target.checked })}
                    className="rounded text-[#173F35]"
                  />
                  <span>Feature on Homepage</span>
                </label>
              </div>

              <div className="pt-4 border-t border-[#252A27]/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRoomModalOpen(false)}
                  className="px-4 py-2 border border-[#252A27]/20 text-[#252A27] text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingAction}
                  className="px-5 py-2 bg-[#173F35] hover:bg-[#1f5245] text-white text-xs font-semibold rounded-lg"
                >
                  Save Accommodation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Front Desk Booking Quick Edit Modal */}
      {editingBookingForModal && (
        <BookingEditModal
          booking={editingBookingForModal}
          authToken={authToken}
          onClose={() => setEditingBookingForModal(null)}
          onSaved={loadAdminData}
        />
      )}
    </div>
  );
};
