import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Talkque - Multilingual AI Phone Agents',
  description: 'Global SaaS platform for multilingual AI phone agents.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
