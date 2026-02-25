export interface User {
  id: string;
  email: string;
  nombre: string;
  role: 'creador' | 'aprobador_a' | 'aprobador_b' | 'admin';
  is_active: boolean;
  created_at: string;
}

export interface BrandManual {
  id: string;
  nombre: string;
  producto: string;
  tono: string;
  público_objetivo: string;
  restricciones: string;
  contenido_markdown?: string;
  version: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Contenido {
  id: string;
  brand_manual_id: string;
  tipo: 'descripcion' | 'guion_video' | 'prompt_imagen';
  titulo: string;
  contenido_text?: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  aprobado_por?: string;
  rechazo_razon?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Auditoria {
  id: string;
  contenido_id: string;
  imagen_url?: string;
  resultado?: {
    cumple: boolean;
    score: number;
  };
  gemini_analysis?: string;
  score_conformidad?: number;
  audited_by?: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

/**
 * Resultado del análisis de imagen por IA (Gemini)
 */
export interface AnalysisResult {
  /** Indica si el análisis fue exitoso */
  success: boolean;
  /** Score de conformidad (0-1) */
  score: number;
  /** Análisis textual generado por la IA */
  analysis?: string;
  /** Mensaje de error si el análisis falló */
  error?: string;
  /** Auditoría creada en la base de datos */
  auditoria?: Auditoria;
}

/**
 * Estadísticas del dashboard
 */
export interface DashboardStats {
  totalManuals: number;
  totalContenidos: number;
  pendientes: number;
  aprobados: number;
  rechazados: number;
  auditorias: number;
}

/**
 * Opciones para configuración de página
 */
export interface PageConfig {
  /** Título de la página */
  title: string;
  /** Roles permitidos para acceder */
  allowedRoles?: Array<'creador' | 'aprobador_a' | 'aprobador_b' | 'admin'>;
  /** Mostrar enlace al dashboard */
  showDashboard?: boolean;
}
