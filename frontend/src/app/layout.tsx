import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Content Suite - Alicorp',
  description: 'Sistema de gestión de contenido con IA',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
