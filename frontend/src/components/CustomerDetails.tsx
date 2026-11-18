import React from 'react';
import { User, Phone, Mail, ShieldCheck, CreditCard } from 'lucide-react';

type PaymentMethod = 'cash_on_delivery' | 'card' | 'apple_pay' | 'google_pay' | 'paypal';

interface CustomerDetailsProps {
  customerName: string;
  setCustomerName: (value: string) => void;
  customerPhone: string;
  setCustomerPhone: (value: string) => void;
  customerEmail: string;
  setCustomerEmail: (value: string) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (value: PaymentMethod) => void;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  calculatedCost: number;
  currentStep: number;
  onNext: () => void;
  deviceLabel: string;
  problemLabel: string;
  appointmentLabel: string;
  serviceLabel: string;
}

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string }[] = [
  { id: 'cash_on_delivery', label: 'Cash after service' },
  { id: 'card', label: 'Card' },
  { id: 'apple_pay', label: 'Apple Pay' },
  { id: 'google_pay', label: 'Google Pay' },
  { id: 'paypal', label: 'PayPal' },
];

export const CustomerDetails: React.FC<CustomerDetailsProps> = ({
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  customerEmail,
  setCustomerEmail,
  paymentMethod,
  setPaymentMethod,
  errors,
  setErrors,
  calculatedCost,
  currentStep,
  onNext,
  deviceLabel,
  problemLabel,
  appointmentLabel,
  serviceLabel,
}) => {
  void currentStep;
  void onNext;

  const clear = (key: string) => setErrors((prev) => ({ ...prev, [key]: '' }));

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
        Customer contact & payment
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label
            htmlFor="customer-name"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            Full name *
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="customer-name"
              type="text"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                clear('name');
              }}
              placeholder="e.g. Anish Shrestha"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600"
            />
          </div>
          {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
        </div>

        <div>
          <label
            htmlFor="customer-phone"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            Phone number *
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="customer-phone"
              type="tel"
              value={customerPhone}
              onChange={(e) => {
                setCustomerPhone(e.target.value);
                clear('phone');
              }}
              placeholder="+61 4XX XXX XXX"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600"
            />
          </div>
          {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone}</p>}
        </div>

        <div>
          <label
            htmlFor="customer-email"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            Email (invoice & warranty) *
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="customer-email"
              type="email"
              value={customerEmail}
              onChange={(e) => {
                setCustomerEmail(e.target.value);
                clear('email');
              }}
              placeholder="your.email@domain.com"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600"
            />
          </div>
          {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
        </div>
      </div>

      <div className="pt-2">
        <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <CreditCard className="w-3.5 h-3.5" /> Payment preference (pay after repair)
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PAYMENT_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setPaymentMethod(option.id)}
              className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                paymentMethod === option.id
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mt-4 space-y-2 text-xs">
        <div className="flex justify-between text-slate-600">
          <span>Device:</span>
          <span className="font-bold text-slate-900 text-right">{deviceLabel}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Repair:</span>
          <span className="font-bold text-slate-900 text-right">{problemLabel}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Service mode:</span>
          <span className="font-bold text-slate-900 capitalize text-right">{serviceLabel}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Appointment:</span>
          <span className="font-bold text-blue-700 text-right">{appointmentLabel}</span>
        </div>
        <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
          <span className="font-semibold text-slate-700">Estimated total:</span>
          <span className="text-blue-600 text-base font-extrabold">
            ${calculatedCost.toLocaleString()}
          </span>
        </div>
        <p className="text-[10px] text-slate-500 flex items-center gap-1 pt-1">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          No payment is taken now. You pay only after testing the repair.
        </p>
      </div>
    </div>
  );
};
