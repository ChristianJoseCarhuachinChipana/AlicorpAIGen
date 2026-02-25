'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { authApi, contenidoApi, auditoriaApi } from '@/lib/api';
import { User, Contenido, Auditoria } from '@/types';

export default function AprobadorBPage() {
  const [user, setUser] = useState<User | null>(null);
  const [contenidos, setContenidos] = useState<Contenido[]>([]);
  const [auditorias, setAuditorias] = useState<Auditoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<Contenido | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
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
        if (!['aprobador_b', 'admin'].includes(userData.role)) {
          router.push('/dashboard');
        }
      })
      .catch(() => router.push('/'))
      .finally(() => setLoading(false));
  }, [router]);

  const loadData = async () => {
    try {
      const [contenidosData, auditoriasData] = await Promise.all([
        contenidoApi.list('aprobado'),
        auditoriaApi.list()
      ]);
      setContenidos(contenidosData);
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

  const handleAnalyze = async () => {
    if (!selectedContent || !selectedImage) {
      setError('Seleccione un contenido y una imagen');
      return;
    }

    setAnalyzing(true);
    setError('');
    setAnalysisResult(null);

    try {
      const result = await auditoriaApi.auditImage(selectedContent.id, selectedImage);
      setAnalysisResult(result);
      setSuccess('Análisis completado');
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al analizar imagen');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleLogout = () => {
    Cookies.remove('access_token');
    router.push('/');
  };

  const getScoreClass = (score: number) => {
    if (score >= 0.7) return 'score-high';
    if (score >= 0.4) return 'score-medium';
    return 'score-low';
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div>
      <header className="header">
        <div className="container header-content">
          <div className="logo">Content Suite - Auditor Visual</div>
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
        <h1 style={{ marginBottom: '1rem' }}>Panel de Auditoría Visual</h1>
        
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <div className="grid grid-2">
          <div className="card">
            <h2 style={{ marginBottom: '1rem' }}>Nueva Auditoría</h2>
            
            <div className="form-group">
              <label className="form-label">Contenido a auditar</label>
              <select
                className="form-select"
                value={selectedContent?.id || ''}
                onChange={(e) => {
                  const content = contenidos.find(c => c.id === e.target.value);
                  setSelectedContent(content || null);
                  setAnalysisResult(null);
                }}
              >
                <option value="">Seleccionar contenido...</option>
                {contenidos.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.titulo} ({item.tipo})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Subir imagen para auditoría</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  setSelectedImage(e.target.files?.[0] || null);
                  setAnalysisResult(null);
                }}
                className="form-input"
              />
            </div>

            <button 
              onClick={handleAnalyze}
              className="btn btn-primary"
              disabled={analyzing || !selectedContent || !selectedImage}
            >
              {analyzing ? 'Analizando con IA...' : 'Analizar Imagen'}
            </button>

            {analysisResult && (
              <div style={{ marginTop: '1.5rem' }}>
                <h3>Resultado del Análisis</h3>
                <div style={{ 
                  marginTop: '0.5rem', 
                  padding: '1rem', 
                  background: analysisResult.score >= 0.7 ? '#d4edda' : '#f8d7da',
                  borderRadius: '4px'
                }}>
                  <p>
                    <strong>Score de Conformidad: </strong>
                    <span className={getScoreClass(analysisResult.score)}>
                      {(analysisResult.score * 100).toFixed(0)}%
                    </span>
                  </p>
                  {analysisResult.analisis && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <strong>Análisis:</strong>
                      <pre style={{ 
                        marginTop: '0.5rem', 
                        whiteSpace: 'pre-wrap',
                        fontSize: '0.875rem'
                      }}>
                        {analysisResult.analisis}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="card">
            <h2 style={{ marginBottom: '1rem' }}>Historial de Auditorías</h2>
            {auditorias.length === 0 ? (
              <p style={{ color: '#666' }}>No hay auditorías realizadas aún</p>
            ) : (
              <div>
                {auditorias.map((aud) => {
                  const content = contenidos.find(c => c.id === aud.contenido_id);
                  return (
                    <div key={aud.id} style={{ padding: '0.75rem', borderBottom: '1px solid #eee' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong>{content?.titulo || 'Contenido desconocido'}</strong>
                        <span className={getScoreClass(aud.score_conformidad || 0)}>
                          {(aud.score_conformidad || 0 * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p style={{ fontSize: '0.875rem', color: '#666' }}>
                        {aud.resultado?.cumple ? '✓ Cumple' : '✗ No cumple'}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#999' }}>
                        {new Date(aud.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
