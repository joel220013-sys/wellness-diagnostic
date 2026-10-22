import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';

export const metadata: Metadata = {
  title: 'Wellness Diagnostic — Quality Healthcare & Blood Diagnostics at Your Doorstep',
  description: 'Book blood tests, schedule home sample collection, and access verified NABL laboratory reports with Wellness Diagnostic.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-ivory-200 text-botanical-900 min-h-screen antialiased flex flex-col">
        <AuthProvider>
          <DataProvider>
            {children}
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
