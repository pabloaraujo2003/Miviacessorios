-- 1. Cria a Tabela Principal de Catálogo
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "dominantColor" TEXT,
    "collectionId" TEXT,
    "features" TEXT[] NOT NULL DEFAULT '{}',
    "isBundle" BOOLEAN DEFAULT false,
    "bundledProducts" JSONB DEFAULT '[]',
    -- NULL = estoque não controlado (sempre vendável); número = quantidade disponível
    stock INTEGER CHECK (stock IS NULL OR stock >= 0)
);

-- Migração para bancos já existentes (execute uma vez no SQL Editor do Supabase):
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock INTEGER CHECK (stock IS NULL OR stock >= 0);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS "dominantColor" TEXT;

-- 2. RLS: leitura pública (loja), escrita apenas para usuários autenticados (admin)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura publica de produtos" ON public.products;
CREATE POLICY "Leitura publica de produtos"
  ON public.products FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Escrita autenticada de produtos" ON public.products;
CREATE POLICY "Escrita autenticada de produtos"
  ON public.products FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- 3. Criação automática do Bucket de Arquivos para Fotos (Se der erro execute manualmente no menu Storage do Supabase)
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true)
ON CONFLICT DO NOTHING;

-- 4. Bucket público para leitura; upload apenas autenticado
DROP POLICY IF EXISTS "Avatar images are publicly accessible." ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload an avatar." ON storage.objects;
DROP POLICY IF EXISTS "Leitura publica de imagens" ON storage.objects;
CREATE POLICY "Leitura publica de imagens"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'product-images' );

DROP POLICY IF EXISTS "Upload autenticado de imagens" ON storage.objects;
CREATE POLICY "Upload autenticado de imagens"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK ( bucket_id = 'product-images' );

-- 5. Tabela de Configurações (Hero, etc)
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura publica de settings" ON public.settings;
CREATE POLICY "Leitura publica de settings"
  ON public.settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Escrita autenticada de settings" ON public.settings;
CREATE POLICY "Escrita autenticada de settings"
  ON public.settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

INSERT INTO public.settings (id, value)
VALUES ('hero_image_url', '/src/assets/hero.png')
ON CONFLICT (id) DO NOTHING;

-- 6. Tabela de Pedidos (registro do que foi enviado pelo WhatsApp)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]',
    total TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS: qualquer visitante pode registrar um pedido (checkout público),
-- mas só a dona autenticada (Admin) pode listar/ler os pedidos.
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Registro publico de pedidos" ON public.orders;
CREATE POLICY "Registro publico de pedidos"
  ON public.orders FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Leitura autenticada de pedidos" ON public.orders;
CREATE POLICY "Leitura autenticada de pedidos"
  ON public.orders FOR SELECT
  TO authenticated
  USING (true);
