'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { authApi, contenidoApi } from '@/lib/api';
import { User, Contenido } from '@/types';
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

export default function AprobadorAPage() {
  const [user, setUser] = useState<User | null>(null);
  const [contenidos, setContenidos] = useState<Contenido[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<Contenido | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
        if (!['aprobador_a', 'admin'].includes(userData.role)) {
          router.push('/dashboard');
        }
      })
      .catch(() => router.push('/'))
      .finally(() => setLoading(false));
  }, [router]);

  const loadContenidos = async () => {
    try {
      const data = await contenidoApi.list();
      setContenidos(data);
    } catch (err) {
      console.error('Error loading contenidos:', err);
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
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al aprobar');
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
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al rechazar');
    } finally {
      setProcessing(false);
    }
  };

  const pendingContents = contenidos.filter(c => c.estado === 'pendiente');

  return (
    <DashboardLayout user={user} title="Content Suite - Aprobador A" loading={loading}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Panel de Aprobación de Contenido</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="text-center">
            <div className="text-3xl font-bold text-warning">{pendingContents.length}</div>
            <div className="text-gray-500 text-sm mt-1">Pendientes</div>
          </Card>
          <Card className="text-center">
            <div className="text-3xl font-bold text-success">{contenidos.filter(c => c.estado === 'aprobado').length}</div>
            <div className="text-gray-500 text-sm mt-1">Aprobados</div>
          </Card>
          <Card className="text-center">
            <div className="text-3xl font-bold text-danger">{contenidos.filter(c => c.estado === 'rechazado').length}</div>
            <div className="text-gray-500 text-sm mt-1">Rechazados</div>
          </Card>
        </div>

        {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert variant="success" onClose={() => setSuccess('')}>{success}</Alert>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Contenido Pendiente de Aprobación</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingContents.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay contenido pendiente</p>
              ) : (
                <div className="space-y-2">
                  {pendingContents.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => setSelectedContent(item)}
                      className={`
                        p-3 rounded-lg cursor-pointer transition-all duration-200
                        ${selectedContent?.id === item.id 
                          ? 'bg-primary/10 border border-primary/30' 
                          : 'border border-gray-100 hover:border-gray-200'}
                      `}
                    >
                      <div className="font-semibold text-gray-900">{item.titulo}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-500">Tipo: {item.tipo}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs text-gray-400">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalles del Contenido</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedContent ? (
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-gray-500">Título:</span>
                    <span className="ml-2 font-medium">{selectedContent.titulo}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Tipo:</span>
                    <span className="ml-2">{selectedContent.tipo}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Estado:</span>
                    <span className="ml-2"><StatusBadge status={selectedContent.estado} /></span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 block mb-2">Contenido:</span>
                    <div className="p-3 bg-gray-50 rounded-lg max-h-64 overflow-auto text-sm whitespace-pre-wrap">
                      {selectedContent.contenido_text || 'Sin contenido'}
                    </div>
                  </div>

                  {selectedContent.estado === 'pendiente' && (
                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleApprove(selectedContent.id)}
                          variant="success"
                          disabled={processing}
                        >
                          Aprobar
                        </Button>
                        <Button 
                          onClick={() => handleReject(selectedContent.id)}
                          variant="danger"
                          disabled={processing}
                        >
                          Rechazar
                        </Button>
                      </div>
                      <Textarea
                        label="Motivo de rechazo:"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Ingrese el motivo del rechazo..."
                        rows={3}
                      />
                    </div>
                  )}

                  {selectedContent.rechazo_razon && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <span className="text-sm font-medium text-red-800">Motivo de rechazo:</span>
                      <p className="text-sm text-red-700 mt-1">{selectedContent.rechazo_razon}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Seleccione un contenido para ver los detalles</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
