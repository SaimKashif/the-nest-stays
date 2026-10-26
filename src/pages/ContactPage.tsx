import React, { useState } from 'react';
import { PropertySettings } from '../types/index.ts';
import {
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  ExternalLink,
  CheckCircle2,
  Clock,
  Send,
} from 'lucide-react';

interface ContactPageProps {
  settings: PropertySettings | null;
}

export const ContactPage: React.FC<ContactPageProps> = ({ settings }) => {
  const phone = settings?.phone || '0300 1468362';
  const whatsapp = settings?.whatsapp || '+923001468362';
  const email = settings?.email || 'info@theneststays.pk';
  const address = settings?.address || 'Street Number 3, opposite UCP Mufti Town, near Qalma Chownk, Mufti Colony, Gujranwala, 52250, Pakistan';
  const mapsUrl = settings?.googleMapsUrl || 'https://maps.google.com/?q=Street+Number+3+opposite+UCP+Mufti+Town+near+Qalma+Chownk+Mufti+Colony+Gujranwala+52250+Pakistan';

  const [name, setName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone: guestPhone,
          email: guestEmail || undefined,
          subject: subject || undefined,
          message,
        }),
      });

      if (!res.ok) {
        throw new Error('Could not send message. Please try contacting via WhatsApp or Phone.');
      }

      setIsSubmitted(true);
      setName('');
      setGuestPhone('');
      setGuestEmail('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F8F6F0] min-h-screen py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="text-xs uppercase tracking-[0.2em] text-[#C5A572] font-semibold mb-2">
            Get in Touch
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#173F35] tracking-tight mb-4">
            Contact The Nest Stays
          </h1>
          <p className="text-sm sm:text-base text-[#252A27]/80 leading-relaxed font-light">
            We are here to assist with room inquiries, travel directions, special family arrangements, or corporate retreat bookings.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column: Direct Channels & Map */}
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#252A27]/10 shadow-sm space-y-6">
              <h2 className="font-serif text-2xl font-bold text-[#173F35]">
                Direct Contacts
              </h2>

              <div className="space-y-4">
                <a
                  href={`tel:${phone.replace(/\s+/g, '')}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-[#F8F6F0] hover:bg-[#EEF3EE] border border-[#252A27]/10 transition-colors group"
                >
                  <div className="p-3 bg-[#173F35] text-white rounded-lg">
                    <Phone className="w-5 h-5 text-[#C5A572]" />
                  </div>
                  <div>
                    <span className="text-xs text-[#252A27]/60 block">Direct Reservation Phone</span>
                    <strong className="text-base text-[#173F35] font-semibold group-hover:underline">
                      {phone}
                    </strong>
                  </div>
                </a>

                <a
                  href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=Hello%20The%20Nest%20Stays,%20inquiring%20about%20a%20stay.`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl bg-[#F8F6F0] hover:bg-[#EEF3EE] border border-[#252A27]/10 transition-colors group"
                >
                  <div className="p-3 bg-[#25D366] text-white rounded-lg">
                    <MessageSquare className="w-5 h-5 fill-white" />
                  </div>
                  <div>
                    <span className="text-xs text-[#252A27]/60 block">Instant WhatsApp Concierge</span>
                    <strong className="text-base text-[#173F35] font-semibold group-hover:underline">
                      {whatsapp}
                    </strong>
                  </div>
                </a>

                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-[#F8F6F0] hover:bg-[#EEF3EE] border border-[#252A27]/10 transition-colors group"
                >
                  <div className="p-3 bg-[#173F35] text-white rounded-lg">
                    <Mail className="w-5 h-5 text-[#C5A572]" />
                  </div>
                  <div>
                    <span className="text-xs text-[#252A27]/60 block">Official Email</span>
                    <strong className="text-base text-[#173F35] font-semibold group-hover:underline">
                      {email}
                    </strong>
                  </div>
                </a>
              </div>

              {/* Physical Location */}
              <div className="pt-4 border-t border-[#252A27]/10">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#C5A572] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-semibold text-[#173F35] uppercase tracking-wider block">
                      Property Address
                    </span>
                    <p className="text-sm text-[#252A27]/80 mt-1 leading-relaxed">
                      {address}
                    </p>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#173F35] hover:underline"
                    >
                      <span>Get Navigation Directions on Google Maps</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Timings card */}
            <div className="bg-white p-5 rounded-xl border border-[#252A27]/10 flex items-center gap-3 text-xs text-[#252A27]/80">
              <Clock className="w-5 h-5 text-[#173F35] shrink-0" />
              <div>
                <strong>Check-in:</strong> {settings?.checkInTime || '2:00 PM'} ·{' '}
                <strong>Check-out:</strong> {settings?.checkOutTime || '12:00 PM'} ·{' '}
                <strong>Reception Desk:</strong> 08:00 AM – 11:00 PM Daily
              </div>
            </div>
          </div>

          {/* Right Column: Contact Message Form */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#252A27]/10 shadow-sm">
            <h2 className="font-serif text-2xl font-bold text-[#173F35] mb-2">
              Send an Inquiry
            </h2>
            <p className="text-xs text-[#252A27]/70 mb-6">
              Fill out the form below and our reservation manager will respond promptly via call or WhatsApp.
            </p>

            {isSubmitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="font-serif text-xl font-bold text-emerald-900">
                  Message Sent Successfully
                </h3>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Thank you for reaching out. Our team will review your inquiry and contact you shortly.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="mt-2 text-xs text-emerald-800 font-semibold underline"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label htmlFor="contact-form-name" className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1.5">
                    Your Name *
                  </label>
                  <input
                    id="contact-form-name"
                    type="text"
                    required
                    placeholder="e.g. Tariq Mehmood"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-sm text-[#252A27]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-form-phone" className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1.5">
                      Phone / WhatsApp *
                    </label>
                    <input
                      id="contact-form-phone"
                      type="tel"
                      required
                      placeholder="0300 1234567"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-sm text-[#252A27]"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-form-email" className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1.5">
                      Email Address (Optional)
                    </label>
                    <input
                      id="contact-form-email"
                      type="email"
                      placeholder="name@example.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-sm text-[#252A27]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-form-subject" className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1.5">
                    Subject
                  </label>
                  <input
                    id="contact-form-subject"
                    type="text"
                    placeholder="e.g. Group booking or special dates inquiry"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-sm text-[#252A27]"
                  />
                </div>

                <div>
                  <label htmlFor="contact-form-message" className="block text-xs font-semibold text-[#173F35] uppercase tracking-wider mb-1.5">
                    Your Message *
                  </label>
                  <textarea
                    id="contact-form-message"
                    required
                    rows={4}
                    placeholder="Please let us know how we can assist you..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F8F6F0] border border-[#252A27]/20 rounded-lg text-sm text-[#252A27]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-[#173F35] hover:bg-[#1f5245] active:bg-[#0f2c25] disabled:bg-stone-400 text-white font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Send className="w-4 h-4 text-[#C5A572]" />
                  <span>{isSubmitting ? 'Sending Message...' : 'Send Inquiry'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
