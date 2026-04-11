import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Raino Studio - Agentic PCB Design Platform',
  description:
    'Transform your hardware ideas into manufacturable PCB designs with AI-assisted workflow',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
