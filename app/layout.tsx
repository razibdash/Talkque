import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Talkque | AI phone agents for every language',
    template: '%s | Talkque',
  },
  description:
    'Build, deploy, and improve multilingual AI phone agents with trusted knowledge and global telephony.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
