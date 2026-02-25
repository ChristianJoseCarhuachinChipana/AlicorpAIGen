'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { authApi } from '@/lib/api';
import { User } from '@/types';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('access_token');
    if (!token) {
      router.push('/');
      return;
    }

    authApi.getMe()
      .then(setUser)
      .catch(() => {
        Cookies.remove('access_token');
        router.push('/');
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = () => {
    Cookies.remove('access_token');
    router.push('/');
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  const getDashboardUrl = () => {
    switch (user?.role) {
      case 'creador':
        return '/dashboard/creador';
      case 'aprobador_a':
        return '/dashboard/aprobador-a';
      case 'aprobador_b':
        return '/dashboard/aprobador-b';
      case 'admin':
        return '/dashboard/admin';
      default:
        return '/dashboard/creador';
    }
  };

  const roleLabels: Record<string, string> = {
    creador: 'Creador de Contenido',
    aprobador_a: 'Aprobador de Contenido',
    aprobador_b: 'Auditor Visual',
    admin: 'Administrador'
  };

  return (
    <div>
      <header className="header">
        <div className="container header-content">
          <div className="logo">Content Suite</div>
          <nav className="nav">
            <span style={{ opacity: 0.8 }}>{user?.nombre} ({roleLabels[user?.role || '']})</span>
            <button onClick={handleLogout} className="btn" style={{ background: 'rgba(255,255,255,0.2)' }}>
              Cerrar Sesión
            </button>
          </nav>
        </div>
      </header>

      <main className="container" style={{ padding: '2rem 20px' }}>
        <h1 style={{ marginBottom: '1rem' }}>Bienvenido, {user?.nombre}</h1>
        <p style={{ marginBottom: '2rem', color: '#666' }}>
          Has iniciado sesión como <strong>{roleLabels[user?.role || '']}</strong>
        </p>

        <div className="grid grid-2">
          <div className="card" onClick={() => router.push(getDashboardUrl())} style={{ cursor: 'pointer' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>Ir a Mi Dashboard</h2>
            <p style={{ color: '#666' }}>Accede a tu panel de trabajo según tu rol</p>
          </div>

          <div className="card">
            <h2 style={{ marginBottom: '0.5rem' }}>Ayuda</h2>
            <p style={{ color: '#666' }}>
              Contacta al administrador si necesitas assistance con el sistema.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
