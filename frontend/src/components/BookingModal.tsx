import React, { useState, useEffect, useRef } from 'react';
import { X, Check, ChevronRight, ChevronLeft } from 'lucide-react';
import { useRepair } from '../context/RepairContext';
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

export const BookingModal: React.FC = () => {
  const {
    isBookingModalOpen,
    closeBookingModal,
    bookingPrefill,
    createBooking,
    setActiveTrackingId,
    setActiveView,
    userEmail,
  } = useRepair();

  // Multi-step tracker (1 to 7)
  const [currentStep, setCurrentStep] = useState(1);
  const [completedBookingId, setCompletedBookingId] = useState<string | null>(null);
  const prefillAppliedRef = useRef(false);

  // Form State
  const [deviceCategory, setDeviceCategory] = useState<DeviceType>('iphone');
  const [selectedBrand, setSelectedBrand] = useState('Apple');
  const [selectedModel, setSelectedModel] = useState('iPhone 15 Pro');

  const [problemId, setProblemId] = useState('screen_replacement');
  const [problemDescription, setProblemDescription] = useState('');

  const [serviceType, setServiceType] = useState<ServiceType>('home');

  const [address, setAddress] = useState('House 42, Sanepa Heights, Ward 2');
  const [city, setCity] = useState('Lalitpur');
  const [area, setArea] = useState('Sanepa / Jhamsikhel');
  const [landmark, setLandmark] = useState('Near British School Gate');

  // Schedule
  const [scheduledDate, setScheduledDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  });
  const [scheduledTimeSlot, setScheduledTimeSlot] = useState('11:00 AM - 01:00 PM');

  // Customer Info
  const [customerName, setCustomerName] = useState('Anish Shrestha');
  const [customerPhone, setCustomerPhone] = useState('+977 9841556677');
  const [customerEmail, setCustomerEmail] = useState(userEmail || 'anishshrestha2007@gmail.com');
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery' | 'card' | 'apple_pay' | 'google_pay' | 'paypal'>('card');

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Apply prefill if any
  useEffect(() => {
    if (!bookingPrefill || prefillAppliedRef.current) return;
    prefillAppliedRef.current = true;
    if (bookingPrefill.brand) {
      setSelectedBrand(bookingPrefill.brand);
      const bObj = POPULAR_BRANDS.find((b) => b.name === bookingPrefill.brand);
      if (bObj && bObj.models.length > 0) {
        setSelectedModel(bookingPrefill.model || bObj.models[0]);
        setDeviceCategory(bObj.category);
      }
    }
    if (bookingPrefill.problemId) {
      setProblemId(bookingPrefill.problemId);
    }
    if (bookingPrefill.serviceType) {
      setServiceType(bookingPrefill.serviceType);
    }
  }, [bookingPrefill]);

  // Reset prefill flag when modal closes
  useEffect(() => {
    if (!isBookingModalOpen) {
      prefillAppliedRef.current = false;
    }
  }, [isBookingModalOpen]);

  // Selected brand data
  const currentBrandObj = POPULAR_BRANDS.find((b) => b.name === selectedBrand) || POPULAR_BRANDS[0];
  const currentProblemObj = REPAIR_ISSUES.find((p) => p.id === problemId) || REPAIR_ISSUES[0];

  // Calculate pricing
  const calculatedCost = useMemo(() => {
    let price = currentProblemObj.basePriceRs;
    if (selectedModel.includes('Pro Max') || selectedModel.includes('Ultra') || selectedModel.includes('MacBook Pro')) {
      price = Math.round(price * 1.6);
    } else if (selectedModel.includes('Pro') || selectedModel.includes('Air') || selectedModel.includes('XPS')) {
      price = Math.round(price * 1.3);
    }
    if (serviceType === 'pickup') {
      price += 25; // nominal courier insurance
    }
    return price;
  }, [currentProblemObj, selectedModel, serviceType]);

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 7));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const validateCurrentStep = (): boolean => {
    const errs: Record<string, string> = {};

    if (currentStep === 1) {
      if (!selectedBrand) errs.brand = 'Please choose a brand.';
      if (!selectedModel) errs.model = 'Please choose a model.';
    } else if (currentStep === 2) {
      if (!problemId) errs.problem = 'Please choose the repair issue.';
    } else if (currentStep === 4) {
      if (!address.trim()) errs.address = 'Street address is required for doorstep visit.';
      if (!city) errs.city = 'Please choose city.';
      if (!area.trim()) errs.area = 'Area/neighborhood is required.';
    } else if (currentStep === 5) {
      if (!scheduledDate) errs.date = 'Please pick a date.';
      if (!scheduledTimeSlot) errs.time = 'Please pick an arrival time slot.';
    } else if (currentStep === 6) {
      if (!customerName.trim()) errs.name = 'Full name is required.';
      if (!customerPhone.trim() || customerPhone.trim().length < 8) errs.phone = 'Valid phone number is required for the technician to reach you.';
      if (!customerEmail.trim() || !customerEmail.includes('@')) errs.email = 'Valid email is required for the booking confirmation.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleConfirmBooking = () => {
    if (!validateCurrentStep()) return;

    const newBooking = createBooking({
      customerName,
      customerPhone,
      customerEmail,
      address,
      city,
      area,
      landmark,
      deviceType: deviceCategory,
      brand: selectedBrand,
      model: selectedModel,
      problemId,
      problemTitle: currentProblemObj.name,
      problemDescription: problemDescription || `Issue reported: ${currentProblemObj.name} on ${selectedBrand} ${selectedModel}`,
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
  };

  const handleViewTracking = () => {
    if (completedBookingId) {
      setActiveTrackingId(completedBookingId);
      closeBookingModal();
      setActiveView('track');
    }
  };

  if (!isBookingModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                {currentStep === 7 ? 'Booking Confirmed!' : 'Book Moon Mobile Repair'}
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
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Bar */}
        {currentStep < 7 && (
          <div className="px-6 pt-3 pb-2 bg-white border-b border-slate-100">
            <div className="flex items-center justify-between gap-1">
              <div className="flex-1 flex flex-col items-center">
                <div className="w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center transition-all bg-blue-600 text-white ring-2 ring-blue-600/30">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] mt-1 font-semibold text-blue-600">Device</span>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <div className="w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center bg-emerald-600 text-white">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] mt-1 font-semibold text-emerald-600">Problem</span>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <div className="w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center bg-slate-100 text-slate-400">
                  3
                </div>
                <span className="text-[10px] mt-1 font-semibold text-slate-400">Service</span>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <div className="w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center bg-slate-100 text-slate-400">
                  4
                </div>
                <span className="text-[10px] mt-1 font-semibold text-slate-400">Location</span>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <div className="w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center bg-slate-100 text-slate-400">
                  5
                </div>
                <span className="text-[10px] mt-1 font-semibold text-slate-400">Schedule</span>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <div className="w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center bg-slate-100 text-slate-400">
                  6
                </div>
                <span className="text-[10px] mt-1 font-semibold text-slate-400">Details</span>
              </div>
            </div>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-900">
          {/* STEP 1: DEVICE */}
          {currentStep === 1 && <DeviceBrandSelector selectedBrand={selectedBrand} setSelectedBrand={setSelectedBrand} selectedModel={selectedModel} setSelectedModel={setSelectedModel} deviceCategory={deviceCategory} setDeviceCategory={setDeviceCategory} errors={errors} setErrors={setErrors} currentStep={currentStep} onNext={handleNext} />}

          {/* STEP 2: PROBLEM */}
          {currentStep === 2 && <ProblemSelection problemId={problemId} setProblemId={setProblemId} problemDescription={problemDescription} setProblemDescription={setProblemDescription} errors={errors} setErrors={setErrors} currentStep={currentStep} onNext={handleNext} />}

          {/* STEP 3: SERVICE TYPE */}
          {currentStep === 3 && <ServiceTypeSelector serviceType={serviceType} setServiceType={setServiceType} currentStep={currentStep} onNext={handleNext} />}

          {/* STEP 4: LOCATION */}
          {currentStep === 4 && <ServiceLocation address={address} setAddress={setAddress} city={city} setCity={setCity} area={area} setArea={setArea} landmark={landmark} setLandmark={setLandmark} errors={errors} setErrors={setErrors} currentStep={currentStep} onNext={handleNext} />}

          {/* STEP 5: SCHEDULE */}
          {currentStep === 5 && <Scheduling scheduledDate={scheduledDate} setScheduledDate={setScheduledDate} scheduledTimeSlot={scheduledTimeSlot} setScheduledTimeSlot={setScheduledTimeSlot} errors={errors} setErrors={setErrors} currentStep={currentStep} onNext={handleNext} />}

          {/* STEP 6: CUSTOMER DETAILS */}
          {currentStep === 6 && <CustomerDetails customerName={customerName} setCustomerName={setCustomerName} customerPhone={customerPhone} setCustomerPhone={setCustomerPhone} customerEmail={customerEmail} setCustomerEmail={setCustomerEmail} paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} errors={errors} setErrors={setErrors} calculatedCost={calculatedCost} currentStep={currentStep} onNext={handleConfirmBooking} />}

          {/* STEP 7: CONFIRMATION */}
          {currentStep === 7 && <BookingConfirmation completedBookingId={completedBookingId} setCompletedBookingId={setCompletedBookingId} setCurrentStep={setCurrentStep} closeBookingModal={closeBookingModal} setActiveView={setActiveView} deviceCategory={deviceCategory} selectedBrand={selectedBrand} selectedModel={selectedModel} currentProblemObj={currentProblemObj} scheduledDate={scheduledDate} scheduledTimeSlot={scheduledTimeSlot} calculatedCost={calculatedCost} />}
        </div>

        {/* Modal Footer Controls */}
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
              <span className="text-xs font-bold text-slate-700 hidden sm:inline">
                Est. $ {calculatedCost.toLocaleString()}
              </span>

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
                  <span>Confirm Booking</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};