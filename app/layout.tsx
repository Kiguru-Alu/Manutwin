import React from 'react';
import './globals.css';

export const metadata = {
  title: 'Manutwin - Production Speed & Downtime Tracker',
  description: 'Industrial digital twin monitoring line halts and velocity for food manufacturing SMEs.',
  manifest: "/manifest.json",
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
