'use client';

import React, { useState } from 'react';
import { cn } from '../styles/cn';

export interface TabsProps {
  tabs: Array<{ id: string; label: string; content: React.ReactNode }>;
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'default' | 'neon';
}

export function Tabs({ tabs, defaultTab, onChange, variant = 'default' }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className="w-full">
      <div
        className={cn(
          'flex border-b',
          variant === 'neon' ? 'border-[#1565C0]/30' : 'border-white/[0.12]',
        )}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                'relative px-4 py-3 text-base font-[family-name:var(--font-heading)] uppercase tracking-wider transition-all duration-300',
                isActive
                  ? variant === 'neon'
                    ? 'text-[#1565C0]'
                    : 'text-[#E2E8F0]'
                  : 'text-[#64748B] hover:text-[#94A3B8]',
              )}
              style={{ fontSize: '0.6rem' }}
            >
              {tab.label}
              {isActive && (
                <span
                  className={cn(
                    'absolute bottom-0 left-0 right-0 h-0.5 rounded-full',
                    variant === 'neon'
                      ? 'bg-[#1565C0]'
                      : 'bg-[#1565C0]',
                  )}
                />
              )}
            </button>
          );
        })}
      </div>
      <div className="pt-4">{activeContent}</div>
    </div>
  );
}
