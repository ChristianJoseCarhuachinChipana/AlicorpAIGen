-- ==========================================
-- CONTENT SUITE - SCHEMA DE BASE DE DATOS
-- Ejecutar en SQL Editor de Supabase
-- ==========================================

-- Habilitar extensión vectorial
CREATE EXTENSION IF NOT EXISTS vector;

-- Tabla de usuarios con roles RBAC
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('creador', 'aprobador_a', 'aprobador_b', 'admin')),
    nombre VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Tabla de manuales de marca
CREATE TABLE IF NOT EXISTS brand_manuals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    producto VARCHAR(255),
    tono VARCHAR(100),
    público_objetivo TEXT,
    restricciones TEXT,
    contenido_markdown TEXT,
    version INTEGER DEFAULT 1,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de contenido generado
CREATE TABLE IF NOT EXISTS contenido (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_manual_id UUID REFERENCES brand_manuals(id),
    tipo VARCHAR(50) CHECK (tipo IN ('descripcion', 'guion_video', 'prompt_imagen')),
    titulo VARCHAR(255),
    contenido_text TEXT,
    estado VARCHAR(50) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado')),
    aprobado_por UUID REFERENCES users(id),
    rechazo_razon TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de auditoría multimodal
CREATE TABLE IF NOT EXISTS auditorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contenido_id UUID REFERENCES contenido(id),
    imagen_url TEXT,
    resultado JSONB,
    gemini_analysis TEXT,
    score_conformidad FLOAT,
    audited_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Políticas RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_manuals ENABLE ROW LEVEL SECURITY;
ALTER TABLE contenido ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditorias ENABLE ROW LEVEL SECURITY;

-- Políticas para users
CREATE POLICY " users can read all" ON users FOR SELECT USING (true);
CREATE POLICY " users can insert" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY " users can update" ON users FOR UPDATE USING (true);
CREATE POLICY " users can delete" ON users FOR DELETE USING (true);

-- Políticas para brand_manuals
CREATE POLICY " brand_manuals can read all" ON brand_manuals FOR SELECT USING (true);
CREATE POLICY " brand_manuals can insert" ON brand_manuals FOR INSERT WITH CHECK (true);
CREATE POLICY " brand_manuals can update" ON brand_manuals FOR UPDATE USING (true);
CREATE POLICY " brand_manuals can delete" ON brand_manuals FOR DELETE USING (true);

-- Políticas para contenido
CREATE POLICY " contenido can read all" ON contenido FOR SELECT USING (true);
CREATE POLICY " contenido can insert" ON contenido FOR INSERT WITH CHECK (true);
CREATE POLICY " contenido can update" ON contenido FOR UPDATE USING (true);
CREATE POLICY " contenido can delete" ON contenido FOR DELETE USING (true);

-- Políticas para auditorias
CREATE POLICY " auditorias can read all" ON auditorias FOR SELECT USING (true);
CREATE POLICY " auditorias can insert" ON auditorias FOR INSERT WITH CHECK (true);
CREATE POLICY " auditorias can update" ON auditorias FOR UPDATE USING (true);
CREATE POLICY " auditorias can delete" ON auditorias FOR DELETE USING (true);

-- Crear índice para búsquedas por email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Crear índice para búsquedas por estado de contenido
CREATE INDEX IF NOT EXISTS idx_contenido_estado ON contenido(estado);

-- Crear índice para búsquedas por brand_manual_id
CREATE INDEX IF NOT EXISTS idx_contenido_brand_manual ON contenido(brand_manual_id);

-- Crear índice para búsquedas por contenido_id en auditorias
CREATE INDEX IF NOT EXISTS idx_auditorias_contenido ON auditorias(contenido_id);

-- Insertar usuario de prueba (admin)
-- Password: admin123 (hash generado)
INSERT INTO users (email, password_hash, nombre, role)
VALUES (
    'admin@alicorp.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIq.z7NQe6', -- admin123
    'Administrador',
    'admin'
) ON CONFLICT (email) DO NOTHING;

-- Insertar usuarios de prueba
INSERT INTO users (email, password_hash, nombre, role)
VALUES 
    (
        'creador@alicorp.com',
        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIq.z7NQe6',
        'Creador Demo',
        'creador'
    ),
    (
        'aprobadora@alicorp.com',
        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIq.z7NQe6',
        'Aprobador A Demo',
        'aprobador_a'
    ),
    (
        'aprobadorb@alicorp.com',
        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIq.z7NQe6',
        'Aprobador B Demo',
        'aprobador_b'
    )
ON CONFLICT (email) DO NOTHING;
