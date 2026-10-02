import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/store';
import { Navbar } from '@/components/layout/Navbar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { MedBuddyChatDrawer } from '@/components/ai/MedBuddyChatDrawer';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { UserProfileModal } from '@/components/profile/UserProfileModal';

export const metadata: Metadata = {
  title: 'ArogyaLink | AI-Powered Medication Management & Adherence System',
  description: 'Unified medication management, OCR prescription extraction, deterministic scheduling, and intelligent adherence tracking.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0284c7',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 pb-24 md:pb-8 antialiased">
        <AppProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-6">
              <AuthGuard>
                {children}
              </AuthGuard>
            </main>
            <MobileBottomNav />
            <MedBuddyChatDrawer />
            <UserProfileModal />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
