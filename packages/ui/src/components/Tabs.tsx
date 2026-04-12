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
          'flex border-b-2',
          variant === 'neon' ? 'border-[#00f0ff]/30' : 'border-[#27272a]',
        )}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                'relative px-4 py-3 text-base font-[family-name:var(--font-heading)] uppercase tracking-wider transition-all duration-100',
                isActive
                  ? variant === 'neon'
                    ? 'text-[#00f0ff]'
                    : 'text-[#e4e4e7]'
                  : 'text-[#71717a] hover:text-[#a1a1aa]',
              )}
              style={{ fontSize: '0.6rem' }}
            >
              {tab.label}
              {isActive && (
                <span
                  className={cn(
                    'absolute bottom-0 left-0 right-0 h-1',
                    variant === 'neon'
                      ? 'bg-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.8)]'
                      : 'bg-[#00f0ff]',
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
