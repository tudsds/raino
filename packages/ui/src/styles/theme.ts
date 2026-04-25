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
  glass: {
    depth: {
      /** Cards resting on the page surface */
      surface: {
        background: 'rgba(255, 255, 255, 0.06)',
        border: 'rgba(255, 255, 255, 0.12)',
        blur: '16px',
      },
      /** Elevated panels and drawers */
      elevated: {
        background: 'rgba(255, 255, 255, 0.10)',
        border: 'rgba(255, 255, 255, 0.18)',
        blur: '24px',
      },
      /** Modals, tooltips, floating menus */
      floating: {
        background: 'rgba(10, 25, 41, 0.85)',
        border: 'rgba(255, 255, 255, 0.22)',
        blur: '24px',
      },
    },
    opacity: {
      surface: 0.06,
      elevated: 0.10,
      floating: 0.15,
      navbar: 0.80,
      footer: 0.90,
    },
    blur: {
      glass: '16px',
      heavy: '24px',
      light: '10px',
    },
  },
  shadow: {
    glass: {
      /** Contact shadow — hugs the element */
      1: '0 2px 8px rgba(10, 25, 41, 0.30)',
      /** Key shadow — primary depth indicator */
      2: '0 8px 32px rgba(10, 25, 41, 0.20)',
      /** Ambient shadow — wide diffuse spread */
      3: '0 24px 64px rgba(10, 25, 41, 0.15)',
    },
    /** Combined multi-layer shadow per depth level */
    layers: {
      surface: '0 2px 8px rgba(10, 25, 41, 0.30), 0 8px 32px rgba(10, 25, 41, 0.20)',
      elevated: '0 2px 8px rgba(10, 25, 41, 0.30), 0 8px 32px rgba(10, 25, 41, 0.20), 0 24px 64px rgba(10, 25, 41, 0.15)',
      floating: '0 2px 8px rgba(10, 25, 41, 0.40), 0 12px 40px rgba(10, 25, 41, 0.25), 0 32px 80px rgba(10, 25, 41, 0.18)',
    },
  },
  animation: {
    spring: {
      /** Snappy — quick response, UI feedback (buttons, toggles) */
      snappy: {
        stiffness: 400,
        damping: 30,
      },
      /** Smooth — standard motion (cards, panels) */
      smooth: {
        stiffness: 200,
        damping: 25,
      },
      /** Gentle — ambient motion (backgrounds, decorations) */
      gentle: {
        stiffness: 150,
        damping: 28,
      },
    },
    durations: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
      enter: 'cubic-bezier(0, 0, 0.2, 1)',
      exit: 'cubic-bezier(0.4, 0, 1, 1)',
    },
  },
} as const;
