'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { authApi } from '@/lib/api';
import { User } from '@/types';
import { DashboardLayout, Card, Loading } from '@/components';
import { useAuth } from '@/hooks';

/**
 * Mapeo de roles a etiquetas legibles
 */
const roleLabels: Record<string, string> = {
  creador: 'Creador de Contenido',
  aprobador_a: 'Aprobador de Contenido',
  aprobador_b: 'Auditor Visual',
  admin: 'Administrador',
};

/**
 * Obtiene la URL del dashboard según el rol del usuario
 */
function getDashboardUrl(role: string): string {
  const roleUrls: Record<string, string> = {
    creador: '/dashboard/creador',
    aprobador_a: '/dashboard/aprobador-a',
    aprobador_b: '/dashboard/aprobador-b',
    admin: '/dashboard/admin',
  };
  return roleUrls[role] || '/dashboard/creador';
}

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth({
    redirectToLogin: true,
    redirectOnUnauthorized: false,
  });
  const router = useRouter();

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

  if (authLoading) {
    return <Loading fullScreen text="Cargando..." />;
  }

  return (
    <DashboardLayout user={user} title="Content Suite" loading={authLoading} showDashboard={false}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bienvenido, {user?.nombre}</h1>
          <p className="text-gray-600 mt-1">
            Has iniciado sesión como <span className="font-semibold text-primary">{roleLabels[user?.role || '']}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card hoverable onClick={() => router.push(getDashboardUrl())}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Ir a Mi Dashboard</h2>
                <p className="text-gray-500 text-sm">Accede a tu panel de trabajo según tu rol</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Ayuda</h2>
                <p className="text-gray-500 text-sm">Contacta al administrador si necesitas asistencia con el sistema.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
