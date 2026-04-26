import type { Metadata } from 'next';
import { Noto_Serif } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { GlassProvider } from '@raino/ui';

const notoSerif = Noto_Serif({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-noto-serif',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://raino-site.vercel.app'),
  title: 'Raino — Agentic PCB & PCBA Workflow Platform',
  description:
    'Constrained, auditable, source-traceable hardware design and manufacturing handoff system',
  keywords: ['PCB', 'PCBA', 'hardware design', 'KiCad', 'manufacturing', 'EDA'],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={`dark ${notoSerif.variable}`}>
      <body className="min-h-screen bg-[#0A1929] text-[#E2E8F0] antialiased font-serif">
        <NextIntlClientProvider messages={messages}>
          <GlassProvider>
            <Navbar />
            {children}
            <Footer />
          </GlassProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
