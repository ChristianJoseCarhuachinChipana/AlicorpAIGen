'use client';

import { useEffect, useState } from 'react';
import { brandApi, contenidoApi, auditoriaApi } from '@/lib/api';
import { BrandManual, Contenido, Auditoria } from '@/types';
import { 
  DashboardLayout, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Button, 
  Badge 
} from '@/components';
import { StatsCard, StatGrid, ManualList } from '@/components/dashboard';
import { useAuth } from '@/hooks';

const ALLOWED_ROLES_ADMIN: ("admin")[] = ["admin"];

/**
 * Calcula las estadísticas del dashboard
 */
function calculateStats(manuals: BrandManual[], contenidos: Contenido[], auditorias: Auditoria[]) {
  return {
    totalManuals: manuals.length,
    totalContenidos: contenidos.length,
    pendientes: contenidos.filter(c => c.estado === 'pendiente').length,
    aprobados: contenidos.filter(c => c.estado === 'aprobado').length,
    rechazados: contenidos.filter(c => c.estado === 'rechazado').length,
    auditorias: auditorias.length
  };
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth({
    allowedRoles: ALLOWED_ROLES_ADMIN,
  });

  const [manuals, setManuals] = useState<BrandManual[]>([]);
  const [contenidos, setContenidos] = useState<Contenido[]>([]);
  const [auditorias, setAuditorias] = useState<Auditoria[]>([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
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

  const stats = calculateStats(manuals, contenidos, auditorias);

  return (
    <DashboardLayout user={user} title="Content Suite - Administrador" loading={authLoading}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
        
        <StatGrid>
          <StatsCard value={stats.totalManuals} label="Manuales de Marca" valueColor="text-primary" />
          <StatsCard value={stats.pendientes} label="Contenidos Pendientes" valueColor="text-warning" />
          <StatsCard value={stats.aprobados} label="Contenidos Aprobados" valueColor="text-success" />
        </StatGrid>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Manuales de Marca</CardTitle>
            </CardHeader>
            <CardContent>
              <ManualList 
                manuales={manuals} 
                onDelete={handleDeleteManual}
                loading={loading}
                emptyMessage="No hay manuales"
              />
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
