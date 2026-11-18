import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Check, ChevronRight, ChevronLeft, ShieldCheck } from 'lucide-react';
import { useRepair } from '../context/RepairContext';
import { useAuth } from '../context/AuthContext';
import { POPULAR_BRANDS, REPAIR_ISSUES } from '../data/mockData';
import type { DeviceType, ServiceType } from '../types';
import { DeviceBrandSelector } from './DeviceBrandSelector';
import { ProblemSelection } from './ProblemSelection';
import { ServiceTypeSelector } from './ServiceTypeSelector';
import { ServiceLocation } from './ServiceLocation';
import { Scheduling } from './Scheduling';
import { CustomerDetails } from './CustomerDetails';
import { BookingConfirmation } from './BookingConfirmation';
import { useToast } from '../hooks/useToast';
import { bookingSchema } from '../validations/bookingSchema';

type PaymentMethod = 'cash_on_delivery' | 'card' | 'apple_pay' | 'google_pay' | 'paypal';

const STEPS = ['Device', 'Problem', 'Service', 'Location', 'Schedule', 'Details'];

function localTomorrow(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const BookingModal: React.FC = () => {
  const {
    isBookingModalOpen,
    closeBookingModal,
    bookingPrefill,
    createBooking,
    userEmail,
  } = useRepair();
  const { user } = useAuth();
  const { success } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [completedBookingId, setCompletedBookingId] = useState<string | null>(null);
  const prefillAppliedRef = useRef(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const [deviceCategory, setDeviceCategory] = useState<DeviceType>('iphone');
  const [selectedBrand, setSelectedBrand] = useState('Apple');
  const [selectedModel, setSelectedModel] = useState('iPhone 15 Pro');

  const [problemId, setProblemId] = useState('screen_replacement');
  const [problemDescription, setProblemDescription] = useState('');

  const [serviceType, setServiceType] = useState<ServiceType>('home');

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Sydney');
  const [area, setArea] = useState('');
  const [landmark, setLandmark] = useState('');

  const [scheduledDate, setScheduledDate] = useState(localTomorrow);
  const [scheduledTimeSlot, setScheduledTimeSlot] = useState('11:00 AM - 01:00 PM');

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState(userEmail || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash_on_delivery');

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset the wizard whenever it is opened.
  useEffect(() => {
    if (!isBookingModalOpen) {
      prefillAppliedRef.current = false;
      return;
    }
    setCurrentStep(1);
    setCompletedBookingId(null);
    setErrors({});
    if (user) {
      setCustomerName((prev) => prev || user.name);
      setCustomerPhone((prev) => prev || user.phone);
      setCustomerEmail(user.email);
    }
  }, [isBookingModalOpen, user]);

  useEffect(() => {
    if (!bookingPrefill || prefillAppliedRef.current) return;
    prefillAppliedRef.current = true;
    if (bookingPrefill.brand) {
      setSelectedBrand(bookingPrefill.brand);
      const brand = POPULAR_BRANDS.find((b) => b.name === bookingPrefill.brand);
      if (brand) {
        setSelectedModel(bookingPrefill.model || brand.models[0]);
        setDeviceCategory(brand.category);
      }
    }
    if (bookingPrefill.problemId) setProblemId(bookingPrefill.problemId);
    if (bookingPrefill.serviceType) setServiceType(bookingPrefill.serviceType);
    if (bookingPrefill.city) setCity(bookingPrefill.city);
  }, [bookingPrefill]);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
  }, [currentStep]);

  const currentProblemObj = REPAIR_ISSUES.find((p) => p.id === problemId) || REPAIR_ISSUES[0];

  const calculatedCost = useMemo(() => {
    let price = currentProblemObj.basePriceRs;
    if (
      selectedModel.includes('Pro Max') ||
      selectedModel.includes('Ultra') ||
      selectedModel.includes('MacBook Pro')
    ) {
      price = Math.round(price * 1.6);
    } else if (
      selectedModel.includes('Pro') ||
      selectedModel.includes('Air') ||
      selectedModel.includes('XPS')
    ) {
      price = Math.round(price * 1.3);
    }
    if (serviceType === 'pickup') price += 25;
    return price;
  }, [currentProblemObj, selectedModel, serviceType]);

  const validateCurrentStep = (): boolean => {
    const errs: Record<string, string> = {};

    if (currentStep === 1) {
      if (!selectedBrand) errs.brand = 'Please choose a brand.';
      if (!selectedModel) errs.model = 'Please choose a model.';
    } else if (currentStep === 2) {
      if (!problemId) errs.problem = 'Please choose the repair issue.';
    } else if (currentStep === 4) {
      if (!address.trim()) errs.address = 'Street address is required for doorstep visit.';
      if (!city) errs.city = 'Please choose a city.';
      if (!area.trim()) errs.area = 'Suburb / area is required.';
    } else if (currentStep === 5) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (!scheduledDate) {
        errs.date = 'Please pick a date.';
      } else if (new Date(`${scheduledDate}T00:00:00`) < today) {
        errs.date = 'Please choose today or a future date.';
      }
      if (!scheduledTimeSlot) errs.time = 'Please pick an arrival time slot.';
    } else if (currentStep === 6) {
      if (customerName.trim().length < 2) errs.name = 'Please enter your full name.';
      if (!/^\+?[0-9\s\-()]{8,}$/.test(customerPhone.trim())) {
        errs.phone = 'Enter a valid Australian phone number, e.g. +61 412 345 678.';
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
        errs.email = 'Enter a valid email for your invoice and warranty.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) setCurrentStep((prev) => Math.min(prev + 1, 7));
  };

  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleConfirmBooking = () => {
    if (!validateCurrentStep()) return;

    const result = bookingSchema.safeParse({
      selectedBrand,
      selectedModel,
      problemId,
      serviceType,
      address,
      city,
      area,
      scheduledDate,
      scheduledTimeSlot,
      customerName,
      customerPhone,
      customerEmail,
      paymentMethod,
      estimatedCostRs: calculatedCost,
      photoUrls: [],
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        fieldErrors[String(issue.path[0] ?? 'form')] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    const newBooking = createBooking({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      address: address.trim(),
      city,
      area: area.trim(),
      landmark: landmark.trim(),
      deviceType: deviceCategory,
      brand: selectedBrand,
      model: selectedModel,
      problemId,
      problemTitle: currentProblemObj.name,
      problemDescription:
        problemDescription || `Issue reported: ${currentProblemObj.name} on ${selectedBrand} ${selectedModel}`,
      serviceType,
      scheduledDate,
      scheduledTimeSlot,
      estimatedCostRs: calculatedCost,
      paymentMethod,
      photoUrls: [],
      paymentStatus: 'pending',
    });

    setCompletedBookingId(newBooking.id);
    setCurrentStep(7);
    success('Booking confirmed!', {
      description: `Your reference is ${newBooking.id}. A technician has been assigned.`,
    });
  };

  if (!isBookingModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                {currentStep === 7 ? 'Booking confirmed!' : 'Book Moon Mobile Repair'}
              </h3>
            </div>
            {currentStep < 7 && (
              <p className="text-xs text-slate-500 mt-0.5">
                Step {currentStep} of 6 • Fast 2-minute booking
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={closeBookingModal}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close booking dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {currentStep < 7 && (
          <div className="px-4 sm:px-6 pt-3 pb-2 bg-white border-b border-slate-100">
            <div className="flex items-center justify-between gap-1">
              {STEPS.map((label, index) => {
                const stepNumber = index + 1;
                const isComplete = currentStep > stepNumber;
                const isCurrent = currentStep === stepNumber;
                return (
                  <div key={label} className="flex-1 flex flex-col items-center">
                    <div
                      className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center transition-all ${
                        isComplete
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-blue-600 text-white ring-2 ring-blue-600/30'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isComplete ? <Check className="w-3.5 h-3.5" /> : stepNumber}
                    </div>
                    <span
                      className={`text-[10px] mt-1 font-semibold ${
                        isCurrent ? 'text-blue-600' : isComplete ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div
          ref={contentRef}
          className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-900"
        >
          {currentStep === 1 && (
            <DeviceBrandSelector
              selectedBrand={selectedBrand}
              setSelectedBrand={setSelectedBrand}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              deviceCategory={deviceCategory}
              setDeviceCategory={setDeviceCategory}
              errors={errors}
              setErrors={setErrors}
              currentStep={currentStep}
              onNext={handleNext}
            />
          )}

          {currentStep === 2 && (
            <ProblemSelection
              problemId={problemId}
              setProblemId={setProblemId}
              problemDescription={problemDescription}
              setProblemDescription={setProblemDescription}
              errors={errors}
              setErrors={setErrors}
              currentStep={currentStep}
              onNext={handleNext}
            />
          )}

          {currentStep === 3 && (
            <ServiceTypeSelector
              serviceType={serviceType}
              setServiceType={setServiceType}
              currentStep={currentStep}
              onNext={handleNext}
            />
          )}

          {currentStep === 4 && (
            <ServiceLocation
              address={address}
              setAddress={setAddress}
              city={city}
              setCity={setCity}
              area={area}
              setArea={setArea}
              landmark={landmark}
              setLandmark={setLandmark}
              errors={errors}
              setErrors={setErrors}
              currentStep={currentStep}
              onNext={handleNext}
            />
          )}

          {currentStep === 5 && (
            <Scheduling
              scheduledDate={scheduledDate}
              setScheduledDate={setScheduledDate}
              scheduledTimeSlot={scheduledTimeSlot}
              setScheduledTimeSlot={setScheduledTimeSlot}
              errors={errors}
              setErrors={setErrors}
              currentStep={currentStep}
              onNext={handleNext}
            />
          )}

          {currentStep === 6 && (
            <CustomerDetails
              customerName={customerName}
              setCustomerName={setCustomerName}
              customerPhone={customerPhone}
              setCustomerPhone={setCustomerPhone}
              customerEmail={customerEmail}
              setCustomerEmail={setCustomerEmail}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              errors={errors}
              setErrors={setErrors}
              calculatedCost={calculatedCost}
              currentStep={currentStep}
              onNext={handleConfirmBooking}
              deviceLabel={`${selectedBrand} ${selectedModel}`}
              problemLabel={currentProblemObj.name}
              appointmentLabel={`${scheduledDate} • ${scheduledTimeSlot}`}
              serviceLabel={serviceType}
            />
          )}

          {currentStep === 7 && (
            <BookingConfirmation
              completedBookingId={completedBookingId}
              closeBookingModal={closeBookingModal}
              selectedBrand={selectedBrand}
              selectedModel={selectedModel}
              currentProblemObj={currentProblemObj}
              scheduledDate={scheduledDate}
              scheduledTimeSlot={scheduledTimeSlot}
              calculatedCost={calculatedCost}
            />
          )}
        </div>

        {currentStep < 7 && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Estimated total
                </p>
                <p className="text-xs font-bold text-slate-700 flex items-center gap-1 justify-end">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  ${calculatedCost.toLocaleString()}
                </p>
              </div>

              {currentStep < 6 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-colors cursor-pointer"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmBooking}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md transition-colors cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm booking</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
