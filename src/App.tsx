import React, { useState, useEffect } from 'react';
import { Room, PropertySettings, Booking } from './types/index.ts';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { RoomsPage } from './pages/RoomsPage.tsx';
import { RoomDetailPage } from './pages/RoomDetailPage.tsx';
import { BookPage } from './pages/BookPage.tsx';
import { BookingStatusPage } from './pages/BookingStatusPage.tsx';
import { ContactPage } from './pages/ContactPage.tsx';
import { AboutPage } from './pages/AboutPage.tsx';
import { MenuPage } from './pages/MenuPage.tsx';
import { AdminDashboard } from './pages/AdminDashboard.tsx';
import { MenuItem, RefreshmentItem } from './types/index.ts';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const p = window.location.pathname;
    return p === '' ? '/' : p;
  });

  const [rooms, setRooms] = useState<Room[]>([]);
  const [settings, setSettings] = useState<PropertySettings | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [refreshments, setRefreshments] = useState<RefreshmentItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Selected room for detail view or direct booking
  const [activeRoomDetail, setActiveRoomDetail] = useState<Room | null>(null);
  const [bookingPrefillRoom, setBookingPrefillRoom] = useState<Room | null>(null);

  // Availability Search parameters shared between Home/Rooms and Booking
  const [searchDates, setSearchDates] = useState<{
    checkIn: string;
    checkOut: string;
    guests: number;
  } | null>(null);
  const [availableRoomIds, setAvailableRoomIds] = useState<string[] | null>(null);

  // Active Booking for Confirmation View
  const [lastCreatedBooking, setLastCreatedBooking] = useState<Booking | null>(null);

  // Fetch initial rooms & property settings from server
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [roomsRes, settingsRes, menuRes, refRes] = await Promise.all([
          fetch('/api/rooms'),
          fetch('/api/settings'),
          fetch('/api/menu'),
          fetch('/api/refreshments'),
        ]);

        if (roomsRes.ok) {
          const rData = await roomsRes.json();
          setRooms(rData);
        }

        if (settingsRes.ok) {
          const sData = await settingsRes.json();
          setSettings(sData);
        }

        if (menuRes.ok) {
          const mData = await menuRes.json();
          setMenu(mData);
        }

        if (refRes.ok) {
          const rfData = await refRes.json();
          setRefreshments(rfData);
        }
      } catch (err) {
        console.error('Error fetching initial app data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Listen to browser popstate (back/forward)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Availability Search Trigger
  const handleAvailabilitySearch = async (
    checkIn: string,
    checkOut: string,
    guests: number
  ) => {
    setSearchDates({ checkIn, checkOut, guests });
    try {
      const res = await fetch(
        `/api/availability?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`
      );
      if (res.ok) {
        const data = await res.json();
        const ids = data.availableRooms.map((r: Room) => r.id);
        setAvailableRoomIds(ids);
      }
    } catch (err) {
      console.error('Availability search failed:', err);
    }
    navigate('/rooms');
  };

  const handleClearDateFilter = () => {
    setSearchDates(null);
    setAvailableRoomIds(null);
  };

  // Room Card / Detail Interactions
  const handleViewRoomDetails = (room: Room) => {
    setActiveRoomDetail(room);
    navigate(`/rooms/${room.id}`);
  };

  const handleSelectRoomForBooking = (
    room: Room,
    checkIn?: string,
    checkOut?: string,
    guests?: number
  ) => {
    setBookingPrefillRoom(room);
    if (checkIn && checkOut && guests) {
      setSearchDates({ checkIn, checkOut, guests });
    }
    navigate('/book');
  };

  const handleBookingComplete = (booking: Booking) => {
    setLastCreatedBooking(booking);
    navigate(`/booking-status?ref=${booking.reference}`);
  };

  // URL query parameter for status lookup (e.g. ?ref=TNS-847291)
  const urlParams = new URLSearchParams(window.location.search);
  const refFromUrl = urlParams.get('ref') || '';

  // Admin page is self-contained with its own header
  if (currentPath === '/admin') {
    return <AdminDashboard onReturnToSite={() => navigate('/')} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F6F0] text-[#252A27]">
      {/* Universal Header */}
      <Header
        currentPath={currentPath}
        onNavigate={navigate}
        onBookNowClick={() => navigate('/book')}
        phone={settings?.phone}
        whatsapp={settings?.whatsapp}
      />

      {/* Main Routed Content */}
      <main className="flex-1">
        {/* HOME ROUTE */}
        {currentPath === '/' && (
          <HomePage
            rooms={rooms}
            settings={settings}
            onNavigate={navigate}
            onSelectRoomForBooking={handleSelectRoomForBooking}
            onViewRoomDetails={handleViewRoomDetails}
            onSearch={handleAvailabilitySearch}
          />
        )}

        {/* ROOMS LIST ROUTE */}
        {currentPath === '/rooms' && (
          <RoomsPage
            rooms={rooms}
            selectedDates={searchDates}
            availableRoomIds={availableRoomIds}
            onSelectRoomForBooking={handleSelectRoomForBooking}
            onViewRoomDetails={handleViewRoomDetails}
            onSearch={handleAvailabilitySearch}
            onClearDateFilter={handleClearDateFilter}
          />
        )}

        {/* INDIVIDUAL ROOM DETAIL ROUTE */}
        {currentPath.startsWith('/rooms/') && (
          <RoomDetailPage
            room={
              activeRoomDetail ||
              rooms.find((r) => r.id === currentPath.replace('/rooms/', '')) ||
              rooms[0]
            }
            settings={settings}
            onBack={() => navigate('/rooms')}
            onBookNow={(room) => handleSelectRoomForBooking(room)}
          />
        )}

        {/* BOOK A ROOM ROUTE */}
        {currentPath === '/book' && (
          <BookPage
            rooms={rooms}
            settings={settings}
            initialRoom={bookingPrefillRoom}
            initialCheckIn={searchDates?.checkIn}
            initialCheckOut={searchDates?.checkOut}
            initialGuests={searchDates?.guests}
            onBookingComplete={handleBookingComplete}
            onNavigate={navigate}
          />
        )}

        {/* BOOKING STATUS / CONFIRMATION ROUTE */}
        {currentPath.startsWith('/booking-status') && (
          <BookingStatusPage
            initialReference={refFromUrl || lastCreatedBooking?.reference}
            initialBooking={lastCreatedBooking}
            settings={settings}
            onNavigate={navigate}
          />
        )}

        {/* CONTACT US ROUTE */}
        {currentPath === '/contact' && <ContactPage settings={settings} />}

        {/* DINING & FOOD MENU ROUTE */}
        {currentPath === '/menu' && (
          <MenuPage menu={menu} refreshments={refreshments} settings={settings} />
        )}

        {/* ABOUT & POLICIES ROUTE */}
        {currentPath === '/about' && (
          <AboutPage settings={settings} onNavigate={navigate} />
        )}
      </main>

      {/* Universal Footer */}
      <Footer settings={settings} onNavigate={navigate} />
    </div>
  );
}
