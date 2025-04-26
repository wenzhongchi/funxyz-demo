'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// Toast type definition
export interface ToastProps {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

// Toast context type
interface ToastContextType {
  toast: (props: ToastProps) => void;
}

// Create Toast context
const ToastContext = createContext<ToastContextType>({
  toast: () => {},
});

// Provide Toast Hook
export const useToast = () => useContext(ToastContext);

// Client-side only toast container component
const ToastContainer = ({ toasts }: { toasts: (ToastProps & { id: number })[] }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-md shadow-md transition-all ${
            toast.variant === 'destructive' ? 'bg-red-500 text-white' : 'bg-white text-black'
          }`}
        >
          <h3 className="font-semibold">{toast.title}</h3>
          {toast.description && <p className="text-sm mt-1">{toast.description}</p>}
        </div>
      ))}
    </div>,
    document.body
  );
};

// Toast provider component
export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<(ToastProps & { id: number })[]>([]);
  const nextIdRef = useRef(0);

  // Add Toast
  const addToast = useCallback((props: ToastProps) => {
    const id = ++nextIdRef.current;
    setToasts((prev) => [...prev, { ...props, id }]);

    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  );
};
