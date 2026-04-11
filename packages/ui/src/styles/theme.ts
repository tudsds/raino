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
    heading: "'Space Grotesk', sans-serif",
    body: "'Inter', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
  radii: {
    none: '0px',
    sm: '4px',
    md: '8px',
    lg: '12px',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
  },
} as const;
