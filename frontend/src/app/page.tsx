'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { authApi } from '@/lib/api';
import { Button, Input, Alert } from '@/components';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('access_token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login(email, password);
      Cookies.set('access_token', response.access_token, { expires: 1 });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Content Suite</h1>
            <p className="text-gray-500">Inicia sesión para continuar</p>
          </div>
          
          {error && (
            <Alert variant="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
            />
            
            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
            
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500 font-medium mb-3">Usuarios de prueba:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li><span className="font-medium">Creador:</span> creador@alicorp.com / admin123</li>
              <li><span className="font-medium">Aprobador A:</span> aprobadora@alicorp.com / admin123</li>
              <li><span className="font-medium">Aprobador B:</span> aprobadorb@alicorp.com / admin123</li>
              <li><span className="font-medium">Admin:</span> admin@alicorp.com / admin123</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
