'use client';

import { useEffect, useState } from 'react';
import { contenidoApi } from '@/lib/api';
import { Contenido } from '@/types';
import { 
  DashboardLayout, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Button, 
  Textarea,
  Alert,
  StatusBadge,
  Badge 
} from '@/components';
import { StatsCard, StatGrid, ContentList, ContentDetail } from '@/components/dashboard';
import { useAuth } from '@/hooks';

const ALLOWED_ROLES_APROBADOR_A: ("aprobador_a" | "admin")[] = ["aprobador_a", "admin"];

export default function AprobadorAPage() {
  const { user, loading: authLoading } = useAuth({
    allowedRoles: ALLOWED_ROLES_APROBADOR_A,
  });

  const [contenidos, setContenidos] = useState<Contenido[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<Contenido | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadContenidos = async () => {
    try {
      const data = await contenidoApi.list();
      setContenidos(data);
    } catch (err) {
      console.error('Error loading contenidos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadContenidos();
    }
  }, [user]);

  const handleApprove = async (id: string) => {
    setProcessing(true);
    setError('');
    try {
      await contenidoApi.approve(id);
      setSuccess('Contenido aprobado');
      loadContenidos();
      setSelectedContent(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al aprobar';
      setError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) {
      setError('Debe ingresar un motivo de rechazo');
      return;
    }
    setProcessing(true);
    setError('');
    try {
      await contenidoApi.reject(id, rejectReason);
      setSuccess('Contenido rechazado');
      loadContenidos();
      setSelectedContent(null);
      setRejectReason('');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al rechazar';
      setError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const pendingContents = contenidos.filter(c => c.estado === 'pendiente');

  return (
    <DashboardLayout user={user} title="Content Suite - Aprobador A" loading={authLoading}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Panel de Aprobación de Contenido</h1>
        
        <StatGrid>
          <StatsCard value={pendingContents.length} label="Pendientes" valueColor="text-warning" />
          <StatsCard value={contenidos.filter(c => c.estado === 'aprobado').length} label="Aprobados" valueColor="text-success" />
          <StatsCard value={contenidos.filter(c => c.estado === 'rechazado').length} label="Rechazados" valueColor="text-danger" />
        </StatGrid>

        {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert variant="success" onClose={() => setSuccess('')}>{success}</Alert>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Contenido Pendiente de Aprobación</CardTitle>
            </CardHeader>
            <CardContent>
              <ContentList
                contenidos={pendingContents}
                selectedId={selectedContent?.id}
                onSelect={setSelectedContent}
                emptyMessage="No hay contenido pendiente"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalles del Contenido</CardTitle>
            </CardHeader>
            <CardContent>
              <ContentDetail
                contenido={selectedContent}
                showActions={true}
                onApprove={handleApprove}
                onReject={handleReject}
                processing={processing}
                rejectReason={rejectReason}
                onRejectReasonChange={setRejectReason}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
