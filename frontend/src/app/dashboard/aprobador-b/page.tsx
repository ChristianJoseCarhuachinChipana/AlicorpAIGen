'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { contenidoApi, auditoriaApi } from '@/lib/api';
import { Contenido, Auditoria, AnalysisResult } from '@/types';
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
import { AuditoriaList } from '@/components/dashboard';
import { useAuth } from '@/hooks';

const ALLOWED_ROLES_APROBADOR_B: ("aprobador_b" | "admin")[] = ["aprobador_b", "admin"];

/**
 * Obtiene la clase de color según el score de conformidad
 */
function getScoreClass(score: number): string {
  if (score >= 0.7) return 'text-success';
  if (score >= 0.4) return 'text-warning';
  return 'text-danger';
}

export default function AprobadorBPage() {
  const { user, loading: authLoading } = useAuth({
    allowedRoles: ALLOWED_ROLES_APROBADOR_B,
  });

  const [contenidos, setContenidos] = useState<Contenido[]>([]);
  const [auditorias, setAuditorias] = useState<Auditoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<Contenido | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedAuditoria, setExpandedAuditoria] = useState<string | null>(null);
  const [imagenesCache, setImagenesCache] = useState<Record<string, string>>({});

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
    } finally {
      setLoading(false);
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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al analizar imagen';
      setError(errorMessage);
    } finally {
      setAnalyzing(false);
    }
  };

  const loadImagenAuditoria = async (auditoriaId: string): Promise<string | null> => {
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
    <DashboardLayout user={user} title="Content Suite - Auditor Visual" loading={authLoading}>
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
                      {analysisResult.analysis && (
                        <div className="mt-3">
                          <span className="text-sm font-medium">Análisis:</span>
                          <pre className="mt-1 text-sm whitespace-pre-wrap">
                            {analysisResult.analysis}
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
              <AuditoriaList
                auditorias={auditorias}
                contenidos={contenidos}
                expandedId={expandedAuditoria}
                onExpand={setExpandedAuditoria}
                imagenesCache={imagenesCache}
                onLoadImagen={loadImagenAuditoria}
                emptyMessage="No hay auditorías realizadas aún"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
