import React, { useCallback, useEffect, useRef, useState } from 'react';
import { supabase, hasSupabaseKeys, mapProductRecord } from '../lib/supabase';
import { Header } from '../components/Header';
import { BottomNavBar } from '../components/BottomNavBar';
import type { Product } from '../data/mockData';
import { Trash2, Edit2, UploadCloud, Plus, LogOut, KeyRound } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';

interface ProductFormData {
  name: string;
  category: string;
  price: string;
  imageUrl: string;
  collectionId: string;
  features: string;
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
  isBundle: boolean;
  bundledProducts: NonNullable<Product['bundledProducts']>;
}

export const Admin: React.FC = () => {
  const isMountedRef = useRef(true);

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
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    category: 'rings',
    price: '',
    imageUrl: '',
    collectionId: '',
    features: '',
    isBundle: false
  });
  const [bundledItems, setBundledItems] = useState<BundledItemFormData[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [uploadingHero, setUploadingHero] = useState(false);

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
        alert('Foto do Hero atualizada com sucesso!');
      } else {
        console.error('Erro settings:', updateError);
        alert(`Erro ao salvar no banco: ${updateError.message}`);
      }
    } else {
      alert('Erro ao fazer upload da imagem do Hero.');
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
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const addBundledItem = (): void => {
    setBundledItems(prev => [...prev, { id: crypto.randomUUID(), name: '', price: '' }]);
  };

  const updateBundledItem = (index: number, field: 'name' | 'price', value: string): void => {
    setBundledItems(prev => prev.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [field]: value } : item
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
      alert('Erro ao fazer upload da imagem.');
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
      isBundle: product.isBundle || false
    });
    setBundledItems(product.bundledProducts?.map(p => ({ id: p.id, name: p.name, price: p.price })) ?? []);
  };

  const resetForm = (): void => {
    setIsEditing(false);
    setCurrentId('');
    setFormData({ 
      name: '', 
      category: 'rings', 
      price: '', 
      imageUrl: '', 
      collectionId: '', 
      features: '',
      isBundle: false
    });
    setBundledItems([]);
  };

  const submitForm = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!hasSupabaseKeys) return;
    const features = formData.features.split(',').map(f => f.trim()).filter(Boolean);

    const payload: ProductPayload = {
      name: formData.name,
      category: formData.category,
      price: formData.price,
      imageUrl: formData.imageUrl,
      collectionId: formData.collectionId,
      features,
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
        alert(`Erro ao atualizar: ${error.message}`);
        return;
      }
    } else {
      const { error } = await supabase.from('products').insert([payload]);
      if (error) {
        console.error('Erro ao inserir:', error);
        alert(`Erro ao inserir: ${error.message}`);
        return;
      }
    }
    
    if (!isMountedRef.current) {
      return;
    }

    resetForm();
    void fetchProducts();
    alert('Produto salvo com sucesso!');
  };

  const deleteProduct = async (id: string): Promise<void> => {
    if (!id) {
      return;
    }

    if (confirm("Deseja mesmo excluir esta jóia do catálogo?") && hasSupabaseKeys) {
      await supabase.from('products').delete().eq('id', id);
      if (isMountedRef.current) {
        void fetchProducts();
      }
    }
  };

  if (!isSessionChecked) {
    return <div className="min-h-screen bg-background text-on-surface flex items-center justify-center">Carregando Sessão...</div>;
  }

  // --- LOGIN VIEW ---
  if (!session) {
    return (
      <div className="min-h-screen overflow-x-clip bg-background text-on-surface">
        <Header />
        <main className="mx-auto flex max-w-7xl items-center justify-center px-4 pb-28 pt-32 md:px-8">
          <div className="w-full max-w-md bg-surface-container-low p-8 shadow-sm border border-outline/10">
            <div className="flex flex-col items-center mb-8">
              <KeyRound className="w-10 h-10 text-primary mb-4 stroke-1" />
              <h1 className="font-headline text-2xl text-center">Acesso Privado</h1>
              <p className="text-on-surface-variant text-sm font-label tracking-widest text-center mt-2 uppercase">Credencial Administrativa Necessária</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {authError && (
                <div className="bg-error-container text-on-error-container p-3 text-xs font-label">
                  Falha: {authError}
                </div>
              )}
              <div>
                <label htmlFor="admin-email" className="block font-label text-xs tracking-wider mb-2">E-MAIL</label>
                <input 
                  id="admin-email"
                  required 
                  type="email" 
                  value={authEmail} 
                  onChange={e => setAuthEmail(e.target.value)} 
                  className="w-full bg-surface border border-outline-variant px-4 py-3 text-sm focus:border-primary focus:outline-none" 
                />
              </div>
              <div>
                <label htmlFor="admin-password" className="block font-label text-xs tracking-wider mb-2">SENHA SECRETA</label>
                <input 
                  id="admin-password"
                  required 
                  type="password" 
                  value={authPassword} 
                  onChange={e => setAuthPassword(e.target.value)} 
                  className="w-full bg-surface border border-outline-variant px-4 py-3 text-sm focus:border-primary focus:outline-none" 
                />
              </div>

              <button 
                type="submit" 
                disabled={isAuthLoading} 
                className="w-full bg-primary text-on-primary py-4 text-xs tracking-widest font-label uppercase hover:bg-primary-dim transition-colors disabled:opacity-50"
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
      
      <main className="mx-auto max-w-7xl px-4 pb-32 pt-24 md:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="font-headline text-2xl sm:text-3xl">Painel Administrativo Mivie</h1>
          <button 
            onClick={handleLogout}
            type="button"
            className="flex items-center gap-2 text-xs font-label tracking-widest uppercase text-on-surface-variant hover:text-error transition-colors"
          >
            <LogOut className="w-4 h-4" /> Desconectar
          </button>
        </div>

        {/* Seção de Banner Hero */}
        <section className="mb-12 bg-surface-container-low p-6 shadow-sm border border-outline/10">
          <h2 className="font-headline text-xl mb-4">Banner do Hero (Página Inicial)</h2>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-1/2 aspect-[21/9] bg-surface-variant overflow-hidden rounded-sm relative">
              {heroImageUrl && (
                <img src={heroImageUrl} className="w-full h-full object-cover" alt="Banner atual da página inicial" />
              )}
              {uploadingHero && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-white font-label text-xs tracking-widest animate-pulse">ATUALIZANDO...</span>
                </div>
              )}
            </div>
            <div className="flex-1 space-y-4">
              <p className="text-on-surface-variant text-sm font-body">Esta imagem aparece no topo da sua página inicial. Recomendamos fotos horizontais e nítidas das suas jóias.</p>
              <label className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 text-xs font-label uppercase tracking-widest cursor-pointer hover:bg-primary-dim transition-colors">
                <UploadCloud className="w-4 h-4" /> 
                {uploadingHero ? 'Enviando...' : 'Trocar Foto do Hero'}
                <input type="file" className="hidden" accept="image/*" onChange={handleHeroUpload} disabled={uploadingHero} aria-label="Enviar foto do hero" />
              </label>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Formulário */}
          <section className="lg:col-span-1 bg-surface-container-low p-6 shadow-sm border border-outline/10 h-fit">
            <h2 className="font-headline text-xl mb-6">{isEditing ? 'Atualizar Jóia' : 'Nova Jóia'}</h2>
            
            <form onSubmit={submitForm} className="space-y-4">
              <div>
                <label className="block font-label text-xs tracking-wider mb-1">FOTO DO PRODUTO</label>
                {formData.imageUrl ? (
                  <div className="relative mb-2">
                     <img src={formData.imageUrl} className="w-full h-40 object-cover rounded-sm grayscale" alt={`Prévia de ${formData.name || 'produto'}`}/>
                     <button type="button" aria-label="Remover foto do produto" onClick={() => setFormData(prev => ({...prev, imageUrl: ''}))} className="absolute top-2 right-2 bg-error text-on-error p-1 rounded-full"><Trash2 className="w-3 h-3"/></button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-outline-variant rounded-sm h-32 cursor-pointer hover:bg-surface-variant/30 transition-colors">
                    {uploadingImage ? <span className="animate-pulse font-body text-sm">Enviando Nuvem...</span> : (
                      <>
                        <UploadCloud className="w-8 h-8 text-outline mb-2" />
                        <span className="font-body text-xs text-outline">Fazer upload no Storage</span>
                      </>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} aria-label="Enviar foto do produto" />
                  </label>
                )}
              </div>

              <div>
                <label htmlFor="product-name" className="block font-label text-xs tracking-wider mb-1">NOME DA JÓIA</label>
                <input id="product-name" required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-surface border border-outline-variant px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="product-price" className="block font-label text-xs tracking-wider mb-1">PREÇO (R$)</label>
                  <input id="product-price" required placeholder="R$ 150,00" type="text" name="price" value={formData.price} onChange={handleInputChange} className="w-full bg-surface border border-outline-variant px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                   <label htmlFor="product-category" className="block font-label text-xs tracking-wider mb-1">CATEGORIA</label>
                   <select id="product-category" name="category" value={formData.category} onChange={handleInputChange} className="w-full bg-surface border border-outline-variant px-3 py-2 text-sm focus:border-primary focus:outline-none">
                     <option value="rings">Anéis</option>
                     <option value="earrings">Brincos</option>
                     <option value="necklaces">Colares</option>
                     <option value="bracelets">Pulseiras</option>
                   </select>
                </div>
              </div>

              <div>
                <label htmlFor="product-features" className="block font-label text-xs tracking-wider mb-1">TAGS/FEATURES (Separados por vírgula)</label>
                <input id="product-features" required placeholder="Ex: Prata 925, Esculpido" type="text" name="features" value={formData.features} onChange={handleInputChange} className="w-full bg-surface border border-outline-variant px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              </div>

              <div className="flex items-center gap-2 py-2">
                <input 
                  type="checkbox" 
                  id="isBundle" 
                  name="isBundle" 
                  checked={formData.isBundle} 
                  onChange={handleInputChange}
                  className="w-4 h-4 accent-primary"
                />
                <label htmlFor="isBundle" className="font-label text-xs tracking-wider">ESTA FOTO CONTÉM MÚLTIPLOS PRODUTOS</label>
              </div>

              {formData.isBundle && (
                <div className="space-y-4 border-l-2 border-primary/20 pl-4 py-2">
                  <div className="flex justify-between items-center">
                    <label className="block font-label text-xs tracking-wider">PRODUTOS NA FOTO</label>
                    <button 
                      type="button" 
                      aria-label="Adicionar item ao conjunto"
                      onClick={addBundledItem}
                      className="text-[0.6rem] font-label uppercase tracking-widest text-primary hover:underline"
                    >
                      + Adicionar Item
                    </button>
                  </div>
                  
                  {bundledItems.map((item, index) => (
                    <div key={item.id} className="flex gap-2 items-start bg-surface-variant/20 p-2 rounded-sm relative group">
                      <div className="flex-1 space-y-2">
                        <input 
                          aria-label={`Nome do item ${index + 1}`}
                          placeholder="Nome do Item" 
                          value={item.name} 
                          onChange={(e) => updateBundledItem(index, 'name', e.target.value)}
                          className="w-full bg-surface border border-outline-variant px-2 py-1 text-xs focus:border-primary focus:outline-none"
                        />
                        <input 
                          aria-label={`Preço do item ${index + 1}`}
                          placeholder="Preço (Ex: R$ 89,00)" 
                          value={item.price} 
                          onChange={(e) => updateBundledItem(index, 'price', e.target.value)}
                          className="w-full bg-surface border border-outline-variant px-2 py-1 text-xs focus:border-primary focus:outline-none"
                        />
                      </div>
                      <button 
                        type="button" 
                        aria-label={`Remover item ${item.name || index + 1}`}
                        onClick={() => removeBundledItem(index)}
                        className="text-error opacity-50 hover:opacity-100 transition-opacity p-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {bundledItems.length === 0 && (
                    <p className="text-[0.6rem] text-on-surface-variant italic">Clique em adicionar para listar os itens desta foto.</p>
                  )}
                </div>
              )}

              <button type="submit" disabled={uploadingImage} className="w-full bg-primary text-on-primary py-3 mt-4 text-xs tracking-widest font-label uppercase hover:bg-primary-dim transition-colors flex items-center justify-center gap-2">
                {isEditing ? <Edit2 className="w-4 h-4"/> : <Plus className="w-4 h-4"/>}
                {isEditing ? 'Salvar Edição' : 'Publicar Catálogo'}
              </button>

              {isEditing && (
                <button type="button" onClick={resetForm} className="w-full bg-transparent border border-outline text-on-surface-variant py-2 mt-2 text-xs font-label">
                  Cancelar
                </button>
              )}
            </form>
          </section>

          {/* Listagem */}
          <section className="lg:col-span-2">
            <h2 className="font-headline text-xl mb-6">Estoque Cadastrado</h2>
            <div className="overflow-x-auto">
              {loading ? (
                <p className="text-on-surface-variant animate-pulse">Carregando estoque remotamente...</p>
              ) : products.length === 0 ? (
                <div className="bg-surface-variant py-12 text-center text-on-surface-variant">
                  <p>Nenhum produto rastreado no banco.</p>
                </div>
              ) : (
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant text-outline font-label text-xs tracking-wider">
                      <th className="py-3 px-2 font-normal">FOTO</th>
                      <th className="py-3 px-2 font-normal">NOME</th>
                      <th className="py-3 px-2 font-normal">PREÇO</th>
                      <th className="py-3 px-2 font-normal">AÇÕES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id} className="border-b border-outline-variant/30 hover:bg-surface-container-low transition-colors">
                        <td className="py-3 px-2">
                          <img src={p.imageUrl} className="w-12 h-12 object-cover grayscale rounded-sm" alt={p.name} />
                        </td>
                        <td className="py-3 px-2 font-headline">{p.name}</td>
                        <td className="py-3 px-2 font-body font-light">{p.price}</td>
                        <td className="py-3 px-2">
                          <div className="flex gap-4">
                            <button type="button" aria-label={`Editar ${p.name}`} onClick={() => startEdit(p)} className="text-on-surface-variant hover:text-primary transition-colors"><Edit2 className="w-4 h-4"/></button>
                            <button type="button" aria-label={`Excluir ${p.name}`} onClick={() => deleteProduct(p.id)} className="text-on-surface-variant hover:text-error transition-colors"><Trash2 className="w-4 h-4"/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

        </div>
      </main>

      <BottomNavBar />
    </div>
  );
};
