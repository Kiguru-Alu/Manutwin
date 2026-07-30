import React from 'react';
import './globals.css';

export const metadata = {
  title: 'Manutwin - Production Speed & Downtime Tracker',
  description: 'Industrial digital twin monitoring line halts and velocity for food manufacturing SMEs.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/logo.svg', type: 'image/svg+xml' }
    ],
    apple: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' }
    ]
  },
};

export const viewport = {
  themeColor: '#FF5722',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
