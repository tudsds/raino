export const theme = {
  colors: {
    bg: {
      primary: '#0a0a0f',
      secondary: '#111118',
      tertiary: '#1a1a24',
      elevated: '#22222e',
    },
    fg: {
      primary: '#e4e4e7',
      secondary: '#a1a1aa',
      muted: '#71717a',
    },
    accent: {
      cyan: '#00f0ff',
      purple: '#8b5cf6',
      magenta: '#ff00aa',
      green: '#00ff88',
      amber: '#ffaa00',
      red: '#ff3366',
    },
    border: {
      primary: '#27272a',
      secondary: '#3f3f46',
      accent: '#00f0ff33',
    },
  },
  fonts: {
    heading: "'Press Start 2P', monospace",
    body: "'VT323', monospace",
    mono: "'VT323', monospace",
  },
  radii: {
    none: '0px',
    sm: '0px',
    md: '0px',
    lg: '0px',
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
    pixelBorder: '2px solid',
    crtGlow: '0 0 10px currentColor, 0 0 20px currentColor',
    stepTransition: 'all 0.1s steps(2)',
  },
} as const;
