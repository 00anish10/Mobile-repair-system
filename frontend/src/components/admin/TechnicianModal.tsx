import React, { useEffect, useState } from 'react';
import {
  Wrench,
  User,
  Phone,
  Mail,
  Car,
  Award,
  Star,
  MapPin,
  Tag,
  Plus,
  X,
  Loader2,
  Save,
  Image as ImageIcon,
} from 'lucide-react';
import { useRepair } from '../../context/RepairContext';
import { useToast } from '../../hooks/useToast';
import { SERVICE_AREAS } from '../../data/mockData';
import type { Technician, TechnicianInput } from '../../types';
import { AdminModalShell } from './AdminModalShell';

interface TechnicianModalProps {
  open: boolean;
  technician: Technician | null;
  onClose: () => void;
}

type FieldErrors = Partial<
  Record<'name' | 'phone' | 'email' | 'photoUrl' | 'experience' | 'rating' | 'areas', string>
>;

const fieldClass =
  'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';

const statusOptions: Array<{
  value: TechnicianInput['status'];
  label: string;
  activeClass: string;
  dotClass: string;
}> = [
  {
    value: 'available',
    label: 'Available',
    activeClass: 'border-emerald-300 bg-emerald-50 text-emerald-800',
    dotClass: 'bg-emerald-500',
  },
  {
    value: 'on_job',
    label: 'On a job',
    activeClass: 'border-amber-300 bg-amber-50 text-amber-800',
    dotClass: 'bg-amber-500',
  },
  {
    value: 'offline',
    label: 'Offline',
    activeClass: 'border-slate-300 bg-slate-100 text-slate-700',
    dotClass: 'bg-slate-400',
  },
];

const emptyForm = {
  name: '',
  phone: '',
  email: '',
  vehicle: '',
  licensePlate: '',
  experienceYears: '2',
  rating: '5',
  status: 'available' as TechnicianInput['status'],
  specialties: [] as string[],
  photoUrl: '',
  activeAreas: [] as string[],
};

const Field: React.FC<{
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}> = ({ label, htmlFor, hint, error, children }) => (
  <div>
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600"
    >
      {label}
    </label>
    {children}
    {error ? (
      <p className="mt-1 text-[11px] font-semibold text-rose-600">{error}</p>
    ) : hint ? (
      <p className="mt-1 text-[11px] text-slate-400">{hint}</p>
    ) : null}
  </div>
);

