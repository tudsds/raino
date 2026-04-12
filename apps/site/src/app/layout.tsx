import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Raino — Agentic PCB & PCBA Workflow Platform',
  description:
    'Constrained, auditable, source-traceable hardware design and manufacturing handoff system',
  keywords: ['PCB', 'PCBA', 'hardware design', 'KiCad', 'manufacturing', 'EDA'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#0a0a0f] text-[#e4e4e7] antialiased">{children}</body>
    </html>
  );
}
