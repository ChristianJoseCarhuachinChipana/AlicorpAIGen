import { Card } from '@/components';

interface StatsCardProps {
  /** Valor a mostrar */
  value: number;
  /** Etiqueta descriptiva */
  label: string;
  /** Color del valor (clase de Tailwind) */
  valueColor?: string;
  /** Si es verdadero, muestra un indicador de carga */
  loading?: boolean;
}

/**
 * Componente de tarjeta de estadísticas
 * Muestra un número grande con una etiqueta descriptiva
 */
export function StatsCard({ value, label, valueColor = 'text-primary', loading }: StatsCardProps) {
  return (
    <Card className="text-center">
      {loading ? (
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
        </div>
      ) : (
        <>
          <div className={`text-3xl font-bold ${valueColor}`}>{value}</div>
          <div className="text-gray-500 text-sm mt-1">{label}</div>
        </>
      )}
    </Card>
  );
}

interface StatGridProps {
  children: React.ReactNode;
}

/**
 * Grid de estadísticas
 * Contenedor para múltiples StatsCard
 */
export function StatGrid({ children }: StatGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {children}
    </div>
  );
}
