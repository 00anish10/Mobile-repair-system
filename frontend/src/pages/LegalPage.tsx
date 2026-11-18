import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileText, ArrowLeft } from 'lucide-react';

interface LegalPageProps {
  kind: 'terms' | 'privacy';
}

const TERMS = [
  {
    title: '1. Booking & confirmation',
    body: 'A booking is confirmed once you receive a Moon Mobile Repair reference number. Our dispatch team may contact you to confirm the technician, arrival window, and final quote.',
  },
  {
    title: '2. Pricing & payment',
    body: 'Estimates are based on the selected device, model, and repair issue. Final pricing may vary if the technician discovers additional damage during diagnosis. Payment is collected only after you test and approve the repair.',
  },
  {
    title: '3. Warranty',
    body: 'Replaced screens carry a 12-month doorstep warranty. Other component replacements carry a 6-month warranty unless stated otherwise. Warranty does not cover new accidental damage, liquid ingress after repair, or unauthorised third-party repairs.',
  },
  {
    title: '4. Cancellations',
    body: 'You may cancel free of charge before the technician is dispatched. Cancellations after dispatch may incur a travel fee. Moon Mobile Repair may reschedule if a technician cannot safely reach the location.',
  },
  {
    title: '5. Data & device security',
    body: 'Technicians perform repairs in front of you whenever possible. You never need to hand over passwords. Back up important data before any repair; repair can occasionally affect storage or software state.',
  },
];

const PRIVACY = [
  {
    title: 'Information we collect',
    body: 'We collect the details you provide when booking or registering: name, phone number, email, service address, device details, and repair notes. Payment information is processed by our payment partners and is never stored on our servers.',
  },
  {
    title: 'How we use information',
    body: 'Your information is used to dispatch technicians, provide status updates, issue warranty records, and improve service quality. We do not sell personal data.',
  },
  {
    title: 'Data retention',
    body: 'Booking and warranty records are retained for the warranty period plus any period required by law. You may request deletion of your account data by contacting support.',
  },
  {
    title: 'Cookies & local storage',
    body: 'This app stores your session, theme preference, and booking drafts in your browser. Clearing browser storage removes these preferences but does not affect your account on our servers.',
  },
  {
    title: 'Your rights',
    body: 'You can request access, correction, or deletion of your personal data by emailing support@moonmobilerepair.com. We respond to verified requests within 30 days.',
  },
];

export const LegalPage: React.FC<LegalPageProps> = ({ kind }) => {
  const isTerms = kind === 'terms';
  const sections = isTerms ? TERMS : PRIVACY;

  return (
    <div className="bg-slate-50 min-h-screen py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              {isTerms ? <FileText className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {isTerms ? 'Terms of Service' : 'Privacy Policy'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mb-8">Last updated: November 2026</p>

          <div className="space-y-7">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="font-bold text-slate-900 mb-2">{section.title}</h2>
                <p className="text-sm text-slate-600 leading-relaxed">{section.body}</p>
              </section>
            ))}
          </div>

          <div className="mt-10 pt-6 border-t border-slate-100 text-xs text-slate-500">
            Questions? Email{' '}
            <a className="text-blue-600 font-semibold hover:underline" href="mailto:support@moonmobilerepair.com">
              support@moonmobilerepair.com
            </a>{' '}
            or call 1300 555 012.
          </div>
        </div>
      </div>
    </div>
  );
};
