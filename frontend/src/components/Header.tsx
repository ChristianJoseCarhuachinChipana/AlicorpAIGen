'use client';

import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { User } from '@/types';

interface HeaderProps {
  user: User | null;
  title: string;
  showDashboard?: boolean;
}

const roleLabels: Record<string, string> = {
  creador: 'Creador de Contenido',
  aprobador_a: 'Aprobador de Contenido',
  aprobador_b: 'Auditor Visual',
  admin: 'Administrador',
};

export function Header({ user, title, showDashboard = true }: HeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove('access_token');
    router.push('/');
  };

  return (
    <header className="bg-primary text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">{title}</h1>
          </div>
          <nav className="flex items-center gap-4">
            {showDashboard && (
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium"
              >
                Inicio
              </button>
            )}
            {user && (
              <div className="flex items-center gap-3">
                <span className="text-sm opacity-90">
                  {user.nombre}
                  <span className="ml-1 text-white/70">({roleLabels[user.role]})</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium"
                >
                  Cerrar Sesión
                </button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
