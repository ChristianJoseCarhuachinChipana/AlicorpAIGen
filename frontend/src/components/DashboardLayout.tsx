'use client';

import { Header } from './Header';
import { Loading } from './Loading';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: User | null;
  title: string;
  loading?: boolean;
  showDashboard?: boolean;
}

import { User as UserType } from '@/types';

type User = UserType;

export function DashboardLayout({ 
  children, 
  user, 
  title, 
  loading = false,
  showDashboard = true 
}: DashboardLayoutProps) {
  if (loading) {
    return <Loading fullScreen text="Cargando..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} title={title} showDashboard={showDashboard} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
