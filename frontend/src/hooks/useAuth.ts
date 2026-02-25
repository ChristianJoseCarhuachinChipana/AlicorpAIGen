import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { authApi } from '@/lib/api';
import { User } from '@/types';

type UserRole = 'creador' | 'aprobador_a' | 'aprobador_b' | 'admin';

interface UseAuthOptions {
  /** Roles permitidos para acceder a la página */
  allowedRoles?: UserRole[];
  /** Redirigir al login si no hay token */
  redirectToLogin?: boolean;
  /** Redirigir al dashboard si el rol no está permitido */
  redirectOnUnauthorized?: boolean;
}

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  hasAccess: boolean;
  logout: () => void;
}

/**
 * Hook personalizado para manejar autenticación y autorización de usuarios.
 * Proporciona funcionalidades comunes de autenticación en todas las páginas protegidas.
 * 
 * @param options - Configuración del hook
 * @returns Objeto con el usuario, estado de carga, funciones de verificación y logout
 */
export function useAuth(options: UseAuthOptions = {}): UseAuthReturn {
  const {
    allowedRoles,
    redirectToLogin = true,
    redirectOnUnauthorized = true,
  } = options;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('access_token');

    if (!token) {
      if (redirectToLogin) {
        router.push('/');
      } else {
        setLoading(false);
      }
      return;
    }

    authApi.getMe()
      .then((userData) => {
        setUser(userData);

        // Verificar si el rol tiene acceso
        if (allowedRoles && !allowedRoles.includes(userData.role)) {
          setHasAccess(false);
          if (redirectOnUnauthorized) {
            router.push('/dashboard');
          }
        }
      })
      .catch(() => {
        Cookies.remove('access_token');
        if (redirectToLogin) {
          router.push('/');
        } else {
          setUser(null);
        }
      })
      .finally(() => setLoading(false));
  }, [router, redirectToLogin, redirectOnUnauthorized, allowedRoles]);

  const logout = () => {
    Cookies.remove('access_token');
    router.push('/');
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    hasAccess,
    logout,
  };
}

/**
 * Hook para verificar si el usuario actual tiene un rol específico.
 * Útil para verificaciones rápidas dentro de componentes.
 */
export function useRoleCheck(requiredRole: UserRole) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('access_token');
    if (!token) {
      setLoading(false);
      return;
    }

    authApi.getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return {
    user,
    loading,
    hasRole: user?.role === requiredRole,
  };
}
