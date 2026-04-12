import { ReactNode } from 'react';

interface NeonButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  className?: string;
  disabled?: boolean;
}

export default function NeonButton({
  children,
  onClick,
  variant = 'primary',
  className = '',
  disabled = false,
}: NeonButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 px-6 py-3 font-[family-name:var(--font-body)] text-lg transition-all duration-100';

  const variants = {
    primary: `
      bg-transparent border-2 border-[#00f0ff] text-[#00f0ff]
      hover:bg-[#00f0ff] hover:text-[#0a0a0f]
      hover:shadow-[0_0_0_2px_rgba(0,240,255,0.3),0_0_10px_rgba(0,240,255,0.5)]
      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent
      disabled:hover:text-[#00f0ff] disabled:hover:shadow-none
    `,
    secondary: `
      bg-[#1a1a24] border-2 border-[#27272a] text-[#e4e4e7]
      hover:border-[#00f0ff] hover:text-[#00f0ff]
      disabled:opacity-50 disabled:cursor-not-allowed
    `,
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
