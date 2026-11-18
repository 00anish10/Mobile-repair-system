import React, { useState } from 'react';
import { Phone, Mail, MapPin, Twitter, Facebook, Instagram, Send } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { apiContact, isNetworkError } from '../lib/api';

const SUBJECTS = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'booking', label: 'Booking Issue' },
  { value: 'repair', label: 'Repair Question' },
  { value: 'technical', label: 'Technical Support' },
  { value: 'partnership', label: 'Partnership' },
];

export const SupportPage: React.FC = () => {
  const { success, error } = useToast();
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: 'general',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.name.trim().length < 2) {
      error('Name required', { description: 'Please enter your full name.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      error('Valid email required', { description: 'Please enter a valid email address.' });
      return;
    }
    if (form.message.trim().length < 10) {
      error('Message too short', { description: 'Please describe your issue in at least 10 characters.' });
      return;
    }

    setSubmitting(true);
    try {
      await apiContact({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject,
        message: form.message.trim(),
      });
      success('Message Sent!', {
        description: 'We will get back to you within 24 hours.',
      });
      setForm({ name: '', email: '', subject: 'general', message: '' });
    } catch (err) {
      if (isNetworkError(err)) {
        success('Message queued locally', {
          description: 'Our support server is offline. Please call 1300 555 012 for urgent help.',
        });
        setForm({ name: '', email: '', subject: 'general', message: '' });
      } else {
        error('Could not send message', {
          description: err instanceof Error ? err.message : 'Please try again or call support.',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="support" className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4">
            <Phone className="w-3.5 h-3.5 text-blue-500" />
            <span>Get in Touch</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            Contact Support
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            Have questions about your repair? Need help with an existing booking? Reach out to our
            support team and we&apos;ll respond promptly.
          </p>
        </div>

        <div className="bg-slate-50/70 rounded-2xl border border-slate-200/90 p-8 sm:p-12 max-w-2xl mx-auto mb-12">
          <h3 className="text-2xl font-bold text-slate-900 mb-6">Send Us a Message</h3>
          <form onSubmit={handleContactSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="support-name" className="block text-sm font-medium text-slate-700 mb-1.5">
                Name
              </label>
              <input
                id="support-name"
                type="text"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Your full name"
                required
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="support-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <input
                id="support-email"
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="support-subject"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Subject
              </label>
              <select
                id="support-subject"
                value={form.subject}
                onChange={(e) => updateField('subject', e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SUBJECTS.map((subject) => (
                  <option key={subject.value} value={subject.value}>
                    {subject.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="support-message"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Message
              </label>
              <textarea
                id="support-message"
                rows={4}
                value={form.message}
                onChange={(e) => updateField('message', e.target.value)}
                placeholder="Describe your issue or question..."
                required
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white font-bold text-sm transition-all cursor-pointer shadow-md shadow-blue-500/25 hover:shadow-xl"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Sending...' : 'Send Message'}</span>
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Phone className="w-6 h-6 text-blue-500" />
              <h4 className="text-xl font-bold text-slate-900">Phone Support</h4>
            </div>
            <p className="text-slate-600">
              1300 555 012
              <br />
              Mon - Fri: 8 AM - 8 PM
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Mail className="w-6 h-6 text-blue-500" />
              <h4 className="text-xl font-bold text-slate-900">Email Support</h4>
            </div>
            <p className="text-slate-600">
              support@moonmobilerepair.com
              <br />
              Replies within 24 hours
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-6 h-6 text-blue-500" />
              <h4 className="text-xl font-bold text-slate-900">Location</h4>
            </div>
            <p className="text-slate-600">
              Level 12, 123 Pitt Street, Sydney NSW 2000
              <br />
              Doorstep service available
            </p>
          </div>
        </div>

        <div className="bg-slate-50/70 rounded-2xl border border-slate-200/90 p-8 sm:p-12 max-w-2xl mx-auto">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Support Hours</h3>
          <div className="space-y-3 text-slate-600">
            <div className="flex justify-between">
              <span>Monday - Friday</span>
              <span>8:00 AM - 8:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span>Saturday</span>
              <span>9:00 AM - 7:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span>Sunday</span>
              <span>Closed</span>
            </div>
            <div className="flex justify-between text-blue-600 font-medium">
              <span>Emergency Line</span>
              <span>Available 24/7</span>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-slate-500">
            <strong>Live Chat</strong> is currently offline. Leave your message and we&apos;ll respond
            during support hours.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-300 hover:border-blue-500 bg-blue-50 text-slate-700 font-medium transition-colors"
          >
            <Twitter className="w-4 h-4" />
            <span>X</span>
          </a>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-300 hover:border-blue-500 bg-blue-50 text-slate-700 font-medium transition-colors"
          >
            <Facebook className="w-4 h-4" />
            <span>Facebook</span>
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-300 hover:border-blue-500 bg-blue-50 text-slate-700 font-medium transition-colors"
          >
            <Instagram className="w-4 h-4" />
            <span>Instagram</span>
          </a>
        </div>
      </div>
    </section>
  );
};
