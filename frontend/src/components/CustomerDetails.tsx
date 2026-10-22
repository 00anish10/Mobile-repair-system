import React, { useState } from 'react';
import { useRepair } from '../context/RepairContext';
import { useToast } from '../hooks/useToast';
import { User, Phone, Mail } from 'lucide-react';

export const CustomerDetails: React.FC = ({
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
}) => {
  const paymentOptions = [
    { id: 'apple_pay', label: 'Apple Pay' },
    { id: 'google_pay', label: 'Google Pay' },
    { id: 'card', label: 'Debit / Credit Card' },
    { id: 'cash_on_delivery', label: 'Cash on Service' },
    { id: 'paypal', label: 'PayPal' },
  ];

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
        Customer Contact & Payment
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label htmlFor="customer-name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Your Full Name *
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="customer-name"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Anish Shrestha"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600"
            />
          </div>
          {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="customer-phone" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Phone Number (for technician call) *
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="customer-phone"
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="+977 9XX XXX XXX"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600"
            />
          </div>
          {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone}</p>}
        </div>

        <div>
          <label htmlFor="customer-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Email (for invoice & warranty) *
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="customer-email"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="your.email@domain.com"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600"
            />
          </div>
          {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
        </div>
      </div>

      {/* Payment preference */}
      <div className="sm:col-span-2 pt-2">
        <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Payment Preference (Pay ONLY after repair is done)
        </span>
        <div className="grid grid-cols-3 gap-2">
          {paymentOptions.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPaymentMethod(p.id as 'cash_on_delivery' | 'card' | 'apple_pay' | 'google_pay' | 'paypal')}
              className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                paymentMethod === p.id
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-700 border-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Order summary box */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mt-4 space-y-2 text-xs">
        <div className="flex justify-between text-slate-600">
          <span>Device:</span>
          <span className="font-bold text-slate-900">{customerName ? 'Selected Device' : '---'}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Repair:</span>
          <span className="font-bold text-slate-900">---</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Estimated Cost:</span>
          <span className="text-blue-600 text-base">$ {calculatedCost.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Appointment:</span>
          <span className="font-bold text-blue-700">---</span>
        </div>
      </div>
    </div>
  );
};