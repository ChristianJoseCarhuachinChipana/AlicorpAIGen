'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { authApi, brandApi, contenidoApi, auditoriaApi } from '@/lib/api';
import { User, BrandManual, Contenido, Auditoria } from '@/types';
import { 
  DashboardLayout, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Button, 
  Badge,
  StatusBadge 
} from '@/components';

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [manuals, setManuals] = useState<BrandManual[]>([]);
  const [contenidos, setContenidos] = useState<Contenido[]>([]);
  const [auditorias, setAuditorias] = useState<Auditoria[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('access_token');
    if (!token) {
      router.push('/');
      return;
    }

    authApi.getMe()
      .then((userData) => {
        setUser(userData);
        if (userData.role !== 'admin') {
          router.push('/dashboard');
        }
      })
      .catch(() => router.push('/'))
      .finally(() => setLoading(false));
  }, [router]);

  const loadData = async () => {
    try {
      const [manualsData, contenidoData, auditoriasData] = await Promise.all([
        brandApi.listManuals(),
        contenidoApi.list(),
        auditoriaApi.list()
      ]);
      setManuals(manualsData);
      setContenidos(contenidoData);
      setAuditorias(auditoriasData);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const handleDeleteManual = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este manual?')) return;
    try {
      await brandApi.deleteManual(id);
      loadData();
    } catch (err) {
      console.error('Error deleting manual:', err);
    }
  };

  const stats = {
    totalManuals: manuals.length,
    totalContenidos: contenidos.length,
    pendientes: contenidos.filter(c => c.estado === 'pendiente').length,
    aprobados: contenidos.filter(c => c.estado === 'aprobado').length,
    rechazados: contenidos.filter(c => c.estado === 'rechazado').length,
    auditorias: auditorias.length
  };

  return (
    <DashboardLayout user={user} title="Content Suite - Administrador" loading={loading}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="text-center">
            <div className="text-3xl font-bold text-primary">{stats.totalManuals}</div>
            <div className="text-gray-500 text-sm mt-1">Manuales de Marca</div>
          </Card>
          <Card className="text-center">
            <div className="text-3xl font-bold text-warning">{stats.pendientes}</div>
            <div className="text-gray-500 text-sm mt-1">Contenidos Pendientes</div>
          </Card>
          <Card className="text-center">
            <div className="text-3xl font-bold text-success">{stats.aprobados}</div>
            <div className="text-gray-500 text-sm mt-1">Contenidos Aprobados</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Manuales de Marca</CardTitle>
            </CardHeader>
            <CardContent>
              {manuals.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay manuales</p>
              ) : (
                <div className="space-y-2">
                  {manuals.map((manual) => (
                    <div key={manual.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{manual.nombre}</div>
                        <div className="text-sm text-gray-500">{manual.producto}</div>
                      </div>
                      <Button 
                        onClick={() => handleDeleteManual(manual.id)}
                        variant="danger"
                        size="sm"
                      >
                        Eliminar
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estadísticas de Contenido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Total</span>
                  <span className="font-bold">{stats.totalContenidos}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <span>Pendientes</span>
                  <Badge variant="warning">{stats.pendientes}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span>Aprobados</span>
                  <Badge variant="success">{stats.aprobados}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span>Rechazados</span>
                  <Badge variant="danger">{stats.rechazados}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span>Auditorías realizadas</span>
                  <span className="font-bold">{stats.auditorias}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Backend API:</span>
                <span className="ml-2 font-medium">http://localhost:8000</span>
              </div>
              <div>
                <span className="text-gray-500">Langfuse:</span>
                <span className="ml-2">https://cloud.langfuse.com</span>
              </div>
              <div>
                <span className="text-gray-500">Groq Cloud:</span>
                <span className="ml-2">https://console.groq.com</span>
              </div>
              <div>
                <span className="text-gray-500">Google AI Studio:</span>
                <span className="ml-2">https://aistudio.google.com</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
