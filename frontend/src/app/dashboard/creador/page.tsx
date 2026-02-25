'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { authApi, brandApi, contenidoApi } from '@/lib/api';
import { User, BrandManual, Contenido } from '@/types';
import { 
  DashboardLayout, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Button, 
  Input, 
  Textarea, 
  Select,
  Alert, 
  StatusBadge 
} from '@/components';

export default function CreadorPage() {
  const [user, setUser] = useState<User | null>(null);
  const [manuals, setManuals] = useState<BrandManual[]>([]);
  const [contenidos, setContenidos] = useState<Contenido[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'manuals' | 'contenido'>('manuals');
  const [creatingManual, setCreatingManual] = useState(false);
  const [creatingContent, setCreatingContent] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const [manualForm, setManualForm] = useState({
    nombre: '',
    producto: '',
    tono: '',
    público_objetivo: '',
    restricciones: ''
  });

  const [contentForm, setContentForm] = useState({
    brand_manual_id: '',
    tipo: 'descripcion',
    titulo: ''
  });

  useEffect(() => {
    const token = Cookies.get('access_token');
    if (!token) {
      router.push('/');
      return;
    }

    authApi.getMe()
      .then((userData) => {
        setUser(userData);
        if (!['creador', 'admin'].includes(userData.role)) {
          router.push('/dashboard');
        }
      })
      .catch(() => router.push('/'))
      .finally(() => setLoading(false));
  }, [router]);

  const loadData = async () => {
    try {
      const [manualsData, contenidoData] = await Promise.all([
        brandApi.listManuals(),
        contenidoApi.list()
      ]);
      setManuals(manualsData);
      setContenidos(contenidoData);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCreatingManual(true);

    try {
      await brandApi.createManual(manualForm);
      setSuccess('Manual de marca creado correctamente');
      setManualForm({ nombre: '', producto: '', tono: '', público_objetivo: '', restricciones: '' });
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al crear manual');
    } finally {
      setCreatingManual(false);
    }
  };

  const handleCreateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCreatingContent(true);

    try {
      await contenidoApi.create(contentForm);
      setSuccess('Contenido generado correctamente');
      setContentForm({ brand_manual_id: '', tipo: 'descripcion', titulo: '' });
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al generar contenido');
    } finally {
      setCreatingContent(false);
    }
  };

  return (
    <DashboardLayout user={user} title="Content Suite - Creador" loading={loading}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Panel de Creador</h1>
        
        {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert variant="success" onClose={() => setSuccess('')}>{success}</Alert>}

        <div className="flex gap-2">
          <Button 
            variant={activeTab === 'manuals' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('manuals')}
          >
            Crear Manual de Marca
          </Button>
          <Button 
            variant={activeTab === 'contenido' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('contenido')}
          >
            Generar Contenido
          </Button>
        </div>

        {activeTab === 'manuals' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Crear Nuevo Manual de Marca</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateManual} className="space-y-4">
                  <Input
                    label="Nombre del Manual"
                    value={manualForm.nombre}
                    onChange={(e) => setManualForm({ ...manualForm, nombre: e.target.value })}
                    required
                    placeholder="ej. Snack Saludable Quinua"
                  />
                  <Input
                    label="Producto/Servicio"
                    value={manualForm.producto}
                    onChange={(e) => setManualForm({ ...manualForm, producto: e.target.value })}
                    required
                    placeholder="ej. Snack de quinua orgánico"
                  />
                  <Input
                    label="Tono de Comunicación"
                    value={manualForm.tono}
                    onChange={(e) => setManualForm({ ...manualForm, tono: e.target.value })}
                    required
                    placeholder="ej. Divertido pero profesional"
                  />
                  <Input
                    label="Público Objetivo"
                    value={manualForm.público_objetivo}
                    onChange={(e) => setManualForm({ ...manualForm, público_objetivo: e.target.value })}
                    required
                    placeholder="ej. Gen Z, jóvenes profesionales"
                  />
                  <Textarea
                    label="Restricciones"
                    value={manualForm.restricciones}
                    onChange={(e) => setManualForm({ ...manualForm, restricciones: e.target.value })}
                    placeholder="ej. Prohibido usar tecnicismos, evitar colores oscuros"
                  />
                  <Button type="submit" disabled={creatingManual} className="w-full">
                    {creatingManual ? 'Generando...' : 'Generar Manual de Marca'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Manuales Existentes</CardTitle>
              </CardHeader>
              <CardContent>
                {manuals.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No hay manuales creados aún</p>
                ) : (
                  <div className="space-y-3">
                    {manuals.map((manual) => (
                      <div key={manual.id} className="p-3 border border-gray-100 rounded-lg">
                        <div className="font-semibold text-gray-900">{manual.nombre}</div>
                        <p className="text-sm text-gray-500">{manual.producto}</p>
                        <p className="text-sm text-gray-400">Tono: {manual.tono}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'contenido' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Generar Nuevo Contenido</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateContent} className="space-y-4">
                  <Select
                    label="Manual de Marca"
                    value={contentForm.brand_manual_id}
                    onChange={(e) => setContentForm({ ...contentForm, brand_manual_id: e.target.value })}
                    required
                    placeholder="Seleccionar manual..."
                    options={manuals.map((m) => ({ value: m.id, label: `${m.nombre} - ${m.producto}` }))}
                  />
                  <Select
                    label="Tipo de Contenido"
                    value={contentForm.tipo}
                    onChange={(e) => setContentForm({ ...contentForm, tipo: e.target.value })}
                    options={[
                      { value: 'descripcion', label: 'Descripción de Producto' },
                      { value: 'guion_video', label: 'Guión de Video' },
                      { value: 'prompt_imagen', label: 'Prompt de Imagen' },
                    ]}
                  />
                  <Input
                    label="Título"
                    value={contentForm.titulo}
                    onChange={(e) => setContentForm({ ...contentForm, titulo: e.target.value })}
                    required
                    placeholder="ej. Snack de quinua crujiente"
                  />
                  <Button 
                    type="submit" 
                    disabled={creatingContent || manuals.length === 0} 
                    className="w-full"
                  >
                    {creatingContent ? 'Generando...' : 'Generar Contenido'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contenido Generado</CardTitle>
              </CardHeader>
              <CardContent>
                {contenidos.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No hay contenido generado aún</p>
                ) : (
                  <div className="space-y-3">
                    {contenidos.map((item) => (
                      <div key={item.id} className="p-3 border border-gray-100 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-900">{item.titulo}</span>
                          <StatusBadge status={item.estado} />
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Tipo: {item.tipo}</p>
                        {item.contenido_text && (
                          <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                            {item.contenido_text.substring(0, 150)}...
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
