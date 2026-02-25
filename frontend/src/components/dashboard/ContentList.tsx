import { Contenido } from '@/types';
import { StatusBadge } from '@/components';

interface ContentListProps {
  /** Lista de contenidos a mostrar */
  contenidos: Contenido[];
  /** Contenido seleccionado actualmente */
  selectedId?: string;
  /** Callback al seleccionar un contenido */
  onSelect?: (contenido: Contenido) => void;
  /** Mensaje cuando no hay contenidos */
  emptyMessage?: string;
}

/**
 * Componente de lista de contenidos
 * Muestra una lista de contenidos con su estado y permite selección
 */
export function ContentList({ 
  contenidos, 
  selectedId, 
  onSelect,
  emptyMessage = 'No hay contenidos para mostrar'
}: ContentListProps) {
  if (contenidos.length === 0) {
    return (
      <p className="text-gray-500 text-center py-4">{emptyMessage}</p>
    );
  }

  return (
    <div className="space-y-2">
      {contenidos.map((item) => (
        <div
          key={item.id}
          onClick={() => onSelect?.(item)}
          className={`
            p-3 rounded-lg cursor-pointer transition-all duration-200
            ${selectedId === item.id 
              ? 'bg-primary/10 border border-primary/30' 
              : 'border border-gray-100 hover:border-gray-200'}
          `}
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900">{item.titulo}</span>
            <StatusBadge status={item.estado} />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-500">Tipo: {item.tipo}</span>
            <span className="text-gray-300">•</span>
            <span className="text-xs text-gray-400">
              {new Date(item.created_at).toLocaleDateString()}
            </span>
          </div>
          {item.contenido_text && (
            <p className="text-sm text-gray-400 mt-2 line-clamp-2">
              {item.contenido_text.substring(0, 150)}...
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

interface ContentDetailProps {
  /** Contenido a mostrar */
  contenido: Contenido | null;
  /** Indica si está en estado pendiente para mostrar acciones */
  showActions?: boolean;
  /** Callback al aprobar */
  onApprove?: (id: string) => void;
  /** Callback al rechazar */
  onReject?: (id: string) => void;
  /** Indica si hay una operación en progreso */
  processing?: boolean;
  /** Reason de rechazo */
  rejectReason?: string;
  /** Callback al cambiar el motivo de rechazo */
  onRejectReasonChange?: (reason: string) => void;
}

/**
 * Componente de detalle de contenido
 * Muestra los detalles de un contenido seleccionado con acciones opcionales
 */
export function ContentDetail({
  contenido,
  showActions = false,
  onApprove,
  onReject,
  processing = false,
  rejectReason = '',
  onRejectReasonChange,
}: ContentDetailProps) {
  if (!contenido) {
    return (
      <p className="text-gray-500 text-center py-4">
        Seleccione un contenido para ver los detalles
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <span className="text-sm text-gray-500">Título:</span>
        <span className="ml-2 font-medium">{contenido.titulo}</span>
      </div>
      <div>
        <span className="text-sm text-gray-500">Tipo:</span>
        <span className="ml-2">{contenido.tipo}</span>
      </div>
      <div>
        <span className="text-sm text-gray-500">Estado:</span>
        <span className="ml-2"><StatusBadge status={contenido.estado} /></span>
      </div>
      <div>
        <span className="text-sm text-gray-500 block mb-2">Contenido:</span>
        <div className="p-3 bg-gray-50 rounded-lg max-h-64 overflow-auto text-sm whitespace-pre-wrap">
          {contenido.contenido_text || 'Sin contenido'}
        </div>
      </div>

      {showActions && contenido.estado === 'pendiente' && (
        <div className="space-y-3 pt-4 border-t">
          <div className="flex gap-2">
            <button
              onClick={() => onApprove?.(contenido.id)}
              disabled={processing}
              className="px-4 py-2 bg-success text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
            >
              Aprobar
            </button>
            <button
              onClick={() => onReject?.(contenido.id)}
              disabled={processing}
              className="px-4 py-2 bg-danger text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              Rechazar
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Motivo de rechazo:
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => onRejectReasonChange?.(e.target.value)}
              placeholder="Ingrese el motivo del rechazo..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>
        </div>
      )}

      {contenido.rechazo_razon && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <span className="text-sm font-medium text-red-800">Motivo de rechazo:</span>
          <p className="text-sm text-red-700 mt-1">{contenido.rechazo_razon}</p>
        </div>
      )}
    </div>
  );
}
