import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-plus-jakarta',
});

const SITE_URL = 'https://www.wellnessdiagnosticcenter.in';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Wellness Diagnostic Center — Quality Healthcare & Blood Diagnostics at Your Doorstep',
    template: '%s | Wellness Diagnostic Center',
  },
  description:
    'Book certified blood tests, schedule doorstep home sample collection, and access verified NABL laboratory reports with Wellness Diagnostic Center. 200+ routine & specialized diagnostic panels.',
  keywords: [
    'Wellness Diagnostic Center',
    'Wellness Diagnostic Centre',
    'wellnessdiagnosticcenter.in',
    'wellnessdiagnosticcentre.in',
    'blood test at home',
    'doorstep blood collection',
    'pathology lab near me',
    'diagnostic center Davangere',
    'Thyrocare blood tests',
    'Aarogyam full body checkup',
    'NABL accredited laboratory',
    'health checkup packages',
  ],
  authors: [{ name: 'Wellness Diagnostic Laboratory' }],
  creator: 'Wellness Diagnostic',
  publisher: 'Wellness Diagnostic Laboratory',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Wellness Diagnostic Center — Quality Healthcare & Blood Diagnostics at Your Doorstep',
    description:
      'Book certified blood tests, schedule doorstep home sample collection, and access verified NABL laboratory reports with Wellness Diagnostic Center.',
    url: SITE_URL,
    siteName: 'Wellness Diagnostic Center',
    images: [
      {
        url: '/logo.png',
        width: 910,
        height: 910,
        alt: 'Wellness Diagnostic Center Logo',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wellness Diagnostic Center — Doorstep Blood Tests & Diagnostics',
    description:
      'Accredited clinical diagnostic laboratory offering home sample collection, preventive health panels, and fast digital reports.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/logo-48.png', type: 'image/png', sizes: '48x48' },
      { url: '/logo-96.png', type: 'image/png', sizes: '96x96' },
      { url: '/logo-144.png', type: 'image/png', sizes: '144x144' },
      { url: '/logo-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/logo-512.png', type: 'image/png', sizes: '512x512' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DiagnosticLab',
    name: 'Wellness Diagnostic Center',
    alternateName: ['Wellness Diagnostic Centre', 'Wellness Diagnostic'],
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    image: `${SITE_URL}/logo.png`,
    description:
      'Accredited clinical pathology diagnostic laboratory specializing in doorstep blood collection, preventive health panels, and fast digital reports.',
    telephone: '+91-1800-419-WELL',
    priceRange: '₹₹',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Davangere',
      postalCode: '577005',
      addressCountry: 'IN',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        opens: '06:00',
        closes: '21:00',
      },
    ],
  };

  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${plusJakartaSans.className} bg-ivory-200 text-botanical-900 min-h-screen antialiased flex flex-col`}>
        <AuthProvider>
          <DataProvider>
            {children}
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
