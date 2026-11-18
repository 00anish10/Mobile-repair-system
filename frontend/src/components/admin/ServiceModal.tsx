import React, { useEffect, useState } from 'react';
import {
  DollarSign,
  Loader2,
  Save,
  Trash2,
  AlertTriangle,
  ShieldCheck,
  Plus,
  X,
  Smartphone,
  Apple,
  Cpu,
  Tablet,
  Laptop,
  BatteryCharging,
  Monitor,
  PlugZap,
  Droplets,
  Sliders,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useRepair } from '../../context/RepairContext';
import { useToast } from '../../hooks/useToast';
import type { ServiceCategory, ServiceCategoryInput } from '../../types';
import { AdminModalShell } from './AdminModalShell';

interface ServiceModalProps {
  open: boolean;
  service: ServiceCategory | null;
  onClose: () => void;
}

type FieldErrors = Partial<Record<'title' | 'description' | 'price' | 'warranty', string>>;

const fieldClass =
  'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20';

const SERVICE_ICONS = [
  { name: 'Smartphone', Icon: Smartphone },
  { name: 'Apple', Icon: Apple },
  { name: 'Cpu', Icon: Cpu },
  { name: 'Tablet', Icon: Tablet },
  { name: 'Laptop', Icon: Laptop },
  { name: 'BatteryCharging', Icon: BatteryCharging },
  { name: 'Monitor', Icon: Monitor },
  { name: 'PlugZap', Icon: PlugZap },
  { name: 'Droplets', Icon: Droplets },
  { name: 'Sliders', Icon: Sliders },
];

function ServiceIcon({ name, className }: { name: string; className?: string }) {
  const match = SERVICE_ICONS.find((item) => item.name === name);
  const Icon = match?.Icon || Smartphone;
  return <Icon className={className} />;
}

