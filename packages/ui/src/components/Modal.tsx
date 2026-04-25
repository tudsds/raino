'use client';

import React, { useEffect } from 'react';
import { cn } from '../styles/cn';
import { Button } from './Button';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const sizeStyles = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div
        className={cn(
          'relative w-full mx-4 bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.20)] rounded-2xl',
          sizeStyles[size],
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.12]">
          <h2
            className="text-base font-[family-name:var(--font-heading)] text-[#E2E8F0] uppercase tracking-wider"
            style={{ fontSize: '0.7rem' }}
          >
            {title}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        </div>

        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
}
