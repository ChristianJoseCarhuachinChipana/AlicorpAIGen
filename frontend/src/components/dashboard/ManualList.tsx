import { BrandManual } from '@/types';
import { Button } from '@/components';

interface ManualListProps {
  /** Lista de manuales a mostrar */
  manuales: BrandManual[];
  /** Callback al eliminar un manual */
  onDelete?: (id: string) => void;
  /** Mensaje cuando no hay manuales */
  emptyMessage?: string;
  /** Indica si hay operación en progreso */
  loading?: boolean;
}

/**
 * Componente de lista de manuales de marca
 * Muestra los manuales existentes con opción de eliminación
 */
export function ManualList({ 
  manuales, 
  onDelete,
  emptyMessage = 'No hay manuales creados aún',
  loading = false
}: ManualListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse p-3 border border-gray-100 rounded-lg">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (manuales.length === 0) {
    return (
      <p className="text-gray-500 text-center py-4">{emptyMessage}</p>
    );
  }

  return (
    <div className="space-y-3">
      {manuales.map((manual) => (
        <div 
          key={manual.id} 
          className="p-3 border border-gray-100 rounded-lg flex items-center justify-between"
        >
          <div>
            <div className="font-semibold text-gray-900">{manual.nombre}</div>
            <p className="text-sm text-gray-500">{manual.producto}</p>
            <p className="text-sm text-gray-400">Tono: {manual.tono}</p>
          </div>
          {onDelete && (
            <Button 
              onClick={() => onDelete(manual.id)}
              variant="danger"
              size="sm"
            >
              Eliminar
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
