import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Oddvara — Convert Any Bet, Anywhere',
  description:
    'Paste a booking code or bet slip and instantly rebuild it for Bet9ja, SportyBet, and 1xBet. Free bet slip converter.',
  keywords: ['bet converter', 'bet9ja', 'sportybet', '1xbet', 'booking code', 'bet slip', 'odds converter'],
  authors: [{ name: 'Oddvara' }],
  openGraph: {
    title: 'Oddvara — Convert Any Bet, Anywhere',
    description: 'Rebuild any bet slip for any platform in seconds.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#06060f',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <body className="min-h-screen bg-ov-bg antialiased">{children}</body>
    </html>
  );
}
