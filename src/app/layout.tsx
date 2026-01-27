import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import Header from '@/components/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Moto Finance',
  description: 'Controle seus ganhos do dia',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 p-4 md:p-6">{children}</main>
            <footer className="bg-gray-100 dark:bg-gray-900 p-4 text-center text-gray-600 dark:text-gray-400 text-sm">
              <p>Moto Finance - Controle simples para motoboys</p>
              <p className="mt-1">Uber • 99 Pop • Entregas</p>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
