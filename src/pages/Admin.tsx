import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase, hasSupabaseKeys, mapProductRecord } from '../lib/supabase';
import { Header } from '../components/Header';
import { BottomNavBar } from '../components/BottomNavBar';
import type { Product } from '../data/mockData';
import { CATEGORIES } from '../data/mockData';
import { Trash2, Edit2, UploadCloud, Plus, Minus, LogOut, KeyRound } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';

interface ProductFormData {
  name: string;
  category: string;
  price: string;
  imageUrl: string;
  collectionId: string;
  features: string;
  stock: string;
  isBundle: boolean;
}

interface BundledItemFormData {
  id: string;
  name: string;
  price: string;
}

interface ProductPayload {
  name: string;
  category: string;
  price: string;
  imageUrl: string;
  collectionId: string;
  features: string[];
  stock: number | null;
  isBundle: boolean;
  bundledProducts: NonNullable<Product['bundledProducts']>;
}

interface StatusMessage {
  text: string;
  kind: 'success' | 'error';
}

const EMPTY_FORM: ProductFormData = {
  name: '',
  category: 'rings',
  price: 'R$ ',
  imageUrl: '',
  collectionId: '',
  features: '',
  stock: '',
  isBundle: false
};

const INPUT_CLASS = 'w-full bg-surface border hairline px-4 py-3 text-base focus:border-primary focus:outline-none transition-colors';
const LABEL_CLASS = 'block font-label text-[0.6rem] uppercase tracking-[0.25em] text-on-surface-variant mb-2';

const categoryLabelOf = (id: string): string => CATEGORIES.find(c => c.id === id)?.label ?? id;

const FEATURE_OPTIONS = ['Prata 925', 'Banhado a Ródio', 'Banhado a Ouro', 'Esculpido', 'Polido', 'Geométrico'];

const parseFeatures = (value: string): string[] => value.split(',').map(f => f.trim()).filter(Boolean);

const withCurrencyPrefix = (value: string): string => `R$ ${value.replace(/R\$\s*/g, '').trimStart()}`;

