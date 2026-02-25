'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { authApi, brandApi, contenidoApi, auditoriaApi } from '@/lib/api';
import { User, BrandManual, Contenido, Auditoria } from '@/types';

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

  const handleLogout = () => {
    Cookies.remove('access_token');
    router.push('/');
  };

  const handleDeleteManual = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este manual?')) return;
    try {
      await brandApi.deleteManual(id);
      loadData();
    } catch (err) {
      console.error('Error deleting manual:', err);
    }
  };

  if (loading) return <div className="loading">Cargando...</div>;

  const stats = {
    totalManuals: manuals.length,
    totalContenidos: contenidos.length,
    pendientes: contenidos.filter(c => c.estado === 'pendiente').length,
    aprobados: contenidos.filter(c => c.estado === 'aprobado').length,
    rechazados: contenidos.filter(c => c.estado === 'rechazado').length,
    auditorias: auditorias.length
  };

  return (
    <div>
      <header className="header">
        <div className="container header-content">
          <div className="logo">Content Suite - Administrador</div>
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
        <h1 style={{ marginBottom: '1rem' }}>Panel de Administración</h1>
        
        <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '2rem', margin: 0, color: '#0066cc' }}>{stats.totalManuals}</h2>
            <p style={{ color: '#666' }}>Manuales de Marca</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '2rem', margin: 0, color: '#ffc107' }}>{stats.pendientes}</h2>
            <p style={{ color: '#666' }}>Contenidos Pendientes</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '2rem', margin: 0, color: '#28a745' }}>{stats.aprobados}</h2>
            <p style={{ color: '#666' }}>Contenidos Aprobados</p>
          </div>
        </div>

        <div className="grid grid-2">
          <div className="card">
            <h2 style={{ marginBottom: '1rem' }}>Manuales de Marca</h2>
            {manuals.length === 0 ? (
              <p style={{ color: '#666' }}>No hay manuales</p>
            ) : (
              <div>
                {manuals.map((manual) => (
                  <div key={manual.id} style={{ padding: '0.75rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{manual.nombre}</strong>
                      <p style={{ fontSize: '0.875rem', color: '#666' }}>{manual.producto}</p>
                    </div>
                    <button 
                      onClick={() => handleDeleteManual(manual.id)}
                      className="btn btn-danger"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h2 style={{ marginBottom: '1rem' }}>Estadísticas de Contenido</h2>
            <div>
              <div style={{ padding: '0.75rem', borderBottom: '1px solid #eee' }}>
                <strong>Total: {stats.totalContenidos}</strong>
              </div>
              <div style={{ padding: '0.75rem', borderBottom: '1px solid #eee' }}>
                <span className="badge badge-pending">Pendientes: {stats.pendientes}</span>
              </div>
              <div style={{ padding: '0.75rem', borderBottom: '1px solid #eee' }}>
                <span className="badge badge-approved">Aprobados: {stats.aprobados}</span>
              </div>
              <div style={{ padding: '0.75rem', borderBottom: '1px solid #eee' }}>
                <span className="badge badge-rejected">Rechazados: {stats.rechazados}</span>
              </div>
              <div style={{ padding: '0.75rem' }}>
                <strong>Auditorías realizadas: {stats.auditorias}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: '1rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Información del Sistema</h2>
          <p><strong>Backend API:</strong> http://localhost:8000</p>
          <p><strong>Langfuse:</strong> https://cloud.langfuse.com (configurable)</p>
          <p><strong>Groq Cloud:</strong> https://console.groq.com</p>
          <p><strong>Google AI Studio:</strong> https://aistudio.google.com</p>
        </div>
      </main>
    </div>
  );
}
