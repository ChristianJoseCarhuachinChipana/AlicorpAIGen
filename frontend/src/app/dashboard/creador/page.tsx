'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { authApi, brandApi, contenidoApi } from '@/lib/api';
import { User, BrandManual, Contenido } from '@/types';

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

  const handleLogout = () => {
    Cookies.remove('access_token');
    router.push('/');
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div>
      <header className="header">
        <div className="container header-content">
          <div className="logo">Content Suite - Creador</div>
          <nav className="nav">
            <button onClick={() => router.push('/dashboard')} className="btn" style={{ background: 'rgba(255,255,255,0.2)' }}>
              Inicio
            </button>
            <button onClick={handleLogout} className="btn" style={{ background: 'rgba(255,255,255,0.2)' }}>
              Cerrar Sesión
            </button>
          </nav>
        </div>
      </header>

      <main className="container" style={{ padding: '2rem 20px' }}>
        <h1 style={{ marginBottom: '1rem' }}>Panel de Creador</h1>
        
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <div style={{ marginBottom: '1rem' }}>
          <button 
            className={`btn ${activeTab === 'manuals' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('manuals')}
          >
            Crear Manual de Marca
          </button>
          <button 
            className={`btn ${activeTab === 'contenido' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('contenido')}
            style={{ marginLeft: '0.5rem' }}
          >
            Generar Contenido
          </button>
        </div>

        {activeTab === 'manuals' && (
          <div className="grid grid-2">
            <div className="card">
              <h2 style={{ marginBottom: '1rem' }}>Crear Nuevo Manual de Marca</h2>
              <form onSubmit={handleCreateManual}>
                <div className="form-group">
                  <label className="form-label">Nombre del Manual</label>
                  <input
                    type="text"
                    className="form-input"
                    value={manualForm.nombre}
                    onChange={(e) => setManualForm({ ...manualForm, nombre: e.target.value })}
                    required
                    placeholder="ej. Snack Saludable Quinua"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Producto/Servicio</label>
                  <input
                    type="text"
                    className="form-input"
                    value={manualForm.producto}
                    onChange={(e) => setManualForm({ ...manualForm, producto: e.target.value })}
                    required
                    placeholder="ej. Snack de quinua orgánico"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tono de Comunicación</label>
                  <input
                    type="text"
                    className="form-input"
                    value={manualForm.tono}
                    onChange={(e) => setManualForm({ ...manualForm, tono: e.target.value })}
                    required
                    placeholder="ej. Divertido pero profesional"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Público Objetivo</label>
                  <input
                    type="text"
                    className="form-input"
                    value={manualForm.público_objetivo}
                    onChange={(e) => setManualForm({ ...manualForm, público_objetivo: e.target.value })}
                    required
                    placeholder="ej. Gen Z, jóvenes profesionales"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Restricciones</label>
                  <textarea
                    className="form-textarea"
                    value={manualForm.restricciones}
                    onChange={(e) => setManualForm({ ...manualForm, restricciones: e.target.value })}
                    placeholder="ej. Prohibido usar tecnicismos, evitar colores oscuros"
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={creatingManual}>
                  {creatingManual ? 'Generando...' : 'Generar Manual de Marca'}
                </button>
              </form>
            </div>

            <div className="card">
              <h2 style={{ marginBottom: '1rem' }}>Manuales Existentes</h2>
              {manuals.length === 0 ? (
                <p style={{ color: '#666' }}>No hay manuales creados aún</p>
              ) : (
                <div>
                  {manuals.map((manual) => (
                    <div key={manual.id} style={{ padding: '0.75rem', borderBottom: '1px solid #eee' }}>
                      <strong>{manual.nombre}</strong>
                      <p style={{ fontSize: '0.875rem', color: '#666' }}>{manual.producto}</p>
                      <p style={{ fontSize: '0.875rem', color: '#666' }}>Tono: {manual.tono}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'contenido' && (
          <div className="grid grid-2">
            <div className="card">
              <h2 style={{ marginBottom: '1rem' }}>Generar Nuevo Contenido</h2>
              <form onSubmit={handleCreateContent}>
                <div className="form-group">
                  <label className="form-label">Manual de Marca</label>
                  <select
                    className="form-select"
                    value={contentForm.brand_manual_id}
                    onChange={(e) => setContentForm({ ...contentForm, brand_manual_id: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar manual...</option>
                    {manuals.map((manual) => (
                      <option key={manual.id} value={manual.id}>
                        {manual.nombre} - {manual.producto}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Tipo de Contenido</label>
                  <select
                    className="form-select"
                    value={contentForm.tipo}
                    onChange={(e) => setContentForm({ ...contentForm, tipo: e.target.value })}
                  >
                    <option value="descripcion">Descripción de Producto</option>
                    <option value="guion_video">Guión de Video</option>
                    <option value="prompt_imagen">Prompt de Imagen</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Título</label>
                  <input
                    type="text"
                    className="form-input"
                    value={contentForm.titulo}
                    onChange={(e) => setContentForm({ ...contentForm, titulo: e.target.value })}
                    required
                    placeholder="ej. Snack de quinua crujiente"
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={creatingContent || manuals.length === 0}>
                  {creatingContent ? 'Generando...' : 'Generar Contenido'}
                </button>
              </form>
            </div>

            <div className="card">
              <h2 style={{ marginBottom: '1rem' }}>Contenido Generado</h2>
              {contenidos.length === 0 ? (
                <p style={{ color: '#666' }}>No hay contenido generado aún</p>
              ) : (
                <div>
                  {contenidos.map((item) => (
                    <div key={item.id} style={{ padding: '0.75rem', borderBottom: '1px solid #eee' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong>{item.titulo}</strong>
                        <span className={`badge badge-${item.estado}`}>{item.estado}</span>
                      </div>
                      <p style={{ fontSize: '0.875rem', color: '#666' }}>Tipo: {item.tipo}</p>
                      {item.contenido_text && (
                        <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                          {item.contenido_text.substring(0, 150)}...
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