export const Admin: React.FC = () => {
  const isMountedRef = useRef(true);
  const formSectionRef = useRef<HTMLElement | null>(null);
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auth State
  const [session, setSession] = useState<Session | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isSessionChecked, setIsSessionChecked] = useState(false);

  // DB State
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState('');
  const [formData, setFormData] = useState<ProductFormData>(EMPTY_FORM);
  const [bundledItems, setBundledItems] = useState<BundledItemFormData[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [uploadingHero, setUploadingHero] = useState(false);
  const [status, setStatus] = useState<StatusMessage | null>(null);

  const showStatus = useCallback((text: string, kind: StatusMessage['kind'] = 'success') => {
    if (!isMountedRef.current) return;
    setStatus({ text, kind });
    if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    statusTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) setStatus(null);
    }, 3200);
  }, []);

  const fetchProducts = useCallback(async (signal?: AbortSignal): Promise<void> => {
    await Promise.resolve();

    if (!isMountedRef.current) {
      return;
    }

    setLoading(true);
    if (!hasSupabaseKeys) {
      setLoading(false);
      return;
    }

    const query = supabase.from('products').select('*');
    const { data, error } = signal ? await query.abortSignal(signal) : await query;
    if (signal?.aborted || !isMountedRef.current) {
      return;
    }

    if (!error && data) {
      setProducts(data.map(mapProductRecord).filter((product): product is Product => product !== null));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    const abortController = new AbortController();

    const initializeSession = async (): Promise<void> => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!isMountedRef.current || abortController.signal.aborted) {
        return;
      }
      setSession(currentSession);
      setIsSessionChecked(true);
    };

    const fetchHeroImage = async (): Promise<void> => {
      if (!hasSupabaseKeys) {
        return;
      }

      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('id', 'hero_image_url')
        .abortSignal(abortController.signal)
        .single();

      if (!isMountedRef.current || abortController.signal.aborted) {
        return;
      }

      if (data && typeof data.value === 'string') {
        setHeroImageUrl(data.value);
      }
    };

    void initializeSession();
    void fetchHeroImage();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!isMountedRef.current) {
        return;
      }
      setSession(currentSession);
      setIsSessionChecked(true);
    });

    return () => {
      isMountedRef.current = false;
      abortController.abort();
      subscription.unsubscribe();
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!session) {
      return;
    }

    const abortController = new AbortController();
    queueMicrotask(() => {
      void fetchProducts(abortController.signal);
    });

    return () => abortController.abort();
  }, [fetchProducts, session]);

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.item(0);
    if (!file || !hasSupabaseKeys) return;
    const fileExt = file.name.split('.').pop();
    const fileName = `hero_${Math.random()}.${fileExt}`;
    const filePath = `mivie/${fileName}`;

    setUploadingHero(true);
    const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, file);

    if (!uploadError) {
      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(filePath);
      const newUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from('settings')
        .upsert({ id: 'hero_image_url', value: newUrl }, { onConflict: 'id' });

      if (!updateError) {
        if (isMountedRef.current) {
          setHeroImageUrl(newUrl);
        }
        showStatus('Foto do hero atualizada');
      } else {
        console.error('Erro settings:', updateError);
        showStatus(`Erro ao salvar no banco: ${updateError.message}`, 'error');
      }
    } else {
      showStatus('Erro ao enviar a imagem do hero', 'error');
    }
    if (isMountedRef.current) {
      setUploadingHero(false);
    }
  };

  const handleLogin = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsAuthLoading(true);
    setAuthError('');

    const { error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: authPassword,
    });

    if (!isMountedRef.current) {
      return;
    }

    if (error) {
      setAuthError(error.message);
    }
    setIsAuthLoading(false);
  };

  const handleLogout = async (): Promise<void> => {
    await supabase.auth.signOut();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : (name === 'price' ? withCurrencyPrefix(value) : value);
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const featureOptions = useMemo(() => {
    const options = new Set(FEATURE_OPTIONS);
    products.forEach(p => (p.features ?? []).forEach(f => options.add(f)));
    parseFeatures(formData.features).forEach(f => options.add(f));
    return [...options];
  }, [products, formData.features]);

  const toggleFeature = (feature: string): void => {
    setFormData(prev => {
      const current = parseFeatures(prev.features);
      const next = current.includes(feature) ? current.filter(f => f !== feature) : [...current, feature];
      return { ...prev, features: next.join(', ') };
    });
  };

  const addBundledItem = (): void => {
    setBundledItems(prev => [...prev, { id: crypto.randomUUID(), name: '', price: 'R$ ' }]);
  };

  const updateBundledItem = (index: number, field: 'name' | 'price', value: string): void => {
    setBundledItems(prev => prev.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [field]: field === 'price' ? withCurrencyPrefix(value) : value } : item
    )));
  };

  const removeBundledItem = (index: number): void => {
    setBundledItems(prev => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.item(0);
    if (!file || !hasSupabaseKeys) return;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `mivie/${fileName}`;

    setUploadingImage(true);
    const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, file);

    if (!uploadError) {
      const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
      if (isMountedRef.current) {
        setFormData(prev => ({ ...prev, imageUrl: data.publicUrl }));
      }
    } else {
      showStatus('Erro ao enviar a imagem', 'error');
    }
    if (isMountedRef.current) {
      setUploadingImage(false);
    }
  };

  const startEdit = (product: Product): void => {
    setIsEditing(true);
    setCurrentId(product.id);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      imageUrl: product.imageUrl,
      collectionId: product.collectionId || '',
      features: product.features?.join(', ') ?? '',
      stock: product.stock != null ? String(product.stock) : '',
      isBundle: product.isBundle || false
    });
    setBundledItems(product.bundledProducts?.map(p => ({ id: p.id, name: p.name, price: p.price })) ?? []);
    formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const resetForm = (): void => {
    setIsEditing(false);
    setCurrentId('');
    setFormData(EMPTY_FORM);
    setBundledItems([]);
  };

  const submitForm = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!hasSupabaseKeys) return;
    const features = parseFeatures(formData.features);
    if (features.length === 0) {
      showStatus('Selecione ao menos uma tag', 'error');
      return;
    }

    const payload: ProductPayload = {
      name: formData.name,
      category: formData.category,
      price: formData.price,
      imageUrl: formData.imageUrl,
      collectionId: formData.collectionId,
      features,
      stock: formData.stock.trim() === '' ? null : Math.max(0, Math.floor(Number(formData.stock)) || 0),
      isBundle: formData.isBundle,
      bundledProducts: formData.isBundle ? bundledItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        features
      })) : []
    };

    if (isEditing) {
      const { error } = await supabase.from('products').update(payload).eq('id', currentId);
      if (error) {
        console.error('Erro ao atualizar:', error);
        showStatus(`Erro ao atualizar: ${error.message}`, 'error');
        return;
      }
    } else {
      const { error } = await supabase.from('products').insert([payload]);
      if (error) {
        console.error('Erro ao inserir:', error);
        showStatus(`Erro ao inserir: ${error.message}`, 'error');
        return;
      }
    }

    if (!isMountedRef.current) {
      return;
    }

    resetForm();
    void fetchProducts();
    showStatus('Peça salva no catálogo');
  };

  const deleteProduct = async (id: string): Promise<void> => {
    if (!id) {
      return;
    }

    if (confirm('Deseja mesmo excluir esta jóia do catálogo?') && hasSupabaseKeys) {
      await supabase.from('products').delete().eq('id', id);
      if (isMountedRef.current) {
        showStatus('Peça removida do catálogo');
        void fetchProducts();
      }
    }
  };

  const adjustStock = async (product: Product, delta: number): Promise<void> => {
    if (product.stock == null || !hasSupabaseKeys) return;
    const previousStock = product.stock;
    const newStock = Math.max(0, previousStock + delta);
    if (newStock === previousStock) return;

    navigator.vibrate?.(30);
    setProducts(prev => prev.map(p => (p.id === product.id ? { ...p, stock: newStock } : p)));

    const { error } = await supabase.from('products').update({ stock: newStock }).eq('id', product.id);
    if (error && isMountedRef.current) {
      setProducts(prev => prev.map(p => (p.id === product.id ? { ...p, stock: previousStock } : p)));
      showStatus('Erro ao atualizar estoque', 'error');
    }
  };

  if (!isSessionChecked) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex items-center justify-center">
        <p className="animate-pulse font-label text-[0.65rem] uppercase tracking-[0.3em] text-on-surface-variant">Carregando sessão</p>
      </div>
    );
  }

  // --- LOGIN VIEW ---
  if (!session) {
    return (
      <div className="min-h-screen overflow-x-clip bg-background text-on-surface">
        <Header />
        <main className="mx-auto flex max-w-7xl items-center justify-center px-4 pb-28 pt-32 md:px-8">
          <div className="animate-fade-up w-full max-w-md border hairline bg-surface-container-lowest p-8 sm:p-10">
            <div className="mb-10 text-center">
              <KeyRound className="mx-auto mb-6 h-8 w-8 stroke-1 text-primary" />
              <p className="font-label text-[0.65rem] uppercase tracking-[0.35em] text-on-surface-variant">
                Acesso Privado
              </p>
              <h1 className="mt-3 font-headline italic text-3xl">Painel Mivi</h1>
              <div className="mx-auto mt-5 h-px w-12 bg-primary opacity-40" />
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {authError && (
                <div className="border hairline border-error/30 bg-error/5 px-4 py-3 font-label text-xs text-error">
                  Falha: {authError}
                </div>
              )}
              <div>
                <label htmlFor="admin-email" className={LABEL_CLASS}>E-mail</label>
                <input
                  id="admin-email"
                  required
                  type="email"
                  autoComplete="email"
                  value={authEmail}
                  onChange={e => setAuthEmail(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label htmlFor="admin-password" className={LABEL_CLASS}>Senha</label>
                <input
                  id="admin-password"
                  required
                  type="password"
                  autoComplete="current-password"
                  value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>

              <button
                type="submit"
                disabled={isAuthLoading}
                className="interactive-surface w-full bg-primary py-4 font-label text-xs uppercase tracking-[0.2em] text-on-primary active:bg-primary-dim disabled:opacity-50"
              >
                {isAuthLoading ? 'Autenticando...' : 'Liberar Painel'}
              </button>
            </form>
          </div>
        </main>
        <BottomNavBar />
      </div>
    );
  }

  // --- DASHBOARD VIEW ---
  return (
    <div className="min-h-screen overflow-x-clip bg-background text-on-surface">
      <Header />

      {status && (
        <div
          role="status"
          className={`fixed bottom-24 left-1/2 z-[70] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 border px-5 py-3 text-center font-label text-[0.65rem] uppercase tracking-[0.2em] shadow-lg backdrop-blur-md animate-fade-up md:bottom-8 ${
            status.kind === 'error'
              ? 'border-error/30 bg-error/10 text-error'
              : 'border-primary/20 bg-surface-container-lowest/95 text-on-surface'
          }`}
        >
          {status.text}
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 pb-32 pt-24 md:px-8">
        <div className="animate-fade-up mb-12 flex items-end justify-between border-b hairline pb-6">
          <div>
            <p className="font-label text-[0.65rem] uppercase tracking-[0.35em] text-on-surface-variant">
              Nº 04 <span className="mx-2 opacity-40">—</span> Administração
            </p>
            <h1 className="mt-3 font-headline italic text-3xl sm:text-4xl">Painel Mivi</h1>
          </div>
          <button
            onClick={handleLogout}
            type="button"
            aria-label="Desconectar do painel"
            className="interactive-icon h-11 w-11 shrink-0 rounded-full text-on-surface-variant active:bg-error/10 active:text-error"
          >
            <LogOut className="h-5 w-5 stroke-[1.5]" />
          </button>
        </div>

        {/* Seção 01 — Banner Hero */}
        <section className="animate-fade-up mb-14" style={{ animationDelay: '80ms' }}>
          <div className="mb-6 flex items-baseline gap-2">
            <span className="font-body text-[0.6rem] tabular-nums text-primary">01</span>
            <span aria-hidden="true" className="h-px w-6 self-center bg-outline-variant/60" />
            <h2 className="font-headline italic text-xl">Banner da Página Inicial</h2>
          </div>
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <div className="relative aspect-[21/9] w-full overflow-hidden bg-surface-variant md:w-1/2">
              {heroImageUrl && (
                <img src={heroImageUrl} className="h-full w-full object-cover" alt="Banner atual da página inicial" />
              )}
              {uploadingHero && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <span className="animate-pulse font-label text-[0.65rem] uppercase tracking-[0.3em] text-white">Atualizando</span>
                </div>
              )}
              <div aria-hidden="true" className="pointer-events-none absolute inset-2 border border-white/25" />
            </div>
            <div className="flex-1 space-y-4">
              <p className="font-body text-sm font-light text-on-surface-variant">
                Esta imagem aparece no topo da loja. Prefira fotos horizontais, claras e com o centro limpo — o título fica sobre ela.
              </p>
              <label className="interactive-surface inline-flex w-full cursor-pointer items-center justify-center gap-2 bg-primary px-6 py-4 font-label text-xs uppercase tracking-[0.2em] text-on-primary active:bg-primary-dim sm:w-auto">
                <UploadCloud className="h-4 w-4" />
                {uploadingHero ? 'Enviando...' : 'Trocar Foto do Hero'}
                <input type="file" className="hidden" accept="image/*" onChange={handleHeroUpload} disabled={uploadingHero} aria-label="Enviar foto do hero" />
              </label>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Seção 02 — Formulário */}
          <section ref={formSectionRef} className="animate-fade-up h-fit scroll-mt-24 lg:col-span-1" style={{ animationDelay: '160ms' }}>
            <div className="mb-6 flex items-baseline gap-2">
              <span className="font-body text-[0.6rem] tabular-nums text-primary">02</span>
              <span aria-hidden="true" className="h-px w-6 self-center bg-outline-variant/60" />
              <h2 className="font-headline italic text-xl">{isEditing ? 'Atualizar Jóia' : 'Nova Jóia'}</h2>
            </div>

            <form onSubmit={submitForm} className="space-y-5 border hairline bg-surface-container-lowest p-5 sm:p-6">
              <div>
                <span className={LABEL_CLASS}>Foto do Produto</span>
                {formData.imageUrl ? (
                  <div className="relative mb-2">
                    <img src={formData.imageUrl} className="h-44 w-full object-cover" alt={`Prévia de ${formData.name || 'produto'}`} />
                    <button
                      type="button"
                      aria-label="Remover foto do produto"
                      onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                      className="interactive-icon absolute right-2 top-2 h-10 w-10 rounded-full bg-error text-on-error"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex h-36 cursor-pointer flex-col items-center justify-center border border-dashed hairline transition-colors active:bg-surface-variant/30">
                    {uploadingImage ? (
                      <span className="animate-pulse font-label text-[0.65rem] uppercase tracking-[0.25em] text-on-surface-variant">Enviando</span>
                    ) : (
                      <>
                        <UploadCloud className="mb-2 h-7 w-7 stroke-1 text-outline" />
                        <span className="font-label text-[0.65rem] uppercase tracking-[0.2em] text-outline">Enviar Foto</span>
                      </>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} aria-label="Enviar foto do produto" />
                  </label>
                )}
              </div>

              <div>
                <label htmlFor="product-name" className={LABEL_CLASS}>Nome da Jóia</label>
                <input id="product-name" required type="text" name="name" value={formData.name} onChange={handleInputChange} className={INPUT_CLASS} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="product-price" className={LABEL_CLASS}>Preço</label>
                  <input id="product-price" required placeholder="R$ 150,00" type="text" inputMode="decimal" name="price" value={formData.price} onChange={handleInputChange} className={INPUT_CLASS} />
                </div>
                <div>
                  <label htmlFor="product-stock" className={LABEL_CLASS}>Estoque</label>
                  <input id="product-stock" type="number" min="0" step="1" inputMode="numeric" placeholder="Livre" name="stock" value={formData.stock} onChange={handleInputChange} className={INPUT_CLASS} />
                </div>
              </div>

              <div>
                <label htmlFor="product-category" className={LABEL_CLASS}>Categoria</label>
                <select id="product-category" name="category" value={formData.category} onChange={handleInputChange} className={INPUT_CLASS}>
                  <option value="rings">Anéis</option>
                  <option value="earrings">Brincos</option>
                  <option value="necklaces">Colares</option>
                  <option value="bracelets">Pulseiras</option>
                </select>
              </div>

              <div>
                <span className={LABEL_CLASS}>Tags (toque para selecionar)</span>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Tags do produto">
                  {featureOptions.map(feature => {
                    const isSelected = parseFeatures(formData.features).includes(feature);
                    return (
                      <button
                        key={feature}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => toggleFeature(feature)}
                        className={`mobile-tap-highlight touch-manipulation border px-3 py-2 font-label text-[0.6rem] uppercase tracking-[0.15em] transition-colors active:scale-95 ${
                          isSelected
                            ? 'border-primary bg-primary text-on-primary'
                            : 'hairline bg-surface text-on-surface-variant'
                        }`}
                      >
                        {feature}
                      </button>
                    );
                  })}
                </div>
              </div>

              <p className="font-body text-[0.7rem] font-light text-outline">
                Estoque vazio = peça sempre disponível, sem controle de quantidade.
              </p>

              <div className="flex items-center gap-3 border-t hairline pt-4">
                <input
                  type="checkbox"
                  id="isBundle"
                  name="isBundle"
                  checked={formData.isBundle}
                  onChange={handleInputChange}
                  className="h-5 w-5 accent-primary"
                />
                <label htmlFor="isBundle" className="font-label text-[0.6rem] uppercase tracking-[0.2em]">Foto com múltiplos produtos</label>
              </div>

              {formData.isBundle && (
                <div className="space-y-4 border-l-2 border-primary/20 py-2 pl-4">
                  <div className="flex items-center justify-between">
                    <span className="font-label text-[0.6rem] uppercase tracking-[0.2em]">Produtos na foto</span>
                    <button
                      type="button"
                      aria-label="Adicionar item ao conjunto"
                      onClick={addBundledItem}
                      className="interactive-text font-label text-[0.6rem] uppercase tracking-[0.2em] text-primary"
                    >
                      + Adicionar
                    </button>
                  </div>

                  {bundledItems.map((item, index) => (
                    <div key={item.id} className="flex items-start gap-2 bg-surface-variant/20 p-2">
                      <div className="flex-1 space-y-2">
                        <input
                          aria-label={`Nome do item ${index + 1}`}
                          placeholder="Nome do Item"
                          value={item.name}
                          onChange={(e) => updateBundledItem(index, 'name', e.target.value)}
                          className="w-full border hairline bg-surface px-3 py-2 text-base focus:border-primary focus:outline-none"
                        />
                        <input
                          aria-label={`Preço do item ${index + 1}`}
                          placeholder="Preço (Ex: R$ 89,00)"
                          inputMode="decimal"
                          value={item.price}
                          onChange={(e) => updateBundledItem(index, 'price', e.target.value)}
                          className="w-full border hairline bg-surface px-3 py-2 text-base focus:border-primary focus:outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        aria-label={`Remover item ${item.name || index + 1}`}
                        onClick={() => removeBundledItem(index)}
                        className="interactive-icon h-10 w-10 text-error opacity-60 active:opacity-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  {bundledItems.length === 0 && (
                    <p className="font-body text-[0.7rem] font-light italic text-on-surface-variant">Clique em adicionar para listar os itens desta foto.</p>
                  )}
                </div>
              )}

              <button type="submit" disabled={uploadingImage} className="interactive-surface flex w-full items-center justify-center gap-2 bg-primary py-4 font-label text-xs uppercase tracking-[0.2em] text-on-primary active:bg-primary-dim disabled:opacity-50">
                {isEditing ? <Edit2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {isEditing ? 'Salvar Edição' : 'Publicar no Catálogo'}
              </button>

              {isEditing && (
                <button type="button" onClick={resetForm} className="interactive-surface w-full border hairline bg-transparent py-3 font-label text-[0.65rem] uppercase tracking-[0.2em] text-on-surface-variant">
                  Cancelar
                </button>
              )}
            </form>
          </section>

          {/* Seção 03 — Catálogo */}
          <section className="animate-fade-up lg:col-span-2" style={{ animationDelay: '240ms' }}>
            <div className="mb-6 flex items-baseline justify-between border-b hairline pb-3">
              <div className="flex items-baseline gap-2">
                <span className="font-body text-[0.6rem] tabular-nums text-primary">03</span>
                <span aria-hidden="true" className="h-px w-6 self-center bg-outline-variant/60" />
                <h2 className="font-headline italic text-xl">Catálogo</h2>
              </div>
              {!loading && products.length > 0 && (
                <span className="font-label text-[0.6rem] uppercase tracking-[0.25em] text-on-surface-variant">
                  {products.length} {products.length === 1 ? 'peça' : 'peças'}
                </span>
              )}
            </div>

            {loading ? (
              <p className="animate-pulse py-10 text-center font-label text-[0.65rem] uppercase tracking-[0.3em] text-on-surface-variant">
                Carregando catálogo
              </p>
            ) : products.length === 0 ? (
              <div className="border-y hairline py-16 text-center">
                <p className="font-headline italic text-lg text-on-surface-variant">Nenhuma peça no catálogo</p>
                <p className="mt-3 font-label text-[0.6rem] uppercase tracking-[0.25em] text-outline">Cadastre a primeira jóia no formulário</p>
              </div>
            ) : (
              <ul className="divide-y divide-outline-variant/30">
                {products.map(p => (
                  <li key={p.id} className="flex gap-4 py-4">
                    <img src={p.imageUrl} className="h-20 w-16 shrink-0 rounded-sm object-cover" alt={p.name} />

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-headline text-base">{p.name}</p>
                      <p className="mt-0.5 font-label text-[0.55rem] uppercase tracking-[0.2em] text-outline">{categoryLabelOf(p.category)}</p>
                      <p className="mt-1.5 font-body text-sm font-light">{p.price}</p>
                    </div>

                    <div className="flex shrink-0 flex-col items-end justify-between gap-2">
                      <div className="flex gap-1">
                        <button type="button" aria-label={`Editar ${p.name}`} onClick={() => startEdit(p)} className="interactive-icon h-10 w-10 rounded-full text-on-surface-variant active:bg-primary/10 active:text-primary">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button type="button" aria-label={`Excluir ${p.name}`} onClick={() => deleteProduct(p.id)} className="interactive-icon h-10 w-10 rounded-full text-on-surface-variant active:bg-error/10 active:text-error">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {p.stock == null ? (
                        <span className="pr-1 font-label text-[0.55rem] uppercase tracking-[0.2em] text-outline-variant">Livre</span>
                      ) : (
                        <div className="flex items-center gap-1 rounded-full bg-surface-container px-1 py-0.5">
                          <button
                            type="button"
                            aria-label={`Diminuir estoque de ${p.name}`}
                            disabled={p.stock === 0}
                            onClick={() => void adjustStock(p, -1)}
                            className="interactive-icon h-9 w-9 rounded-full text-on-surface-variant active:bg-error/10 active:text-error disabled:opacity-30"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className={`w-6 text-center font-body text-sm tabular-nums ${p.stock === 0 ? 'font-medium text-error' : ''}`}>
                            {p.stock}
                          </span>
                          <button
                            type="button"
                            aria-label={`Aumentar estoque de ${p.name}`}
                            onClick={() => void adjustStock(p, 1)}
                            className="interactive-icon h-9 w-9 rounded-full text-on-surface-variant active:bg-primary/10 active:text-primary"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>

      <BottomNavBar />
    </div>
  );
};
