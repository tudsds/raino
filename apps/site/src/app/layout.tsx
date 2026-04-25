import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { GlassProvider } from '@raino/ui';

export const metadata: Metadata = {
  metadataBase: new URL('https://raino-site.vercel.app'),
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
          href="https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#0A1929] text-[#E2E8F0] antialiased">
        <GlassProvider>
          <Navbar />
          {children}
          <Footer />
        </GlassProvider>
      </body>
    </html>
  );
}
