-- 1. Cria a Tabela Principal de Catálogo
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "collectionId" TEXT,
    "features" TEXT[] NOT NULL DEFAULT '{}',
    "isBundle" BOOLEAN DEFAULT false,
    "bundledProducts" JSONB DEFAULT '[]'
);

-- 2. Desabilitar restrições RLS (Row Level Security) para o protótipo público avançar, ou crie as politicas de ALLOW caso queira manter habilitado. 
-- *Recomendável mudar para restrito (authenticated) em produção.
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
-- Se preferir RLS ativado, rode as 2 linhas abaixo:
-- ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Permite acesso publico" ON public.products FOR ALL USING (true);


-- 3. Criação automática do Bucket de Arquivos para Fotos (Se der erro execute manualmente no menu Storage do Supabase)
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true)
ON CONFLICT DO NOTHING;

-- 4. Setar o bucket de imagens como Público para download
CREATE POLICY "Avatar images are publicly accessible."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'product-images' );

CREATE POLICY "Anyone can upload an avatar."
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'product-images' );

-- 5. Tabela de Configurações (Hero, etc)
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;

INSERT INTO public.settings (id, value) 
VALUES ('hero_image_url', '/src/assets/hero.png')
ON CONFLICT (id) DO NOTHING;
