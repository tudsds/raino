import type { Session } from '@supabase/supabase-js';
import type { ReactNode } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import '@/app/globals.css';

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  let session: Session | null = null;
  try {
    const user = await getCurrentUser();
    if (user) {
      const { createServerClient } = await import('@supabase/ssr');
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll() {},
          },
        },
      );
      const { data } = await supabase.auth.getSession();
      session = data.session;
    }
  } catch {
    // degraded mode — no session available
  }

  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground antialiased">
        <div className="relative flex min-h-screen flex-col">
          <Header session={session} />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
