import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface AdminModalShellProps {
  open: boolean;
  title: string;
  description: string;
  icon: React.ReactNode;
  accent: 'blue' | 'emerald';
  onClose: () => void;
  footer: React.ReactNode;
  children: React.ReactNode;
}

export const AdminModalShell: React.FC<AdminModalShellProps> = ({
  open,
  title,
  description,
  icon,
  accent,
  onClose,
  footer,
  children,
}) => {
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const accentClasses =
    accent === 'blue'
      ? 'bg-blue-50 text-blue-600 ring-blue-100'
      : 'bg-emerald-50 text-emerald-600 ring-emerald-100';

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
        className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-2xl sm:rounded-3xl"
      >
        <div className="relative border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-4 ${accentClasses}`}
              >
                {icon}
              </div>
              <div>
                <h2
                  id="admin-modal-title"
                  className="text-lg font-extrabold tracking-tight text-slate-900"
                >
                  {title}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">{description}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>

        <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 sm:px-6">{footer}</div>
      </div>
    </div>,
    document.body
  );
};
