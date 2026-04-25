export const theme = {
  colors: {
    bg: {
      primary: '#0A1929',
      secondary: '#0D2137',
      tertiary: '#132F4C',
      elevated: '#1A3A5C',
    },
    fg: {
      primary: '#E2E8F0',
      secondary: '#94A3B8',
      muted: '#64748B',
    },
    accent: {
      blue: '#1565C0',
      lightBlue: '#6191D3',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#EF5350',
      info: '#6191D3',
    },
    border: {
      primary: 'rgba(255,255,255,0.12)',
      secondary: 'rgba(255,255,255,0.20)',
      accent: 'rgba(21,101,192,0.33)',
    },
  },
  fonts: {
    heading: "'Noto Serif', serif",
    body: "'Noto Serif', serif",
    mono: "'Noto Serif', serif",
  },
  radii: {
    none: '0px',
    sm: '8px',
    md: '12px',
    lg: '16px',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
  },
  effects: {
    glassBackground: 'rgba(255, 255, 255, 0.06)',
    glassShadow: '0 8px 32px rgba(0, 0, 0, 0.20)',
    smoothTransition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;