export const TechnicianModal: React.FC<TechnicianModalProps> = ({
  open,
  technician,
  onClose,
}) => {
  const { addTechnician, updateTechnician } = useRepair();
  const { success, error: toastError } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [specialtyDraft, setSpecialtyDraft] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setFormError('');
    setSpecialtyDraft('');
    if (technician) {
      setForm({
        name: technician.name,
        phone: technician.phone,
        email: technician.email,
        vehicle: technician.vehicle,
        licensePlate: technician.licensePlate,
        experienceYears: String(technician.experienceYears),
        rating: String(technician.rating),
        status: technician.status,
        specialties: technician.specialties,
        photoUrl: technician.photoUrl,
        activeAreas: technician.activeAreas,
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, technician]);

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormError('');
  };

  const addSpecialty = () => {
    const value = specialtyDraft.trim().replace(/,+$/, '').trim();
    if (!value) return;
    setForm((prev) =>
      prev.specialties.some((item) => item.toLowerCase() === value.toLowerCase())
        ? prev
        : { ...prev, specialties: [...prev.specialties, value] }
    );
    setSpecialtyDraft('');
  };

  const removeSpecialty = (value: string) => {
    setForm((prev) => ({
      ...prev,
      specialties: prev.specialties.filter((item) => item !== value),
    }));
  };

  const toggleArea = (city: string) => {
    setForm((prev) => ({
      ...prev,
      activeAreas: prev.activeAreas.includes(city)
        ? prev.activeAreas.filter((area) => area !== city)
        : [...prev.activeAreas, city],
    }));
    setErrors((prev) => ({ ...prev, areas: undefined }));
  };

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (form.name.trim().length < 2) next.name = 'Enter the technician name.';
    if (form.phone.replace(/\D/g, '').length < 8) next.phone = 'Enter a valid phone number.';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = 'Enter a valid email or leave it blank.';
    }
    if (form.photoUrl && !/^https?:\/\/\S+$/i.test(form.photoUrl.trim())) {
      next.photoUrl = 'Use a full http:// or https:// image URL.';
    }
    if (Number(form.experienceYears) < 0 || Number(form.experienceYears) > 60) {
      next.experience = 'Enter a value between 0 and 60.';
    }
    if (Number(form.rating) < 0 || Number(form.rating) > 5) {
      next.rating = 'Rating must be between 0 and 5.';
    }
    if (form.activeAreas.length === 0) next.areas = 'Select at least one service area.';
    return next;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError('');
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const input: TechnicianInput = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      photoUrl: form.photoUrl.trim() || undefined,
      rating: Math.min(5, Math.max(0, Number(form.rating) || 5)),
      experienceYears: Math.max(0, Math.round(Number(form.experienceYears) || 0)),
      vehicle: form.vehicle.trim(),
      licensePlate: form.licensePlate.trim(),
      activeAreas: form.activeAreas,
      status: form.status,
      specialties: form.specialties,
    };

    setSaving(true);
    try {
      if (technician) {
        await updateTechnician(technician.id, input);
        success('Technician updated', { description: `${input.name} has been saved.` });
      } else {
        await addTechnician(input);
        success('Technician added', {
          description: `${input.name} is ready for dispatch.`,
        });
      }
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not save the technician.';
      setFormError(message);
      toastError('Save failed', { description: message });
    } finally {
      setSaving(false);
    }
  };

  const initials = form.name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <AdminModalShell
      open={open}
      title={technician ? 'Edit technician' : 'Add technician'}
      description={
        technician
          ? 'Update fleet details, availability, and coverage.'
          : 'Create a technician profile for dispatch and tracking.'
      }
      icon={<Wrench className="h-5 w-5" />}
      accent="blue"
      onClose={onClose}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-slate-500">
            <span className="text-rose-500">*</span> Required fields
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 sm:flex-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="technician-form"
              disabled={saving}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400 sm:flex-none"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? 'Saving...' : technician ? 'Save changes' : 'Add technician'}
            </button>
          </div>
        </div>
      }
    >
      <form id="technician-form" onSubmit={handleSubmit} className="space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-blue-600 text-xl font-black text-white ring-4 ring-white shadow-sm">
              <span>{initials || 'T'}</span>
              {form.photoUrl && (
                <img
                  src={form.photoUrl}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                  }}
                />
              )}
            </div>
            <div className="grid flex-1 gap-4 sm:grid-cols-2">
              <Field label="Full name *" htmlFor="tech-name" error={errors.name}>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="tech-name"
                    value={form.name}
                    onChange={(event) => update('name', event.target.value)}
                    className={`${fieldClass} pl-9`}
                    placeholder="Bikram Shrestha"
                  />
                </div>
              </Field>
              <Field label="Phone *" htmlFor="tech-phone" error={errors.phone}>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="tech-phone"
                    type="tel"
                    value={form.phone}
                    onChange={(event) => update('phone', event.target.value)}
                    className={`${fieldClass} pl-9`}
                    placeholder="+61 4XX XXX XXX"
                  />
                </div>
              </Field>
            </div>
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-2">
          <section className="space-y-4 rounded-2xl border border-slate-200 p-4">
            <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">
              <Award className="h-4 w-4 text-blue-500" /> Dispatch details
            </h3>
            <Field label="Email" htmlFor="tech-email" error={errors.email}>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="tech-email"
                  type="email"
                  value={form.email}
                  onChange={(event) => update('email', event.target.value)}
                  className={`${fieldClass} pl-9`}
                  placeholder="technician@moonmobilerepair.com"
                />
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Experience" htmlFor="tech-experience" error={errors.experience}>
                <div className="relative">
                  <input
                    id="tech-experience"
                    type="number"
                    min="0"
                    max="60"
                    step="1"
                    value={form.experienceYears}
                    onChange={(event) => update('experienceYears', event.target.value)}
                    className={`${fieldClass} pr-12`}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                    years
                  </span>
                </div>
              </Field>
              <Field label="Rating" htmlFor="tech-rating" error={errors.rating}>
                <div className="relative">
                  <Star className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-400" />
                  <input
                    id="tech-rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={form.rating}
                    onChange={(event) => update('rating', event.target.value)}
                    className={`${fieldClass} pl-9`}
                  />
                </div>
              </Field>
            </div>
            <Field label="Vehicle" htmlFor="tech-vehicle">
              <div className="relative">
                <Car className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="tech-vehicle"
                  value={form.vehicle}
                  onChange={(event) => update('vehicle', event.target.value)}
                  className={`${fieldClass} pl-9`}
                  placeholder="Mobile Lab Van #06"
                />
              </div>
            </Field>
            <Field label="License plate" htmlFor="tech-plate">
              <input
                id="tech-plate"
                value={form.licensePlate}
                onChange={(event) => update('licensePlate', event.target.value)}
                className={fieldClass}
                placeholder="BA 6 PA 6206"
              />
            </Field>
          </section>

          <section className="space-y-4 rounded-2xl border border-slate-200 p-4">
            <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">
              <MapPin className="h-4 w-4 text-blue-500" /> Availability & photo
            </h3>
            <Field label="Status">
              <div className="grid grid-cols-3 gap-2">
                {statusOptions.map((option) => {
                  const selected = form.status === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => update('status', option.value)}
                      className={`flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-[11px] font-bold transition ${
                        selected
                          ? option.activeClass
                          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${option.dotClass}`} />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </Field>
            <Field
              label="Photo URL"
              htmlFor="tech-photo"
              error={errors.photoUrl}
              hint="Leave blank to use the technician's initials."
            >
              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="tech-photo"
                  type="url"
                  value={form.photoUrl}
                  onChange={(event) => update('photoUrl', event.target.value)}
                  className={`${fieldClass} pl-9`}
                  placeholder="https://..."
                />
              </div>
            </Field>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] font-semibold text-slate-500">
                {form.activeAreas.length > 0
                  ? `Covers ${form.activeAreas.length} area${form.activeAreas.length === 1 ? '' : 's'}`
                  : 'No coverage areas selected'}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {form.activeAreas.length === 0 ? (
                  <span className="text-[11px] text-slate-400">
                    Select areas from the coverage section below.
                  </span>
                ) : (
                  form.activeAreas.map((area) => (
                    <span
                      key={area}
                      className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700"
                    >
                      {area}
                    </span>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>

        <section className="space-y-4 rounded-2xl border border-slate-200 p-4">
          <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">
            <Tag className="h-4 w-4 text-blue-500" /> Specialties
          </h3>
          <div className="flex gap-2">
            <input
              value={specialtyDraft}
              onChange={(event) => setSpecialtyDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ',') {
                  event.preventDefault();
                  addSpecialty();
                }
              }}
              className={fieldClass}
              placeholder="Screen repair, battery replacement, micro-soldering..."
            />
            <button
              type="button"
              onClick={addSpecialty}
              disabled={!specialtyDraft.trim()}
              className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
          <div className="flex min-h-8 flex-wrap gap-1.5">
            {form.specialties.length === 0 ? (
              <span className="text-[11px] text-slate-400">
                Add specialties so dispatchers know who to assign.
              </span>
            ) : (
              form.specialties.map((specialty) => (
                <span
                  key={specialty}
                  className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700"
                >
                  {specialty}
                  <button
                    type="button"
                    onClick={() => removeSpecialty(specialty)}
                    className="rounded-full p-0.5 text-blue-400 transition hover:bg-blue-100 hover:text-blue-700"
                    aria-label={`Remove ${specialty}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))
            )}
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">
              <MapPin className="h-4 w-4 text-blue-500" /> Service coverage *
            </h3>
            <button
              type="button"
              onClick={() =>
                update(
                  'activeAreas',
                  form.activeAreas.length === SERVICE_AREAS.length
                    ? []
                    : SERVICE_AREAS.map((area) => area.city)
                )
              }
              className="text-[11px] font-bold text-blue-600 hover:underline"
            >
              {form.activeAreas.length === SERVICE_AREAS.length ? 'Clear all' : 'Select all'}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {SERVICE_AREAS.map((area) => {
              const checked = form.activeAreas.includes(area.city);
              return (
                <button
                  key={area.city}
                  type="button"
                  onClick={() => toggleArea(area.city)}
                  aria-pressed={checked}
                  className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition ${
                    checked
                      ? 'border-blue-400 bg-blue-50 text-blue-800'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span>{area.city}</span>
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[9px] font-black ${
                      checked
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-300 text-transparent'
                    }`}
                  >
                    ✓
                  </span>
                </button>
              );
            })}
          </div>
          {errors.areas && (
            <p className="text-[11px] font-semibold text-rose-600">{errors.areas}</p>
          )}
        </section>

        {formError && (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-semibold text-rose-700">
            {formError}
          </p>
        )}
      </form>
    </AdminModalShell>
  );
};
