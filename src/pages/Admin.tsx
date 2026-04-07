import React, { useState, useEffect } from 'react';
import { supabase, hasSupabaseKeys } from '../lib/supabase';
import { Header } from '../components/Header';
import type { Product } from '../data/mockData';
import { Trash2, Edit2, UploadCloud, Plus, LogOut, KeyRound } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';

export const Admin: React.FC = () => {
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
  const [formData, setFormData] = useState({
    name: '',
    category: 'rings',
    price: '',
    imageUrl: '',
    collectionId: '',
    features: ''
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsSessionChecked(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchProducts();
    }
  }, [session]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    setAuthError('');
    
    const { error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: authPassword,
    });

    if (error) {
      setAuthError(error.message);
    }
    setIsAuthLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const fetchProducts = async () => {
    setLoading(true);
    if (!hasSupabaseKeys) {
      setLoading(false);
      return; 
    }

    const { data, error } = await supabase.from('products').select('*');
    if (!error && data) {
      setProducts(data as Product[]);
    }
    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !hasSupabaseKeys) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `mivie/${fileName}`;

    setUploadingImage(true);
    const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, file);

    if (!uploadError) {
      const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, imageUrl: data.publicUrl }));
    } else {
      alert('Erro ao fazer upload da imagem.');
    }
    setUploadingImage(false);
  };

  const startEdit = (product: Product) => {
    setIsEditing(true);
    setCurrentId(product.id);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      imageUrl: product.imageUrl,
      collectionId: product.collectionId || '',
      features: product.features.join(', ')
    });
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentId('');
    setFormData({ name: '', category: 'rings', price: '', imageUrl: '', collectionId: '', features: '' });
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasSupabaseKeys) return;

    const payload = {
      name: formData.name,
      category: formData.category,
      price: formData.price,
      imageUrl: formData.imageUrl,
      collectionId: formData.collectionId,
      features: formData.features.split(',').map(f => f.trim())
    };

    if (isEditing) {
      await supabase.from('products').update(payload).eq('id', currentId);
    } else {
      await supabase.from('products').insert([payload]);
    }
    
    resetForm();
    fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    if (confirm("Deseja mesmo excluir esta jóia do catálogo?") && hasSupabaseKeys) {
      await supabase.from('products').delete().eq('id', id);
      fetchProducts();
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
                <label className="block font-label text-xs tracking-wider mb-2">E-MAIL</label>
                <input 
                  required 
                  type="email" 
                  value={authEmail} 
                  onChange={e => setAuthEmail(e.target.value)} 
                  className="w-full bg-surface border border-outline-variant px-4 py-3 text-sm focus:border-primary focus:outline-none" 
                />
              </div>
              <div>
                <label className="block font-label text-xs tracking-wider mb-2">SENHA SECRETA</label>
                <input 
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
            className="flex items-center gap-2 text-xs font-label tracking-widest uppercase text-on-surface-variant hover:text-error transition-colors"
          >
            <LogOut className="w-4 h-4" /> Desconectar
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Formulário */}
          <section className="lg:col-span-1 bg-surface-container-low p-6 shadow-sm border border-outline/10 h-fit">
            <h2 className="font-headline text-xl mb-6">{isEditing ? 'Atualizar Jóia' : 'Nova Jóia'}</h2>
            
            <form onSubmit={submitForm} className="space-y-4">
              <div>
                <label className="block font-label text-xs tracking-wider mb-1">FOTO DO PRODUTO</label>
                {formData.imageUrl ? (
                  <div className="relative mb-2">
                     <img src={formData.imageUrl} className="w-full h-40 object-cover rounded-sm grayscale" alt="Preview"/>
                     <button type="button" onClick={() => setFormData({...formData, imageUrl: ''})} className="absolute top-2 right-2 bg-error text-on-error p-1 rounded-full"><Trash2 className="w-3 h-3"/></button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-outline-variant rounded-sm h-32 cursor-pointer hover:bg-surface-variant/30 transition-colors">
                    {uploadingImage ? <span className="animate-pulse font-body text-sm">Enviando Nuvem...</span> : (
                      <>
                        <UploadCloud className="w-8 h-8 text-outline mb-2" />
                        <span className="font-body text-xs text-outline">Fazer upload no Storage</span>
                      </>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                  </label>
                )}
              </div>

              <div>
                <label className="block font-label text-xs tracking-wider mb-1">NOME DA JÓIA</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-surface border border-outline-variant px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label text-xs tracking-wider mb-1">PREÇO (R$)</label>
                  <input required placeholder="R$ 150,00" type="text" name="price" value={formData.price} onChange={handleInputChange} className="w-full bg-surface border border-outline-variant px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                   <label className="block font-label text-xs tracking-wider mb-1">CATEGORIA</label>
                   <select name="category" value={formData.category} onChange={handleInputChange} className="w-full bg-surface border border-outline-variant px-3 py-2 text-sm focus:border-primary focus:outline-none">
                     <option value="rings">Anéis</option>
                     <option value="earrings">Brincos</option>
                     <option value="necklaces">Colares</option>
                     <option value="bracelets">Pulseiras</option>
                   </select>
                </div>
              </div>

              <div>
                <label className="block font-label text-xs tracking-wider mb-1">TAGS/FEATURES (Separados por vírgula)</label>
                <input required placeholder="Ex: Prata 925, Esculpido" type="text" name="features" value={formData.features} onChange={handleInputChange} className="w-full bg-surface border border-outline-variant px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              </div>

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
                          <img src={p.imageUrl} className="w-12 h-12 object-cover grayscale rounded-sm" alt="produto" />
                        </td>
                        <td className="py-3 px-2 font-headline">{p.name}</td>
                        <td className="py-3 px-2 font-body font-light">{p.price}</td>
                        <td className="py-3 px-2">
                          <div className="flex gap-4">
                            <button onClick={() => startEdit(p)} className="text-on-surface-variant hover:text-primary transition-colors"><Edit2 className="w-4 h-4"/></button>
                            <button onClick={() => deleteProduct(p.id)} className="text-on-surface-variant hover:text-error transition-colors"><Trash2 className="w-4 h-4"/></button>
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
    </div>
  );
};