const emptyForm = {
  title: '',
  icon: 'Smartphone',
  description: '',
  startingPriceRs: '99',
  warrantyText: '',
  popularModels: [] as string[],
  isActive: true,
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

export const ServiceModal: React.FC<ServiceModalProps> = ({ open, service, onClose }) => {
  const { addService, updateService, deleteService } = useRepair();
  const { success, error: toastError } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [modelDraft, setModelDraft] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setFormError('');
    setModelDraft('');
    setConfirmDelete(false);
    if (service) {
      setForm({
        title: service.title,
        icon: service.icon,
        description: service.description,
        startingPriceRs: String(service.startingPriceRs),
        warrantyText: service.warrantyText,
        popularModels: service.popularModels,
        isActive: service.isActive !== false,
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, service]);

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormError('');
  };

  const addModel = () => {
    const value = modelDraft.trim().replace(/,+$/, '').trim();
    if (!value) return;
    setForm((prev) =>
      prev.popularModels.some((item) => item.toLowerCase() === value.toLowerCase())
        ? prev
        : { ...prev, popularModels: [...prev.popularModels, value] }
    );
    setModelDraft('');
  };

  const removeModel = (value: string) => {
    setForm((prev) => ({
      ...prev,
      popularModels: prev.popularModels.filter((item) => item !== value),
    }));
  };

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (form.title.trim().length < 2) next.title = 'Enter a service name.';
    if (form.description.trim().length < 10) {
      next.description = 'Add a description of at least 10 characters.';
    }
    const price = Number(form.startingPriceRs);
    if (Number.isNaN(price) || price < 0) next.price = 'Enter a valid price.';
    if (form.warrantyText.trim().length < 2) next.warranty = 'Enter the warranty details.';
    return next;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError('');
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const input: ServiceCategoryInput = {
      title: form.title.trim(),
      icon: form.icon,
      description: form.description.trim(),
      startingPriceRs: Math.max(0, Math.round(Number(form.startingPriceRs) || 0)),
      warrantyText: form.warrantyText.trim(),
      popularModels: form.popularModels,
      isActive: form.isActive,
    };

    setSaving(true);
    try {
      if (service) {
        await updateService(service.id, input);
        success('Service updated', { description: `${input.title} has been saved.` });
      } else {
        await addService(input);
        success('Service added', {
          description: `${input.title} is now available for customers.`,
        });
      }
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not save the service.';
      setFormError(message);
      toastError('Save failed', { description: message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!service) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setDeleting(true);
    try {
      await deleteService(service.id);
      success('Service removed', { description: `${service.title} was deleted.` });
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not delete the service.';
      setFormError(message);
      toastError('Delete failed', { description: message });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminModalShell
      open={open}
      title={service ? 'Edit service' : 'Add service'}
      description={
        service
          ? 'Update pricing, warranty, and how this service appears to customers.'
          : 'Create a new repair category for the customer catalog.'
      }
      icon={<DollarSign className="h-5 w-5" />}
      accent="emerald"
      onClose={onClose}
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {service && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || saving}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  confirmDelete
                    ? 'bg-rose-600 text-white hover:bg-rose-700'
                    : 'text-rose-600 hover:bg-rose-50'
                }`}
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                {confirmDelete ? 'Confirm delete' : 'Delete'}
              </button>
            )}
          </div>
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
              form="service-form"
              disabled={saving || deleting}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400 sm:flex-none"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? 'Saving...' : service ? 'Save changes' : 'Add service'}
            </button>
          </div>
        </div>
      }
    >
      <form id="service-form" onSubmit={handleSubmit}>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="space-y-5">
            <section className="space-y-4 rounded-2xl border border-slate-200 p-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Service details
              </h3>
              <Field label="Service name *" htmlFor="service-title" error={errors.title}>
                <input
                  id="service-title"
                  value={form.title}
                  onChange={(event) => update('title', event.target.value)}
                  className={fieldClass}
                  placeholder="Smartwatch Repair"
                />
              </Field>
              <div>
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Icon
                </span>
                <div className="grid grid-cols-5 gap-2">
                  {SERVICE_ICONS.map(({ name, Icon }) => {
                    const selected = form.icon === name;
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => update('icon', name)}
                        title={name}
                        aria-pressed={selected}
                        className={`flex flex-col items-center gap-1 rounded-xl border px-1 py-2 transition ${
                          selected
                            ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="w-full truncate text-[9px] font-bold">{name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <Field
                label="Description *"
                htmlFor="service-description"
                error={errors.description}
              >
                <textarea
                  id="service-description"
                  rows={3}
                  value={form.description}
                  onChange={(event) => update('description', event.target.value)}
                  className={fieldClass}
                  placeholder="What does this service cover?"
                />
              </Field>
            </section>

            <section className="space-y-4 rounded-2xl border border-slate-200 p-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Pricing & warranty
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Starting price *" htmlFor="service-price" error={errors.price}>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                      $
                    </span>
                    <input
                      id="service-price"
                      type="number"
                      min="0"
                      step="1"
                      value={form.startingPriceRs}
                      onChange={(event) => update('startingPriceRs', event.target.value)}
                      className={`${fieldClass} pl-10`}
                    />
                  </div>
                </Field>
                <Field label="Warranty *" htmlFor="service-warranty" error={errors.warranty}>
                  <input
                    id="service-warranty"
                    value={form.warrantyText}
                    onChange={(event) => update('warrantyText', event.target.value)}
                    className={fieldClass}
                    placeholder="6-Month Warranty"
                  />
                </Field>
              </div>
              <div>
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Popular models
                </span>
                <div className="flex gap-2">
                  <input
                    value={modelDraft}
                    onChange={(event) => setModelDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ',') {
                        event.preventDefault();
                        addModel();
                      }
                    }}
                    className={fieldClass}
                    placeholder="iPhone, Galaxy S24, Pixel"
                  />
                  <button
                    type="button"
                    onClick={addModel}
                    disabled={!modelDraft.trim()}
                    className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" /> Add
                  </button>
                </div>
                <div className="mt-2 flex min-h-7 flex-wrap gap-1.5">
                  {form.popularModels.length === 0 ? (
                    <span className="text-[11px] text-slate-400">
                      Optional — add devices customers commonly book.
                    </span>
                  ) : (
                    form.popularModels.map((model) => (
                      <span
                        key={model}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600"
                      >
                        {model}
                        <button
                          type="button"
                          onClick={() => removeModel(model)}
                          className="rounded-full p-0.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                          aria-label={`Remove ${model}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            </section>

            <section className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                {form.isActive ? (
                  <Eye className="h-5 w-5 text-emerald-600" />
                ) : (
                  <EyeOff className="h-5 w-5 text-slate-400" />
                )}
                <div>
                  <p className="text-sm font-bold text-slate-900">Visible to customers</p>
                  <p className="text-[11px] text-slate-500">
                    {form.isActive
                      ? 'This service appears in the public catalog.'
                      : 'Hidden services cannot be booked.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={form.isActive}
                aria-label="Toggle service visibility"
                onClick={() => update('isActive', !form.isActive)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                  form.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                    form.isActive ? 'left-[22px]' : 'left-0.5'
                  }`}
                />
              </button>
            </section>
          </div>

          <aside className="space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Customer preview
            </p>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-blue-500" />
              <div className="space-y-3 p-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <ServiceIcon name={form.icon} className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold leading-snug text-slate-900">
                    {form.title.trim() || 'Service name'}
                  </h4>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                    {form.description.trim() || 'Your service description will appear here.'}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Starting from
                  </p>
                  <p className="text-base font-black text-slate-900">
                    ${(Number(form.startingPriceRs) || 0).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-start gap-1.5 text-[11px] font-semibold text-emerald-700">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {form.warrantyText.trim() || 'Warranty details'}
                </div>
                {!form.isActive && (
                  <div className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-center text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Hidden from catalog
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>

        {formError && (
          <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-semibold text-rose-700">
            {formError}
          </p>
        )}

        {service && confirmDelete && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Delete <strong>{service.title}</strong> permanently? This cannot be undone.
            </span>
          </div>
        )}
      </form>
    </AdminModalShell>
  );
};
