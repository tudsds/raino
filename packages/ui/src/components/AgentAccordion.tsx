'use client';

import React, { useState, useCallback } from 'react';
import { cn } from '../styles/cn';

export interface AgentStep {
  label: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  thinking?: string;
  result?: string;
}

export interface AgentAccordionProps {
  steps: AgentStep[];
  activeStep?: number;
  onStepClick?: (index: number) => void;
}

function StatusIcon({ status }: { status: AgentStep['status'] }) {
  const baseClass = 'w-4 h-4 flex-shrink-0';

  switch (status) {
    case 'pending':
      return (
        <svg className={cn(baseClass, 'text-[#64748B]')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
    case 'running':
      return (
        <svg className={cn(baseClass, 'text-[#1565C0] animate-spin')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      );
    case 'complete':
      return (
        <svg className={cn(baseClass, 'text-[#4CAF50]')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      );
    case 'error':
      return (
        <svg className={cn(baseClass, 'text-[#EF5350]')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
  }
}

function Chevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={cn(
        'w-4 h-4 text-[#94A3B8] flex-shrink-0 transition-transform duration-300',
        expanded && 'rotate-180'
      )}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function parseInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)]+)\)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[1]) {
      parts.push(
        <code key={`code-${match.index}`} className="bg-white/[0.08] px-1.5 py-0.5 rounded text-[#6191D3] text-xs font-mono">
          {match[1]}
        </code>
      );
    } else if (match[2]) {
      parts.push(
        <strong key={`bold-${match.index}`} className="font-bold text-[#E2E8F0]">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      parts.push(
        <em key={`em-${match.index}`} className="italic text-[#94A3B8]">
          {match[3]}
        </em>
      );
    } else if (match[4] && match[5]) {
      parts.push(
        <a key={`link-${match.index}`} href={match[5]} className="text-[#6191D3] underline hover:text-[#1565C0]">
          {match[4]}
        </a>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

function SimpleMarkdown({ content }: { content: string }) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeContent = '';
  let listItems: React.ReactNode[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const flushList = () => {
    if (listItems.length === 0) return;
    const ListTag = listType === 'ol' ? 'ol' : 'ul';
    elements.push(
      <ListTag
        key={`list-${elements.length}`}
        className={cn(
          'mb-2 text-[#E2E8F0]',
          listType === 'ol' ? 'list-decimal list-inside' : 'list-disc list-inside'
        )}
      >
        {listItems}
      </ListTag>
    );
    listItems = [];
    listType = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${i}`} className="bg-white/[0.06] p-3 rounded-lg my-2 overflow-x-auto text-xs font-mono text-[#E2E8F0]">
            <code>{codeContent.slice(0, -1)}</code>
          </pre>
        );
        codeContent = '';
        inCodeBlock = false;
      } else {
        flushList();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent += line + '\n';
      continue;
    }

    const headerMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headerMatch) {
      flushList();
      const level = headerMatch[1].length;
      const text = headerMatch[2];
      const Tag = `h${level}` as keyof JSX.IntrinsicElements;
      const sizeClass = level === 1 ? 'text-lg' : level === 2 ? 'text-base' : 'text-sm';
      elements.push(
        <Tag key={`h${i}`} className={cn(sizeClass, 'font-bold text-[#E2E8F0] mt-3 mb-1')}>
          {parseInline(text)}
        </Tag>
      );
      continue;
    }

    const ulMatch = line.match(/^[-*]\s+(.+)$/);
    const olMatch = line.match(/^\d+\.\s+(.+)$/);
    if (ulMatch || olMatch) {
      const newListType = ulMatch ? 'ul' : 'ol';
      if (listType && listType !== newListType) flushList();
      listType = newListType;
      listItems.push(
        <li key={`li-${i}`} className="ml-4 mb-1">
          {parseInline((ulMatch || olMatch)![1])}
        </li>
      );
      continue;
    } else if (listItems.length > 0 && line.trim() === '') {
      flushList();
      continue;
    }

    if (line.trim() === '') {
      flushList();
      continue;
    }

    flushList();
    elements.push(
      <p key={`p-${i}`} className="text-[#E2E8F0] leading-relaxed mb-2">
        {parseInline(line)}
      </p>
    );
  }

  flushList();
  if (inCodeBlock && codeContent) {
    elements.push(
      <pre key="code-end" className="bg-white/[0.06] p-3 rounded-lg my-2 overflow-x-auto text-xs font-mono text-[#E2E8F0]">
        <code>{codeContent}</code>
      </pre>
    );
  }

  return <>{elements}</>;
}

export function AgentAccordion({ steps, activeStep, onStepClick }: AgentAccordionProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());

  const toggleStep = useCallback(
    (index: number) => {
      setExpandedSteps((prev) => {
        const next = new Set(prev);
        if (next.has(index)) {
          next.delete(index);
        } else {
          next.add(index);
        }
        return next;
      });
      onStepClick?.(index);
    },
    [onStepClick]
  );

  return (
    <div className="space-y-2 font-[family-name:var(--font-body)]">
      {steps.map((step, index) => {
        const isExpanded = expandedSteps.has(index);
        const isActive = activeStep === index;
        const isRunning = step.status === 'running';

        return (
          <div
            key={index}
            className={cn(
              'rounded-xl overflow-hidden transition-all duration-300',
              isExpanded ? 'glass-elevated' : 'glass-surface',
              isRunning && 'animate-pulse-glass'
            )}
            data-testid={`agent-step-${index}`}
            data-expanded={isExpanded}
            data-status={step.status}
          >
            <button
              onClick={() => toggleStep(index)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 text-left',
                'hover:bg-white/[0.04] transition-colors duration-300',
                isActive && 'bg-white/[0.02]'
              )}
              aria-expanded={isExpanded}
              data-testid={`agent-step-header-${index}`}
            >
              <StatusIcon status={step.status} />
              <span
                className={cn(
                  'flex-1 text-sm font-medium',
                  isRunning ? 'text-[#1565C0]' : 'text-[#E2E8F0]'
                )}
              >
                {step.label}
              </span>
              <Chevron expanded={isExpanded} />
            </button>

            <div
              className="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none"
              style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden">
                <div className="px-4 pb-4 space-y-3">
                  {step.thinking && (
                    <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
                      <p className="text-[10px] uppercase tracking-wider text-[#64748B] mb-1 font-medium">
                        Thinking
                      </p>
                      <pre className="text-xs text-[#94A3B8] font-mono whitespace-pre-wrap leading-relaxed">
                        {step.thinking}
                      </pre>
                    </div>
                  )}
                  {step.result && (
                    <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
                      <p className="text-[10px] uppercase tracking-wider text-[#64748B] mb-1 font-medium">
                        Result
                      </p>
                      <div className="text-sm">
                        <SimpleMarkdown content={step.result} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
