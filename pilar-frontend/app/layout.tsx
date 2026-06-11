import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'PILAR — Peduli Laut dan Pesisir',
  description: 'Platform volunteer bersih pantai terintegrasi',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '13px',
              borderRadius: '12px',
              border: '1px solid #f5f0e8',
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            },
          }}
        />
      </body>
    </html>
  );
}