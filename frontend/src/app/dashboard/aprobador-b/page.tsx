'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { authApi, contenidoApi, auditoriaApi } from '@/lib/api';
import { User, Contenido, Auditoria } from '@/types';
import { 
  DashboardLayout, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Button, 
  Select,
  Alert,
  Badge 
} from '@/components';

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
  const [expandedAuditoria, setExpandedAuditoria] = useState<string | null>(null);
  const [imagenesCache, setImagenesCache] = useState<Record<string, string>>({});
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

  const getScoreClass = (score: number) => {
    if (score >= 0.7) return 'text-success';
    if (score >= 0.4) return 'text-warning';
    return 'text-danger';
  };

  const loadImagenAuditoria = async (auditoriaId: string) => {
    if (imagenesCache[auditoriaId]) {
      return imagenesCache[auditoriaId];
    }
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auditoria/${auditoriaId}/imagen`, {
        headers: {
          'Authorization': `Bearer ${Cookies.get('access_token')}`
        }
      });
      if (response.ok) {
        let imagenBase64 = await response.text();
        imagenBase64 = imagenBase64.replace(/^"|"$/g, '');
        setImagenesCache(prev => ({ ...prev, [auditoriaId]: imagenBase64 }));
        return imagenBase64;
      }
      return null;
    } catch (err) {
      console.error('Error loading imagen:', err);
      return null;
    }
  };

  return (
    <DashboardLayout user={user} title="Content Suite - Auditor Visual" loading={loading}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Panel de Auditoría Visual</h1>
        
        {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert variant="success" onClose={() => setSuccess('')}>{success}</Alert>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Nueva Auditoría</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Select
                  label="Contenido a auditar"
                  value={selectedContent?.id || ''}
                  onChange={(e) => {
                    const content = contenidos.find(c => c.id === e.target.value);
                    setSelectedContent(content || null);
                    setAnalysisResult(null);
                  }}
                  placeholder="Seleccionar contenido..."
                  options={contenidos.map((item) => ({ 
                    value: item.id, 
                    label: `${item.titulo} (${item.tipo})` 
                  }))}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Subir imagen para auditoría
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      setSelectedImage(e.target.files?.[0] || null);
                      setAnalysisResult(null);
                    }}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>

                <Button 
                  onClick={handleAnalyze}
                  disabled={analyzing || !selectedContent || !selectedImage}
                  className="w-full"
                >
                  {analyzing ? 'Analizando con IA...' : 'Analizar Imagen'}
                </Button>

                {analysisResult && (
                  <div className="mt-6 p-4 rounded-lg border">
                    <h3 className="font-semibold mb-3">Resultado del Análisis</h3>
                    <div className={`
                      p-4 rounded-lg
                      ${analysisResult.score >= 0.7 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}
                    `}>
                      <p className="text-lg">
                        <span className="font-medium">Score de Conformidad: </span>
                        <span className={getScoreClass(analysisResult.score)}>
                          {(analysisResult.score * 100).toFixed(0)}%
                        </span>
                      </p>
                      {analysisResult.analisis && (
                        <div className="mt-3">
                          <span className="text-sm font-medium">Análisis:</span>
                          <pre className="mt-1 text-sm whitespace-pre-wrap">
                            {analysisResult.analisis}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historial de Auditorías</CardTitle>
            </CardHeader>
            <CardContent>
              {auditorias.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay auditorías realizadas aún</p>
              ) : (
                <div className="space-y-3">
                  {auditorias.map((aud) => {
                    const content = contenidos.find(c => c.id === aud.contenido_id);
                    const isExpanded = expandedAuditoria === aud.id;
                    return (
                      <div 
                        key={aud.id} 
                        className={`border rounded-lg overflow-hidden transition-all duration-200 ${isExpanded ? 'border-primary/50' : 'border-gray-100'}`}
                      >
                        <div 
                          className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => setExpandedAuditoria(isExpanded ? null : aud.id)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">
                              {content?.titulo || 'Contenido desconocido'}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className={getScoreClass(aud.score_conformidad || 0)}>
                                {((aud.score_conformidad || 0) * 100).toFixed(0)}%
                              </span>
                              <svg 
                                className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={aud.resultado?.cumple ? 'success' : 'danger'}>
                              {aud.resultado?.cumple ? '✓ Cumple' : '✗ No cumple'}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              {new Date(aud.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="p-3 bg-gray-50 border-t border-gray-100 space-y-4 max-h-96 overflow-y-auto">
                            {content && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Contenido Auditado</h4>
                                <div className="p-3 bg-white rounded-lg border border-gray-200">
                                  <p className="font-medium text-gray-900">{content.titulo}</p>
                                  <p className="text-sm text-gray-500">Tipo: {content.tipo}</p>
                                  {content.contenido_text && (
                                    <div className="mt-2 text-sm text-gray-600">
                                      <span className="font-medium">Contenido:</span>
                                      <div className="mt-1 max-h-32 overflow-y-auto p-2 bg-gray-50 rounded">
                                        <p className="whitespace-pre-wrap">{content.contenido_text}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Imagen Auditada</h4>
                              <div className="p-3 bg-white rounded-lg border border-gray-200">
                                <div className="w-full overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center min-h-[100px]">
                                  {imagenesCache[aud.id] ? (
                                    <img 
                                      src={imagenesCache[aud.id]} 
                                      alt="Auditada" 
                                      className="max-w-full h-auto max-h-64 object-contain"
                                    />
                                  ) : (
                                    <Button
                                      onClick={async () => await loadImagenAuditoria(aud.id)}
                                      variant="outline"
                                      size="sm"
                                    >
                                      Cargar Imagen
                                    </Button>
                                  )}
                                </div>
                                {imagenesCache[aud.id] && (
                                  <a 
                                    href={imagenesCache[aud.id]} 
                                    download={`auditoria-${aud.id}.jpg`}
                                    className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-dark transition-colors mt-2"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Descargar Imagen
                                  </a>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Resultado del Análisis</h4>
                              <div className={`p-3 rounded-lg ${(aud.score_conformidad || 0) >= 0.7 ? 'bg-green-50' : 'bg-red-50'}`}>
                                <p className="text-sm">
                                  <span className="font-medium">Score de Conformidad: </span>
                                  <span className={getScoreClass(aud.score_conformidad || 0)}>
                                    {((aud.score_conformidad || 0) * 100).toFixed(0)}%
                                  </span>
                                </p>
                                {aud.gemini_analysis && (
                                  <div className="mt-2">
                                    <span className="text-sm font-medium">Análisis:</span>
                                    <pre className="mt-1 text-sm whitespace-pre-wrap text-gray-700 max-h-32 overflow-y-auto">
                                      {aud.gemini_analysis}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
