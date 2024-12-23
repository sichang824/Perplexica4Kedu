import type { Metadata } from 'next';
// import { Montserrat } from 'next/font/google';
import Sidebar from '@/components/Sidebar';
import ThemeProvider from '@/components/theme/Provider';
import { cn } from '@/lib/utils';
import { Toaster } from 'sonner';
import './globals.css';

// const montserrat = Montserrat({
//   weight: ['300', '400', '500', '700'],
//   subsets: ['latin'],
//   display: 'swap',
//   fallback: ['Arial', 'sans-serif'],
// });

export const metadata: Metadata = {
  title: 'Perplexica - Chat with the internet',
  description:
    'Perplexica is an AI powered chatbot that is connected to the internet.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="h-full" lang="en" suppressHydrationWarning>
      <body className={cn('h-full')}>
        {/* <body className={cn('h-full', montserrat.className)}> */}
        <ThemeProvider>
          <Toaster />
          <Sidebar>{children}</Sidebar>
        </ThemeProvider>
      </body>
    </html>
  );
}
