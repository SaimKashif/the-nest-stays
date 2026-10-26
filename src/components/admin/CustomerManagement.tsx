import React, { useState } from 'react';
import { Customer, Booking, FollowUpStatus } from '../../types/index.ts';
import { formatPKR } from '../../utils/booking-logic.ts';
import {
  Users,
  Search,
  MessageSquare,
  Phone,
  Edit,
  Trash2,
  Plus,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  Star,
  Tag,
  X,
  Save,
  AlertCircle,
  ExternalLink,
  History,
} from 'lucide-react';

interface CustomerManagementProps {
  authToken: string;
  customers: Customer[];
  bookings: Booking[];
  onRefresh: () => Promise<void>;
}

export const CustomerManagement: React.FC<CustomerManagementProps> = ({
  authToken,
  customers,
  bookings,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingCustomer, setEditingCustomer] = useState<Partial<Customer> | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [viewHistoryCustomer, setViewHistoryCustomer] = useState<Customer | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string>('');

  // Status counts
  const pendingCount = customers.filter((c) => c.followUpStatus === 'pending').length;
  const contactedCount = customers.filter((c) => c.followUpStatus === 'contacted').length;
  const vipCount = customers.filter((c) => c.followUpStatus === 'vip').length;
  const regularCount = customers.filter((c) => c.followUpStatus === 'regular').length;

  // Filter customers
  const filteredCustomers = customers.filter((c) => {
    if (statusFilter !== 'all' && c.followUpStatus !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchPhone = c.phone.toLowerCase().includes(q);
      const matchEmail = c.email?.toLowerCase().includes(q) || false;
      const matchCity = c.city?.toLowerCase().includes(q) || false;
      const matchNotes = c.notes?.toLowerCase().includes(q) || false;
      const matchFollowUp = c.followUpNotes?.toLowerCase().includes(q) || false;
      if (!matchName && !matchPhone && !matchEmail && !matchCity && !matchNotes && !matchFollowUp) {
        return false;
      }
    }
    return true;
  });

  // Export to CSV
  const handleExportCSV = () => {
    if (customers.length === 0) {
      alert('No customer records to export.');
      return;
    }

    const headers = [
      'Customer ID',
      'Name',
      'Phone',
      'Email',
      'City',
      'CNIC',
      'Follow-Up Status',
      'Total Bookings',
      'Total Spent (PKR)',
      'Last Stay Check-In',
      'Last Stay Check-Out',
      'Booking References',
      'Follow-Up Notes',
      'Internal Notes',
      'Tags',
    ];

    const rows = customers.map((c) => [
      c.id,
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.phone}"`,
      `"${c.email || ''}"`,
      `"${c.city || ''}"`,
      `"${c.cnic || ''}"`,
      c.followUpStatus,
      c.totalBookings,
      c.totalSpent,
      c.lastStayCheckIn || '',
      c.lastStayCheckOut || '',
      `"${(c.bookingReferences || []).join('; ')}"`,
      `"${(c.followUpNotes || '').replace(/"/g, '""')}"`,
      `"${(c.notes || '').replace(/"/g, '""')}"`,
      `"${(c.tags || []).join(', ')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `the-nest-stays-customers-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // WhatsApp follow-up link generator
  const getWhatsAppLink = (customer: Customer) => {
    const cleanPhone = customer.phone.replace(/[\s\-\(\)\+]/g, '');
    const phoneWithCountry = cleanPhone.startsWith('0')
      ? `92${cleanPhone.substring(1)}`
      : cleanPhone.startsWith('92')
      ? cleanPhone
      : `92${cleanPhone}`;

    const text = encodeURIComponent(
      `Assalam-o-Alaikum ${customer.name}! Greetings from The Nest Stays, Gujranwala. We hope you had a restful and pleasant stay with us. We would be delighted to welcome you back whenever you visit Gujranwala next. Please let us know if we can assist you with your future reservations or if there is anything we can do for you!`
    );

    return `https://wa.me/${phoneWithCountry}?text=${text}`;
  };

  // Quick mark as Contacted
  const handleQuickMarkContacted = async (customer: Customer) => {
    try {
      const res = await fetch(`/api/admin/customers/${customer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          followUpStatus: 'contacted',
          lastContactedAt: new Date().toISOString(),
          followUpNotes: customer.followUpNotes
            ? `${customer.followUpNotes} | Contacted on ${new Date().toLocaleDateString()}`
            : `Contacted via WhatsApp on ${new Date().toLocaleDateString()}`,
        }),
      });

      if (res.ok) {
        setActionNotice(`Follow-up status for ${customer.name} updated to Contacted.`);
        setTimeout(() => setActionNotice(''), 4000);
        await onRefresh();
      }
    } catch (err) {
      console.error('Failed to update follow up status:', err);
    }
  };

  // Save Customer Changes (Edit)
  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer || !editingCustomer.id) return;
    setIsSaving(true);

    try {
      const res = await fetch(`/api/admin/customers/${editingCustomer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(editingCustomer),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to save customer.');
        return;
      }

      setIsEditModalOpen(false);
      setEditingCustomer(null);
      setActionNotice('Customer details successfully updated.');
      setTimeout(() => setActionNotice(''), 4000);
      await onRefresh();
    } catch (err) {
      console.error('Failed to save customer:', err);
      alert('Error updating customer record.');
    } finally {
      setIsSaving(false);
    }
  };

  // Create Walk-In Customer
  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer || !editingCustomer.name || !editingCustomer.phone) {
      alert('Name and mobile phone number are required.');
      return;
    }
    setIsSaving(true);

    try {
      const res = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(editingCustomer),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to add customer.');
        return;
      }

      setIsAddModalOpen(false);
      setEditingCustomer(null);
      setActionNotice('New customer added successfully.');
      setTimeout(() => setActionNotice(''), 4000);
      await onRefresh();
    } catch (err) {
      console.error('Failed to add customer:', err);
      alert('Error adding new customer.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Customer
  const handleDeleteCustomer = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from the customer directory?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (res.ok) {
        setActionNotice(`Customer ${name} removed.`);
        setTimeout(() => setActionNotice(''), 4000);
        await onRefresh();
      }
    } catch (err) {
      console.error('Failed to delete customer:', err);
    }
  };

  // Status Badge Component
  const renderStatusBadge = (status: FollowUpStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
            <Clock className="w-3 h-3 text-amber-700" />
            Needs Follow-Up
          </span>
        );
      case 'contacted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
            Contacted
          </span>
        );
      case 'vip':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-100 text-purple-900 border border-purple-300">
            <Star className="w-3 h-3 text-purple-700 fill-purple-700" />
            VIP Guest
          </span>
        );
      case 'regular':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-100 text-blue-900 border border-blue-300">
            <Users className="w-3 h-3 text-blue-700" />
            Regular Guest
          </span>
        );
      case 'needs_attention':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-100 text-rose-900 border border-rose-300">
            <AlertCircle className="w-3 h-3 text-rose-700" />
            Needs Attention
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert Notice */}
      {actionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs rounded-lg flex items-center justify-between">
          <span className="font-semibold">{actionNotice}</span>
          <button onClick={() => setActionNotice('')} className="text-emerald-700 hover:text-emerald-900 font-bold">
            ×
          </button>
        </div>
      )}

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#252A27]/10 shadow-sm">
          <span className="text-xs text-[#252A27]/60 block mb-1">Total Guests</span>
          <strong className="text-2xl font-bold text-[#173F35] block">{customers.length}</strong>
          <span className="text-[11px] text-[#252A27]/50">Recorded in directory</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-sm">
          <span className="text-xs text-amber-800 font-semibold block mb-1">Needs Follow-Up</span>
          <strong className="text-2xl font-bold text-amber-900 block">{pendingCount}</strong>
          <span className="text-[11px] text-amber-700">Awaiting front desk reachout</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-sm">
          <span className="text-xs text-emerald-800 font-semibold block mb-1">Contacted Guests</span>
          <strong className="text-2xl font-bold text-emerald-900 block">{contactedCount + regularCount}</strong>
          <span className="text-[11px] text-emerald-700">Follow-up completed</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-purple-200 bg-purple-50/20 shadow-sm">
          <span className="text-xs text-purple-800 font-semibold block mb-1">VIP & Regulars</span>
          <strong className="text-2xl font-bold text-purple-900 block">{vipCount}</strong>
          <span className="text-[11px] text-purple-700">Priority hospitality status</span>
        </div>
      </div>

      {/* Action Header & Filters */}
      <div className="bg-white p-5 rounded-xl border border-[#252A27]/10 shadow-sm flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { label: 'All Guests', value: 'all', count: customers.length },
            { label: 'Needs Follow-Up', value: 'pending', count: pendingCount },
            { label: 'Contacted', value: 'contacted', count: contactedCount },
            { label: 'VIP Guests', value: 'vip', count: vipCount },
            { label: 'Regulars', value: 'regular', count: regularCount },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                statusFilter === tab.value
                  ? 'bg-[#173F35] text-white shadow-sm'
                  : 'bg-[#F8F6F0] text-[#252A27]/75 hover:bg-[#DCE5DC]'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search name, phone, city, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 pl-9 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs font-medium text-[#252A27] focus:outline-none focus:ring-2 focus:ring-[#173F35]"
            />
            <Search className="w-3.5 h-3.5 text-[#252A27]/50 absolute left-3 top-2.5" />
          </div>

          {/* Add Walk-in Guest */}
          <button
            onClick={() => {
              setEditingCustomer({
                name: '',
                phone: '',
                email: '',
                city: 'Gujranwala',
                cnic: '',
                followUpStatus: 'pending',
                tags: ['Walk-in Guest'],
                notes: '',
                followUpNotes: '',
              });
              setIsAddModalOpen(true);
            }}
            className="px-3 py-2 bg-[#173F35] hover:bg-[#1f5245] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#C5A572]" />
            <span>Add Guest</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 border border-[#252A27]/20 hover:bg-[#F8F6F0] text-[#252A27] text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
            title="Download CSV for front desk / offline records"
          >
            <Download className="w-3.5 h-3.5 text-[#173F35]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-xl border border-[#252A27]/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#173F35] text-[#F8F6F0] uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Guest Information</th>
                <th className="py-3 px-4">City & CNIC</th>
                <th className="py-3 px-4">Stays & Revenue</th>
                <th className="py-3 px-4">Last Stay</th>
                <th className="py-3 px-4">Follow-Up Status</th>
                <th className="py-3 px-4">Notes & Tags</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252A27]/10 text-[#252A27]">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-[#F8F6F0]/60 transition-colors">
                    {/* Guest Info */}
                    <td className="py-4 px-4">
                      <strong className="block text-sm font-semibold text-[#173F35]">
                        {cust.name}
                      </strong>
                      <span className="block text-xs font-mono text-[#252A27]/80">{cust.phone}</span>
                      {cust.email && (
                        <span className="block text-[11px] text-[#252A27]/60 truncate max-w-[180px]">
                          {cust.email}
                        </span>
                      )}
                    </td>

                    {/* City & CNIC */}
                    <td className="py-4 px-4">
                      <span className="block text-xs font-medium text-[#252A27]">
                        {cust.city || '—'}
                      </span>
                      {cust.cnic ? (
                        <span className="inline-block text-[10px] font-mono text-[#173F35] bg-[#EEF3EE] px-1.5 py-0.5 rounded mt-0.5">
                          CNIC: {cust.cnic}
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#252A27]/40 block">No CNIC logged</span>
                      )}
                    </td>

                    {/* Stays & Revenue */}
                    <td className="py-4 px-4 tabular-nums">
                      <strong className="block text-xs text-[#173F35]">
                        {cust.totalBookings} Stay{cust.totalBookings !== 1 ? 's' : ''}
                      </strong>
                      <span className="text-xs text-[#252A27]/70 font-semibold">
                        {formatPKR(cust.totalSpent)}
                      </span>
                    </td>

                    {/* Last Stay */}
                    <td className="py-4 px-4">
                      {cust.lastStayCheckIn ? (
                        <div>
                          <span className="block text-xs font-medium">
                            {cust.lastStayCheckIn}
                          </span>
                          <span className="block text-[10px] text-[#252A27]/50 font-mono">
                            Ref: {(cust.bookingReferences || []).slice(-1)[0] || 'N/A'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[#252A27]/50 text-xs">No completed stay</span>
                      )}
                    </td>

                    {/* Follow-Up Status */}
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        {renderStatusBadge(cust.followUpStatus)}
                        {cust.lastContactedAt && (
                          <span className="block text-[10px] text-[#252A27]/50">
                            Last: {new Date(cust.lastContactedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Notes & Tags */}
                    <td className="py-4 px-4 max-w-xs">
                      {cust.followUpNotes && (
                        <div className="text-xs text-amber-900 bg-amber-50/80 p-1.5 rounded border border-amber-200/60 mb-1 leading-snug">
                          <strong>Follow-up:</strong> {cust.followUpNotes}
                        </div>
                      )}
                      {cust.notes && (
                        <div className="text-[11px] text-[#252A27]/75 line-clamp-2">
                          {cust.notes}
                        </div>
                      )}
                      {cust.tags && cust.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {cust.tags.map((t, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-[#EEF3EE] text-[#173F35] px-1.5 py-0.5 rounded font-medium"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {/* WhatsApp Follow-Up */}
                      <a
                        href={getWhatsAppLink(cust)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-semibold text-[11px] transition-colors shadow-sm"
                        title="Open WhatsApp chat with pre-filled follow-up greeting"
                      >
                        <MessageSquare className="w-3 h-3 text-[#C5A572]" />
                        <span>WhatsApp</span>
                      </a>

                      {/* Quick mark contacted if pending */}
                      {cust.followUpStatus === 'pending' && (
                        <button
                          onClick={() => handleQuickMarkContacted(cust)}
                          className="px-2 py-1 bg-sky-100 hover:bg-sky-200 text-sky-900 rounded font-semibold text-[11px] transition-colors"
                          title="Mark this customer as contacted"
                        >
                          Mark Contacted
                        </button>
                      )}

                      {/* View Stays History */}
                      <button
                        onClick={() => setViewHistoryCustomer(cust)}
                        className="px-2 py-1 border border-[#252A27]/20 hover:bg-[#F8F6F0] text-[#252A27] rounded font-semibold text-[11px] transition-colors"
                        title="View bookings for this guest"
                      >
                        Stays ({cust.bookingReferences?.length || 0})
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => {
                          setEditingCustomer({ ...cust });
                          setIsEditModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-[#173F35] hover:bg-[#1f5245] text-white rounded font-semibold text-[11px] transition-colors"
                      >
                        Edit
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteCustomer(cust.id, cust.name)}
                        className="px-2 py-1 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded font-semibold text-[11px] transition-colors"
                        title="Remove customer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#252A27]/60">
                    <Users className="w-8 h-8 text-[#252A27]/30 mx-auto mb-2" />
                    <p className="font-medium text-sm">No customers match the selected filter.</p>
                    <p className="text-xs text-[#252A27]/50 mt-1">
                      Guest records are automatically created upon booking reservations or can be added manually.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =================================================================== */}
      {/* MODAL 1: EDIT CUSTOMER DETAILS & FOLLOW-UP */}
      {/* =================================================================== */}
      {isEditModalOpen && editingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-[#252A27]/10 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#252A27]/10 mb-5">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#173F35]">
                  Edit Guest Profile & Follow-Up
                </h3>
                <p className="text-xs text-[#252A27]/70">
                  Update customer preferences, contact information, and follow-up status.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingCustomer(null);
                }}
                className="p-1 rounded-lg hover:bg-[#F8F6F0] text-[#252A27]/60 hover:text-[#252A27]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                    Guest Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCustomer.name || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
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
                    value={editingCustomer.phone || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
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
                    value={editingCustomer.email || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs font-medium text-[#252A27]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                    Home City
                  </label>
                  <input
                    type="text"
                    value={editingCustomer.city || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, city: e.target.value })}
                    placeholder="e.g. Gujranwala, Lahore, Islamabad"
                    className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs font-medium text-[#252A27]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                    CNIC / Passport Number
                  </label>
                  <input
                    type="text"
                    value={editingCustomer.cnic || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, cnic: e.target.value })}
                    placeholder="e.g. 34101-1234567-1"
                    className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs font-medium text-[#252A27]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                    Follow-Up Status *
                  </label>
                  <select
                    value={editingCustomer.followUpStatus || 'pending'}
                    onChange={(e) =>
                      setEditingCustomer({
                        ...editingCustomer,
                        followUpStatus: e.target.value as FollowUpStatus,
                      })
                    }
                    className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs font-medium text-[#252A27]"
                  >
                    <option value="pending">Needs Follow-Up (Pending)</option>
                    <option value="contacted">Contacted & Thanked</option>
                    <option value="vip">VIP Guest (High Priority)</option>
                    <option value="regular">Regular Repeat Guest</option>
                    <option value="needs_attention">Needs Special Attention</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                  Follow-Up Log & Notes
                </label>
                <textarea
                  rows={2}
                  value={editingCustomer.followUpNotes || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, followUpNotes: e.target.value })}
                  placeholder="e.g. Sent thank you message on WhatsApp; customer plans to revisit in December."
                  className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs font-medium text-[#252A27]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                  General Guest Notes / Preferences
                </label>
                <textarea
                  rows={2}
                  value={editingCustomer.notes || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, notes: e.target.value })}
                  placeholder="e.g. Prefers extra pillow, quiet room, late check-out when possible."
                  className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs font-medium text-[#252A27]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={(editingCustomer.tags || []).join(', ')}
                  onChange={(e) =>
                    setEditingCustomer({
                      ...editingCustomer,
                      tags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="e.g. Repeat Guest, Corporate, Family, VIP"
                  className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs font-medium text-[#252A27]"
                />
              </div>

              <div className="pt-4 border-t border-[#252A27]/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingCustomer(null);
                  }}
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
                  <span>{isSaving ? 'Saving Changes...' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: ADD WALK-IN / MANUAL GUEST */}
      {/* =================================================================== */}
      {isAddModalOpen && editingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-[#252A27]/10 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#252A27]/10 mb-5">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#173F35]">
                  Register Direct / Walk-In Guest
                </h3>
                <p className="text-xs text-[#252A27]/70">
                  Record walk-in guests or direct phone inquiries for future follow-up.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingCustomer(null);
                }}
                className="p-1 rounded-lg hover:bg-[#F8F6F0] text-[#252A27]/60 hover:text-[#252A27]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                    Guest Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Muhammad Usman"
                    value={editingCustomer.name || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
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
                    placeholder="e.g. 0300 1234567"
                    value={editingCustomer.phone || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
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
                    placeholder="optional"
                    value={editingCustomer.email || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs font-medium text-[#252A27]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={editingCustomer.city || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, city: e.target.value })}
                    placeholder="Gujranwala"
                    className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs font-medium text-[#252A27]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                    CNIC / Passport Number
                  </label>
                  <input
                    type="text"
                    value={editingCustomer.cnic || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, cnic: e.target.value })}
                    placeholder="e.g. 34101-1234567-1"
                    className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs font-medium text-[#252A27]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                    Initial Status
                  </label>
                  <select
                    value={editingCustomer.followUpStatus || 'pending'}
                    onChange={(e) =>
                      setEditingCustomer({
                        ...editingCustomer,
                        followUpStatus: e.target.value as FollowUpStatus,
                      })
                    }
                    className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs font-medium text-[#252A27]"
                  >
                    <option value="pending">Needs Follow-Up</option>
                    <option value="contacted">Already Contacted</option>
                    <option value="vip">VIP Guest</option>
                    <option value="regular">Regular Guest</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1">
                  Notes / Direct Walk-In Details
                </label>
                <textarea
                  rows={2}
                  value={editingCustomer.notes || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, notes: e.target.value })}
                  placeholder="e.g. Walk-in guest on weekend; paid cash at reception."
                  className="w-full px-3 py-2 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-xs font-medium text-[#252A27]"
                />
              </div>

              <div className="pt-4 border-t border-[#252A27]/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingCustomer(null);
                  }}
                  className="px-4 py-2 border border-[#252A27]/20 text-[#252A27] text-xs font-semibold rounded-lg hover:bg-[#F8F6F0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#173F35] hover:bg-[#1f5245] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Registering...' : 'Add to Customer Directory'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 3: VIEW GUEST STAYS HISTORY */}
      {/* =================================================================== */}
      {viewHistoryCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-[#252A27]/10 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#252A27]/10 mb-5">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#173F35]">
                  Stay History: {viewHistoryCustomer.name}
                </h3>
                <p className="text-xs text-[#252A27]/70">
                  {viewHistoryCustomer.phone} · Total Spent: <strong>{formatPKR(viewHistoryCustomer.totalSpent)}</strong>
                </p>
              </div>
              <button
                onClick={() => setViewHistoryCustomer(null)}
                className="p-1 rounded-lg hover:bg-[#F8F6F0] text-[#252A27]/60 hover:text-[#252A27]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {bookings.filter(
                (b) =>
                  (viewHistoryCustomer.bookingReferences || []).includes(b.reference) ||
                  b.guestPhone.replace(/[\s\-\(\)]/g, '') ===
                    viewHistoryCustomer.phone.replace(/[\s\-\(\)]/g, '')
              ).length > 0 ? (
                bookings
                  .filter(
                    (b) =>
                      (viewHistoryCustomer.bookingReferences || []).includes(b.reference) ||
                      b.guestPhone.replace(/[\s\-\(\)]/g, '') ===
                        viewHistoryCustomer.phone.replace(/[\s\-\(\)]/g, '')
                  )
                  .map((b) => (
                    <div
                      key={b.id}
                      className="p-3.5 bg-[#F8F6F0] rounded-xl border border-[#252A27]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <strong className="font-mono text-sm text-[#173F35]">{b.reference}</strong>
                          <span className="capitalize font-semibold text-[11px] bg-white px-2 py-0.5 rounded border border-[#252A27]/10">
                            {b.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="text-[#252A27]/80">
                          {b.roomName} · {b.checkIn} to {b.checkOut} ({b.nights} night{b.nights > 1 ? 's' : ''} · {b.guestsCount} guest{b.guestsCount > 1 ? 's' : ''})
                        </div>
                        {b.adminNotes && (
                          <div className="text-[11px] text-amber-800 italic mt-0.5">
                            Note: {b.adminNotes}
                          </div>
                        )}
                      </div>
                      <div className="sm:text-right shrink-0">
                        <strong className="text-sm font-bold text-[#173F35] block tabular-nums">
                          {formatPKR(b.total)}
                        </strong>
                        <span className="text-[11px] text-[#252A27]/60 block capitalize">
                          {b.paymentMethod.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="py-8 text-center text-xs text-[#252A27]/60">
                  No reservations linked to this phone number yet.
                </div>
              )}
            </div>

            <div className="pt-5 border-t border-[#252A27]/10 flex justify-end">
              <button
                onClick={() => setViewHistoryCustomer(null)}
                className="px-4 py-2 bg-[#173F35] text-white text-xs font-semibold rounded-lg"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
