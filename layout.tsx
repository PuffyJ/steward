import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Steward CRM',
  description: 'Donor relationship management for faith-based organizations',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
