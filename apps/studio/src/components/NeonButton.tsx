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
    'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200';

  const variants = {
    primary: `
      bg-transparent border-2 border-[#00f0ff] text-[#00f0ff]
      hover:bg-[#00f0ff] hover:text-[#0a0a0f]
      hover:shadow-[0_0_30px_rgba(0,240,255,0.4),0_0_60px_rgba(0,240,255,0.2)]
      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent
      disabled:hover:text-[#00f0ff] disabled:hover:shadow-none
    `,
    secondary: `
      bg-[#1a1a2e] border border-[#27273a] text-[#e4e4e7]
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
