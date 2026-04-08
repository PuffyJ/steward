'use client';

import { ReactNode, useEffect } from 'react';

type Props = {
  children: ReactNode;
  onClose: () => void;
  title: string;
  subtitle?: string;
};

export function Modal({ children, onClose, title, subtitle }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl p-7 max-w-xl w-full max-h-[85vh] overflow-y-auto fade-in shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-0.5">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mb-5">{subtitle}</p>}
        {!subtitle && <div className="mb-5" />}
        {children}
      </div>
    </div>
  );
}
