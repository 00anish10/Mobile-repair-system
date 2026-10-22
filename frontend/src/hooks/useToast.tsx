'use client';

import { Toaster, toast } from 'sonner';
import type { ReactNode } from 'react';

interface ToastProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProps) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          classNames: {
            toast: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg',
            description: 'text-slate-600 dark:text-slate-400',
            actionButton: 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600',
            cancelButton: 'text-slate-500 dark:text-slate-400',
          },
          style: {
            borderRadius: '0.75rem',
            padding: '1rem',
          },
        }}
        closeButton={true}
        expand={true}
        richColors={true}
      />
    </>
  );
}

export { toast };

type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading';

interface CustomToastOptions {
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

export function useToast() {
  const showToast = (type: ToastType, message: string, options?: CustomToastOptions) => {
    const toastFn = toast[type];
    return toastFn(message, {
      description: options?.description,
      action: options?.action,
      duration: options?.duration,
    });
  };

  const dismiss = (toastId?: string | number) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  };

  return {
    success: (message: string, options?: CustomToastOptions) => showToast('success', message, options),
    error: (message: string, options?: CustomToastOptions) => showToast('error', message, options),
    info: (message: string, options?: CustomToastOptions) => showToast('info', message, options),
    warning: (message: string, options?: CustomToastOptions) => showToast('warning', message, options),
    loading: (message: string, options?: CustomToastOptions) => showToast('loading', message, options),
    promise: <T,>(promise: Promise<T>, messages: { loading: string; success: string | ((data: T) => string); error: string | ((err: Error) => string) }) => {
      return toast.promise(promise, messages);
    },
    dismiss,
  };
}