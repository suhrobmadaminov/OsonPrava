import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import './globals.css';

const nunito = Nunito({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-nunito',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'OsonPrava',
    template: '%s | OsonPrava',
  },
  description: 'Haydovchilik guvohnomasi imtihoniga tayyorgarlik platformasi',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body className={`${nunito.variable} font-nunito`}>{children}</body>
    </html>
  );
}
