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
    'inline-flex items-center justify-center gap-2 px-6 py-3 font-[family-name:var(--font-body)] text-lg transition-all duration-300 rounded-xl';

  const variants = {
    primary: `
      bg-[#1565C0] text-white
      hover:bg-[#1976D2]
      hover:shadow-[0_8px_32px_rgba(21,101,192,0.30)]
      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#1565C0]
      disabled:hover:shadow-none
    `,
    secondary: `
      bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] text-[#E2E8F0]
      hover:border-[#1565C0] hover:text-[#1565C0]
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
