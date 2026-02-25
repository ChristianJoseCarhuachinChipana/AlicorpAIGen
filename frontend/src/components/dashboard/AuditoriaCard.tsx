import { useState } from 'react';
import { Auditoria, Contenido } from '@/types';
import { Badge, Button } from '@/components';

interface AuditoriaCardProps {
  /** Auditoría a mostrar */
  auditoria: Auditoria;
  /** Contenido asociado a la auditoría */
  contenido?: Contenido;
  /** Indica si la auditoría está expandida */
  isExpanded: boolean;
  /** Callback al hacer click para expandir/colapsar */
  onToggle: () => void;
  /** Cache de imágenes */
  imagenesCache: Record<string, string>;
  /** Callback para cargar imagen */
  onLoadImagen: (auditoriaId: string) => Promise<string | null>;
}

/**
 * Obtiene la clase de color según el score de conformidad
 */
function getScoreColor(score: number): string {
  if (score >= 0.7) return 'text-success';
  if (score >= 0.4) return 'text-warning';
  return 'text-danger';
}

/**
 * Componente de tarjeta de auditoría
 * Muestra una auditoría con posibilidad de expandir para ver detalles
 */
export function AuditoriaCard({
  auditoria,
  contenido,
  isExpanded,
  onToggle,
  imagenesCache,
  onLoadImagen,
}: AuditoriaCardProps) {
  const score = auditoria.score_conformidad || 0;

  return (
    <div 
      className={`border rounded-lg overflow-hidden transition-all duration-200 ${isExpanded ? 'border-primary/50' : 'border-gray-100'}`}
    >
      {/* Header - siempre visible */}
      <div 
        className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-900">
            {contenido?.titulo || 'Contenido desconocido'}
          </span>
          <div className="flex items-center gap-2">
            <span className={getScoreColor(score)}>
              {(score * 100).toFixed(0)}%
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
          <Badge variant={auditoria.resultado?.cumple ? 'success' : 'danger'}>
            {auditoria.resultado?.cumple ? '✓ Cumple' : '✗ No cumple'}
          </Badge>
          <span className="text-xs text-gray-400">
            {new Date(auditoria.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Contenido expandido */}
      {isExpanded && (
        <div className="p-3 bg-gray-50 border-t border-gray-100 space-y-4 max-h-96 overflow-y-auto">
          {/* Contenido Auditado */}
          {contenido && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Contenido Auditado</h4>
              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <p className="font-medium text-gray-900">{contenido.titulo}</p>
                <p className="text-sm text-gray-500">Tipo: {contenido.tipo}</p>
                {contenido.contenido_text && (
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">Contenido:</span>
                    <div className="mt-1 max-h-32 overflow-y-auto p-2 bg-gray-50 rounded">
                      <p className="whitespace-pre-wrap">{contenido.contenido_text}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Imagen Auditada */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Imagen Auditada</h4>
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <div className="w-full overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center min-h-[100px]">
                {imagenesCache[auditoria.id] ? (
                  <img 
                    src={imagenesCache[auditoria.id]} 
                    alt="Auditada" 
                    className="max-w-full h-auto max-h-64 object-contain"
                  />
                ) : (
                  <Button
                    onClick={async () => await onLoadImagen(auditoria.id)}
                    variant="outline"
                    size="sm"
                  >
                    Cargar Imagen
                  </Button>
                )}
              </div>
              {imagenesCache[auditoria.id] && (
                <a 
                  href={imagenesCache[auditoria.id]} 
                  download={`auditoria-${auditoria.id}.jpg`}
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

          {/* Resultado del Análisis */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Resultado del Análisis</h4>
            <div className={`p-3 rounded-lg ${score >= 0.7 ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className="text-sm">
                <span className="font-medium">Score de Conformidad: </span>
                <span className={getScoreColor(score)}>
                  {(score * 100).toFixed(0)}%
                </span>
              </p>
              {auditoria.gemini_analysis && (
                <div className="mt-2">
                  <span className="text-sm font-medium">Análisis:</span>
                  <pre className="mt-1 text-sm whitespace-pre-wrap text-gray-700 max-h-32 overflow-y-auto">
                    {auditoria.gemini_analysis}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface AuditoriaListProps {
  /** Lista de auditorías */
  auditorias: Auditoria[];
  /** Mapa de contenidos */
  contenidos: Contenido[];
  /** ID de auditoría expandida */
  expandedId: string | null;
  /** Callback al expandir una auditoría */
  onExpand: (id: string | null) => void;
  /** Cache de imágenes */
  imagenesCache: Record<string, string>;
  /** Callback para cargar imagen */
  onLoadImagen: (auditoriaId: string) => Promise<string | null>;
  /** Mensaje cuando no hay auditorías */
  emptyMessage?: string;
}

/**
 * Componente de lista de auditorías
 * Muestra múltiples auditorías con expansión
 */
export function AuditoriaList({
  auditorias,
  contenidos,
  expandedId,
  onExpand,
  imagenesCache,
  onLoadImagen,
  emptyMessage = 'No hay auditorías realizadas aún'
}: AuditoriaListProps) {
  if (auditorias.length === 0) {
    return (
      <p className="text-gray-500 text-center py-4">{emptyMessage}</p>
    );
  }

  return (
    <div className="space-y-3">
      {auditorias.map((aud) => {
        const contenido = contenidos.find(c => c.id === aud.contenido_id);
        return (
          <AuditoriaCard
            key={aud.id}
            auditoria={aud}
            contenido={contenido}
            isExpanded={expandedId === aud.id}
            onToggle={() => onExpand(expandedId === aud.id ? null : aud.id)}
            imagenesCache={imagenesCache}
            onLoadImagen={onLoadImagen}
          />
        );
      })}
    </div>
  );
}
