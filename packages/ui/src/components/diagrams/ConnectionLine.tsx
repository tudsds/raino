'use client';

import { cn } from '../../styles/cn';

export interface ConnectionLineProps {
  direction?: 'vertical' | 'horizontal';
  className?: string;
}

export function ConnectionLine({ direction = 'vertical', className }: ConnectionLineProps) {
  if (direction === 'horizontal') {
    return (
      <div className={cn('flex items-center justify-center w-full px-4', className)}>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#1565C0]/40 to-transparent" />
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center py-2', className)}>
      <div className="w-px h-6 bg-gradient-to-b from-[#1565C0]/40 to-[#6191D3]/20" />
      <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-[#6191D3]/40" />
    </div>
  );
}
