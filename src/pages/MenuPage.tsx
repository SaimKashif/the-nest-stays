import React, { useState } from 'react';
import { MenuItem, RefreshmentItem, PropertySettings } from '../types/index.ts';
import { formatPKR } from '../utils/booking-logic.ts';
import {
  Utensils,
  Coffee,
  Sun,
  Moon,
  Wine,
  Package,
  MessageSquare,
  Phone,
  Info,
} from 'lucide-react';

interface MenuPageProps {
  menu: MenuItem[];
  refreshments: RefreshmentItem[];
  settings: PropertySettings | null;
}

export const MenuPage: React.FC<MenuPageProps> = ({ menu, refreshments, settings }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'breakfast' | 'lunch' | 'dinner' | 'beverages' | 'refreshments'>('all');

  const categories = [
    { id: 'all', label: 'Complete Menu', icon: <Utensils className="w-3.5 h-3.5" /> },
    { id: 'breakfast', label: 'Breakfast', icon: <Coffee className="w-3.5 h-3.5" /> },
    { id: 'lunch', label: 'Lunch & Light Meals', icon: <Sun className="w-3.5 h-3.5" /> },
    { id: 'dinner', label: 'Dinner Specialities', icon: <Moon className="w-3.5 h-3.5" /> },
    { id: 'beverages', label: 'Beverages', icon: <Wine className="w-3.5 h-3.5" /> },
    { id: 'refreshments', label: 'In-Room Refreshments', icon: <Package className="w-3.5 h-3.5" /> },
  ];

  const breakfastItems = menu.filter((m) => m.category === 'breakfast' && m.published);
  const lunchItems = menu.filter((m) => m.category === 'lunch' && m.published);
  const dinnerItems = menu.filter((m) => m.category === 'dinner' && m.published);
  const beverageItems = menu.filter((m) => m.category === 'beverages' && m.published);

  const whatsapp = settings?.whatsapp || '+923001468362';
  const cleanWhatsApp = whatsapp.replace(/[^0-9]/g, '');

  return (
    <div className="bg-[#F8F6F0] min-h-screen py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-xs uppercase tracking-[0.2em] text-[#C5A572] font-semibold mb-2">
            Freshly Prepared For Staying Guests
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#173F35] tracking-tight mb-4">
            Guest Dining & Refreshments
          </h1>
          <p className="text-sm sm:text-base text-[#252A27]/80 leading-relaxed font-light">
            Enjoy comforting home-style Pakistani meals and light dishes prepared fresh to order. Provided for resident guest convenience and room dining.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 p-2.5 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-amber-900">
            <Info className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Printed tariff prices shown. Order directly with room service or front desk.</span>
          </div>
        </div>

        {/* Category Filter Tabs (Zero-Pill interactive segmented control) */}
        <div className="flex items-center justify-center gap-1.5 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#173F35] text-white shadow-sm'
                  : 'bg-white text-[#252A27]/80 hover:bg-[#DCE5DC]/60 border border-[#252A27]/10'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* ================================================================ */}
        {/* IN-ROOM REFRESHMENTS & MINI-BAR SECTION */}
        {/* ================================================================ */}
        {(selectedCategory === 'all' || selectedCategory === 'refreshments') && (
          <section className="bg-white rounded-2xl p-6 sm:p-8 border border-[#252A27]/10 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#252A27]/10 gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#EEF3EE] rounded-lg text-[#173F35]">
                  <Package className="w-5 h-5 text-[#173F35]" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#173F35]">
                    In-Room Refreshments (Optional Mini-Bar)
                  </h2>
                  <p className="text-xs text-[#252A27]/70">
                    Stocked inside guest rooms. Charges apply only if consumed upon check-out.
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 shrink-0">
                Optional · Charged on use
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {refreshments.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-[#F8F6F0] rounded-xl border border-[#252A27]/10 flex items-center justify-between"
                >
                  <div>
                    <strong className="block text-sm font-semibold text-[#173F35]">{item.name}</strong>
                    {item.size && (
                      <span className="text-xs text-[#252A27]/60 block">{item.size} ({item.unit})</span>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-base text-[#173F35] tabular-nums">
                      {formatPKR(item.price)}
                    </span>
                    <span className="text-[10px] text-[#252A27]/60 block">{item.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ================================================================ */}
        {/* BREAKFAST SECTION */}
        {/* ================================================================ */}
        {(selectedCategory === 'all' || selectedCategory === 'breakfast') && (
          <section className="bg-white rounded-2xl p-6 sm:p-8 border border-[#252A27]/10 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-[#252A27]/10">
              <div className="p-2 bg-[#EEF3EE] rounded-lg text-[#173F35]">
                <Coffee className="w-5 h-5 text-[#173F35]" />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#173F35]">
                  Breakfast Menu
                </h2>
                <p className="text-xs text-[#252A27]/70">
                  Served fresh daily from 7:30 AM to 11:00 AM in room or dining area.
                </p>
              </div>
            </div>

            <div className="divide-y divide-[#252A27]/10">
              {breakfastItems.map((item) => (
                <div key={item.id} className="py-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#173F35]">
                      {item.name}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-[#252A27]/75 mt-0.5 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                    {item.note && (
                      <span className="text-[11px] text-amber-800 font-medium italic mt-1 block">
                        * {item.note}
                      </span>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-base text-[#173F35] tabular-nums">
                      {formatPKR(item.price)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ================================================================ */}
        {/* LUNCH & LIGHT MEALS SECTION */}
        {/* ================================================================ */}
        {(selectedCategory === 'all' || selectedCategory === 'lunch') && (
          <section className="bg-white rounded-2xl p-6 sm:p-8 border border-[#252A27]/10 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-[#252A27]/10">
              <div className="p-2 bg-[#EEF3EE] rounded-lg text-[#173F35]">
                <Sun className="w-5 h-5 text-[#173F35]" />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#173F35]">
                  Lunch & Light Meals
                </h2>
                <p className="text-xs text-[#252A27]/70">
                  Served from 12:30 PM to 4:00 PM.
                </p>
              </div>
            </div>

            <div className="divide-y divide-[#252A27]/10">
              {lunchItems.map((item) => (
                <div key={item.id} className="py-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#173F35]">
                      {item.name}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-[#252A27]/75 mt-0.5 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-base text-[#173F35] tabular-nums">
                      {formatPKR(item.price)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ================================================================ */}
        {/* DINNER SECTION */}
        {/* ================================================================ */}
        {(selectedCategory === 'all' || selectedCategory === 'dinner') && (
          <section className="bg-white rounded-2xl p-6 sm:p-8 border border-[#252A27]/10 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-[#252A27]/10">
              <div className="p-2 bg-[#EEF3EE] rounded-lg text-[#173F35]">
                <Moon className="w-5 h-5 text-[#173F35]" />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#173F35]">
                  Dinner Specialities
                </h2>
                <p className="text-xs text-[#252A27]/70">
                  Served hot from 7:00 PM to 10:30 PM.
                </p>
              </div>
            </div>

            <div className="divide-y divide-[#252A27]/10">
              {dinnerItems.map((item) => (
                <div key={item.id} className="py-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#173F35]">
                      {item.name}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-[#252A27]/75 mt-0.5 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-base text-[#173F35] tabular-nums">
                      {formatPKR(item.price)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ================================================================ */}
        {/* BEVERAGES SECTION */}
        {/* ================================================================ */}
        {(selectedCategory === 'all' || selectedCategory === 'beverages') && (
          <section className="bg-white rounded-2xl p-6 sm:p-8 border border-[#252A27]/10 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-[#252A27]/10">
              <div className="p-2 bg-[#EEF3EE] rounded-lg text-[#173F35]">
                <Wine className="w-5 h-5 text-[#173F35]" />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#173F35]">
                  Chilled Beverages
                </h2>
                <p className="text-xs text-[#252A27]/70">
                  Available 24 hours upon request.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {beverageItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-[#F8F6F0] rounded-xl border border-[#252A27]/10 flex items-center justify-between"
                >
                  <div>
                    <strong className="block text-sm font-semibold text-[#173F35]">{item.name}</strong>
                    {item.description && (
                      <span className="text-xs text-[#252A27]/60 block">{item.description}</span>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-base text-[#173F35] tabular-nums">
                      {formatPKR(item.price)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Order Ordering Coordination Notice */}
        <div className="bg-[#173F35] text-white p-6 sm:p-8 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mb-1">
              Place Your Dining Order
            </h3>
            <p className="text-xs sm:text-sm text-[#F8F6F0]/80">
              Guests staying in house can dial front desk reception or send a quick WhatsApp message to request freshly cooked meals.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href={`https://wa.me/${cleanWhatsApp}?text=Hello%20The%20Nest%20Stays,%20I%20would%20like%20to%20order%20from%20the%20food%20menu.`}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>WhatsApp Order</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
