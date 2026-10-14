-- 1. Cria a Tabela Principal de Catálogo
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price TEXT NOT NULL,
    "discountPercent" NUMERIC(5,2) DEFAULT NULL,
    "imageUrl" TEXT NOT NULL,
    "dominantColor" TEXT,
    "collectionId" TEXT,
    "features" TEXT[] NOT NULL DEFAULT '{}',
    "isBundle" BOOLEAN DEFAULT false,
    "bundledProducts" JSONB DEFAULT '[]',
    -- NULL = estoque não controlado (sempre vendável); número = quantidade disponível
    stock INTEGER CHECK (stock IS NULL OR stock >= 0),
    -- Data de cadastro; o catálogo é exibido do mais recente para o mais antigo
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Migração para bancos já existentes (execute uma vez no SQL Editor do Supabase):
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock INTEGER CHECK (stock IS NULL OR stock >= 0);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS "dominantColor" TEXT;
-- Desconto percentual (0-99). NULL = sem desconto
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS "discountPercent" NUMERIC(5,2) DEFAULT NULL;
-- Data de cadastro (ordenação por mais recente). Produtos já existentes recebem
-- datas escalonadas seguindo a ordem física atual, para não empatarem todos.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.products
      ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
    UPDATE public.products p
       SET created_at = now() - (o.rn * interval '1 second')
      FROM (SELECT id, row_number() OVER (ORDER BY ctid DESC) AS rn FROM public.products) o
     WHERE p.id = o.id;
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS products_created_at_idx ON public.products (created_at DESC);

-- 1b. Contas: todo usuário (cliente ou dona) tem um perfil com papel.
-- Estar autenticado NÃO dá acesso administrativo — só role = 'admin'.
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT '' CHECK (char_length(name) <= 80),
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- SECURITY DEFINER: consulta profiles sem passar pelo RLS (evita recursão nas policies)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$;

DROP POLICY IF EXISTS "Leitura do proprio perfil" ON public.profiles;
CREATE POLICY "Leitura do proprio perfil"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Edicao do proprio perfil" ON public.profiles;
CREATE POLICY "Edicao do proprio perfil"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- O cliente só pode alterar o próprio nome; o papel só muda via SQL Editor.
REVOKE ALL ON public.profiles FROM anon, authenticated;
GRANT SELECT, UPDATE (name) ON public.profiles TO authenticated;

-- Cria o perfil automaticamente no cadastro (nome vem de options.data.name do signUp)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  -- Só o nome vem dos metadados (editáveis pelo usuário); o papel é sempre 'customer'
  VALUES (NEW.id, left(COALESCE(NEW.raw_user_meta_data->>'name', ''), 80))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Usuários que já existiam antes desta migração (ex.: a conta da dona)
INSERT INTO public.profiles (id, name)
SELECT id, left(COALESCE(raw_user_meta_data->>'name', ''), 80) FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Para promover a conta da dona (execute uma vez, trocando o e-mail):
-- UPDATE public.profiles SET role = 'admin'
--  WHERE id = (SELECT id FROM auth.users WHERE email = 'email-da-dona@exemplo.com');

-- 2. RLS: leitura pública (loja), escrita apenas para admin
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura publica de produtos" ON public.products;
CREATE POLICY "Leitura publica de produtos"
  ON public.products FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Escrita autenticada de produtos" ON public.products;
DROP POLICY IF EXISTS "Escrita admin de produtos" ON public.products;
CREATE POLICY "Escrita admin de produtos"
  ON public.products FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- 3. Criação automática do Bucket de Arquivos para Fotos (Se der erro execute manualmente no menu Storage do Supabase)
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true)
ON CONFLICT DO NOTHING;

-- 4. Bucket público para leitura; upload/exclusão apenas admin
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
  WITH CHECK ( bucket_id = 'product-images' AND public.is_admin() );

DROP POLICY IF EXISTS "Exclusao autenticada de imagens" ON storage.objects;
CREATE POLICY "Exclusao autenticada de imagens"
  ON storage.objects FOR DELETE
  TO authenticated
  USING ( bucket_id = 'product-images' AND public.is_admin() );

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
DROP POLICY IF EXISTS "Escrita admin de settings" ON public.settings;
CREATE POLICY "Escrita admin de settings"
  ON public.settings FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

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

-- Pedido feito logado fica vinculado à conta (NULL = visitante sem conta)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON public.orders (user_id);

-- RLS: qualquer visitante pode registrar um pedido (checkout público), mas só
-- vinculado à própria conta. A dona (admin) lê todos; o cliente, os seus.
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Registro publico de pedidos" ON public.orders;
CREATE POLICY "Registro publico de pedidos"
  ON public.orders FOR INSERT
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

DROP POLICY IF EXISTS "Leitura autenticada de pedidos" ON public.orders;
DROP POLICY IF EXISTS "Leitura de pedidos" ON public.orders;
CREATE POLICY "Leitura de pedidos"
  ON public.orders FOR SELECT
  TO authenticated
  USING (public.is_admin() OR user_id = auth.uid());
