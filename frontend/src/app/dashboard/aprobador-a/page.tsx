'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { authApi, contenidoApi } from '@/lib/api';
import { User, Contenido } from '@/types';

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

  const handleLogout = () => {
    Cookies.remove('access_token');
    router.push('/');
  };

  if (loading) return <div className="loading">Cargando...</div>;

  const pendingContents = contenidos.filter(c => c.estado === 'pendiente');

  return (
    <div>
      <header className="header">
        <div className="container header-content">
          <div className="logo">Content Suite - Aprobador A</div>
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
        <h1 style={{ marginBottom: '1rem' }}>Panel de Aprobación de Contenido</h1>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <div className="card" style={{ flex: 1, textAlign: 'center' }}>
            <h2 style={{ fontSize: '2rem', margin: 0 }}>{pendingContents.length}</h2>
            <p style={{ color: '#666' }}>Pendientes</p>
          </div>
          <div className="card" style={{ flex: 1, textAlign: 'center' }}>
            <h2 style={{ fontSize: '2rem', margin: 0 }}>{contenidos.filter(c => c.estado === 'aprobado').length}</h2>
            <p style={{ color: '#666' }}>Aprobados</p>
          </div>
          <div className="card" style={{ flex: 1, textAlign: 'center' }}>
            <h2 style={{ fontSize: '2rem', margin: 0 }}>{contenidos.filter(c => c.estado === 'rechazado').length}</h2>
            <p style={{ color: '#666' }}>Rechazados</p>
          </div>
        </div>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <div className="grid grid-2">
          <div className="card">
            <h2 style={{ marginBottom: '1rem' }}>Contenido Pendiente de Aprobación</h2>
            {pendingContents.length === 0 ? (
              <p style={{ color: '#666' }}>No hay contenido pendiente</p>
            ) : (
              <div>
                {pendingContents.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => setSelectedContent(item)}
                    style={{ 
                      padding: '0.75rem', 
                      borderBottom: '1px solid #eee',
                      cursor: 'pointer',
                      background: selectedContent?.id === item.id ? '#f0f0f0' : 'transparent'
                    }}
                  >
                    <strong>{item.titulo}</strong>
                    <p style={{ fontSize: '0.875rem', color: '#666' }}>Tipo: {item.tipo}</p>
                    <p style={{ fontSize: '0.75rem', color: '#999' }}>
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h2 style={{ marginBottom: '1rem' }}>Detalles del Contenido</h2>
            {selectedContent ? (
              <div>
                <p><strong>Título:</strong> {selectedContent.titulo}</p>
                <p><strong>Tipo:</strong> {selectedContent.tipo}</p>
                <p><strong>Estado:</strong> <span className={`badge badge-${selectedContent.estado}`}>{selectedContent.estado}</span></p>
                <div style={{ marginTop: '1rem' }}>
                  <strong>Contenido:</strong>
                  <div style={{ 
                    marginTop: '0.5rem', 
                    padding: '1rem', 
                    background: '#f8f9fa', 
                    borderRadius: '4px',
                    whiteSpace: 'pre-wrap',
                    maxHeight: '300px',
                    overflow: 'auto'
                  }}>
                    {selectedContent.contenido_text || 'Sin contenido'}
                  </div>
                </div>

                {selectedContent.estado === 'pendiente' && (
                  <div style={{ marginTop: '1rem' }}>
                    <button 
                      onClick={() => handleApprove(selectedContent.id)}
                      className="btn btn-success"
                      disabled={processing}
                      style={{ marginRight: '0.5rem' }}
                    >
                      Aprobar
                    </button>
                    <button 
                      onClick={() => handleReject(selectedContent.id)}
                      className="btn btn-danger"
                      disabled={processing}
                    >
                      Rechazar
                    </button>
                    
                    <div style={{ marginTop: '1rem' }}>
                      <label className="form-label">Motivo de rechazo:</label>
                      <textarea
                        className="form-textarea"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Ingrese el motivo del rechazo..."
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                {selectedContent.rechazo_razon && (
                  <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f8d7da', borderRadius: '4px' }}>
                    <strong>Motivo de rechazo:</strong>
                    <p>{selectedContent.rechazo_razon}</p>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color: '#666' }}>Seleccione un contenido para ver los detalles</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
