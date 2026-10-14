import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LogOut, Shield, UserRound, ChevronRight } from 'lucide-react';
import { Header } from '../components/Header';
import { BottomNavBar } from '../components/BottomNavBar';
import { useAuth } from '../context/authContextValue';
import { supabase } from '../lib/supabase';
import { mapOrderRecord } from '../lib/orders';
import type { Order } from '../lib/orders';

const INPUT_CLASS = 'w-full bg-surface border hairline px-4 py-3 text-base focus:border-primary focus:outline-none transition-colors';
const LABEL_CLASS = 'block font-label text-[0.6rem] uppercase tracking-[0.25em] text-on-surface-variant mb-2';
const MIN_PASSWORD_LENGTH = 8;
const MAX_NAME_LENGTH = 80;

/**
 * Destino pós-login vindo da URL (?next=). Só caminhos internos: bloqueia
 * "//evil.com" e "https://..." para não virar redirecionamento aberto.
 */
const safeNextPath = (value: string | null): string | null => (
  value && value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\') ? value : null
);

const formatOrderDate = (iso: string): string => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
};

type Mode = 'signin' | 'signup';

const AuthForms: React.FC = () => {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const switchMode = (next: Mode): void => {
    setMode(next);
    setError('');
    setNotice('');
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    setNotice('');

    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Informe seu nome.');
        return;
      }
      if (password.length < MIN_PASSWORD_LENGTH) {
        setError(`A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`);
        return;
      }
    }

    setIsSubmitting(true);
    if (mode === 'signin') {
      const signInError = await signIn(email.trim(), password);
      if (signInError) setError(signInError);
    } else {
      const result = await signUp(name.trim().slice(0, MAX_NAME_LENGTH), email.trim(), password);
      if (result.error) {
        setError(result.error);
      } else if (result.needsConfirmation) {
        setNotice('Conta criada! Enviamos um link para o seu e-mail — confirme para entrar.');
        setPassword('');
      }
    }
    setIsSubmitting(false);
  };

  return (
    <div className="animate-fade-up w-full max-w-md border hairline bg-surface-container-lowest p-8 sm:p-10">
      <div className="mb-8 text-center">
        <UserRound className="mx-auto mb-6 h-8 w-8 stroke-1 text-primary" />
        <h1 className="font-headline italic text-3xl">{mode === 'signin' ? 'Entrar' : 'Criar conta'}</h1>
        <p className="mt-3 font-label text-[0.65rem] uppercase tracking-[0.25em] text-on-surface-variant">
          Acompanhe seus pedidos na Mivi
        </p>
        <div className="mx-auto mt-5 h-px w-12 bg-primary opacity-40" />
      </div>

      <div role="tablist" aria-label="Acesso à conta" className="mb-8 grid grid-cols-2 border hairline">
        {(['signin', 'signup'] as const).map(tab => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={mode === tab}
            onClick={() => switchMode(tab)}
            className={`py-3 font-label text-[0.65rem] uppercase tracking-[0.2em] transition-colors ${
              mode === tab ? 'bg-primary text-on-primary' : 'text-on-surface-variant'
            }`}
          >
            {tab === 'signin' ? 'Entrar' : 'Cadastrar'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {error && (
          <div role="alert" className="border hairline border-error/30 bg-error/5 px-4 py-3 font-label text-xs text-error">
            {error}
          </div>
        )}
        {notice && (
          <div role="status" className="border hairline border-primary/30 bg-primary/5 px-4 py-3 font-label text-xs text-on-surface">
            {notice}
          </div>
        )}

        {mode === 'signup' && (
          <div>
            <label htmlFor="account-name" className={LABEL_CLASS}>Nome</label>
            <input
              id="account-name"
              required
              type="text"
              autoComplete="name"
              maxLength={MAX_NAME_LENGTH}
              value={name}
              onChange={e => setName(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>
        )}
        <div>
          <label htmlFor="account-email" className={LABEL_CLASS}>E-mail</label>
          <input
            id="account-email"
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label htmlFor="account-password" className={LABEL_CLASS}>Senha</label>
          <input
            id="account-password"
            required
            type="password"
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            minLength={mode === 'signup' ? MIN_PASSWORD_LENGTH : undefined}
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={INPUT_CLASS}
          />
          {mode === 'signup' && (
            <p className="mt-2 font-label text-[0.6rem] text-outline">Mínimo de {MIN_PASSWORD_LENGTH} caracteres.</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="interactive-surface w-full bg-primary py-4 font-label text-xs uppercase tracking-[0.2em] text-on-primary active:bg-primary-dim disabled:opacity-50"
        >
          {isSubmitting ? 'Aguarde...' : mode === 'signin' ? 'Entrar' : 'Criar conta'}
        </button>
      </form>
    </div>
  );
};

const AccountDashboard: React.FC = () => {
  const { session, profile, isAdmin, signOut } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const userId = session?.user.id;

  useEffect(() => {
    if (!userId) return;
    const abortController = new AbortController();

    const fetchOrders = async (): Promise<void> => {
      // Filtro explícito além do RLS: para a dona (admin), o RLS liberaria todos os pedidos
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .abortSignal(abortController.signal);
      if (abortController.signal.aborted) return;
      if (!error && data) {
        setOrders(data.map(mapOrderRecord).filter((order): order is Order => order !== null));
      }
      setIsLoadingOrders(false);
    };

    void fetchOrders();
    return () => abortController.abort();
  }, [userId]);

  return (
    <div className="w-full">
      <section className="mb-12">
        <p className="animate-fade-up font-label text-[0.65rem] tracking-[0.35em] text-on-surface-variant uppercase">
          Minha conta
        </p>
        <div className="animate-fade-up mt-6 flex items-end justify-between gap-4 border-b hairline pb-6" style={{ animationDelay: '100ms' }}>
          <div className="min-w-0">
            <h1 className="break-words font-headline text-3xl italic text-on-surface sm:text-4xl">
              Olá{profile?.name ? `, ${profile.name.split(' ')[0]}` : ''}
            </h1>
            <p className="mt-2 truncate font-label text-[0.65rem] tracking-[0.1em] text-on-surface-variant">
              {session?.user.email}
            </p>
          </div>
          <button
            onClick={() => void signOut()}
            type="button"
            aria-label="Sair da conta"
            className="interactive-icon h-11 w-11 shrink-0 rounded-full text-on-surface-variant active:bg-error/10 active:text-error"
          >
            <LogOut className="h-5 w-5 stroke-[1.5]" />
          </button>
        </div>
      </section>

      {isAdmin && (
        <Link
          to="/admin"
          className="animate-fade-up mb-12 flex items-center justify-between border hairline bg-surface-container-lowest px-5 py-5 active:bg-surface"
        >
          <span className="flex items-center gap-3">
            <Shield className="h-5 w-5 stroke-[1.5] text-primary" />
            <span className="font-headline text-lg">Painel administrativo</span>
          </span>
          <ChevronRight className="h-5 w-5 stroke-[1.5] text-on-surface-variant" />
        </Link>
      )}

      <section className="animate-fade-up">
        <h2 className="mb-6 font-label text-[0.65rem] uppercase tracking-[0.3em] text-on-surface-variant">Meus pedidos</h2>
        {isLoadingOrders ? (
          <p className="animate-pulse font-label text-[0.65rem] uppercase tracking-[0.3em] text-on-surface-variant">Carregando</p>
        ) : orders.length === 0 ? (
          <div className="border-y hairline py-14 text-center">
            <p className="font-headline italic text-xl text-on-surface-variant">Nenhum pedido ainda</p>
            <p className="mt-3 font-label text-[0.65rem] uppercase tracking-[0.25em] text-outline">
              Pedidos feitos com a conta conectada aparecem aqui
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {orders.map(order => (
              <li key={order.code + order.createdAt} className="border hairline bg-surface-container-lowest p-5">
                <div className="mb-3 flex items-baseline justify-between gap-4">
                  <span className="font-label text-xs tracking-[0.15em]">{order.code}</span>
                  <span className="font-label text-[0.6rem] uppercase tracking-[0.15em] text-on-surface-variant">
                    {formatOrderDate(order.createdAt)}
                  </span>
                </div>
                <ul className="space-y-1 font-body text-sm text-on-surface-variant">
                  {order.items.map((item, index) => (
                    <li key={index}>{item.name} × {item.quantity}</li>
                  ))}
                </ul>
                <p className="mt-3 border-t hairline pt-3 text-right font-headline text-lg">{order.total}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export const Account: React.FC = () => {
  const { session, isAdmin, isAuthReady } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const nextPath = safeNextPath(searchParams.get('next'));

  useEffect(() => {
    if (!isAuthReady || !session || !nextPath) return;
    // /admin só é destino válido para quem é admin; os demais ficam na conta
    if (nextPath === '/admin' && !isAdmin) return;
    navigate(nextPath, { replace: true });
  }, [isAuthReady, session, isAdmin, nextPath, navigate]);

  return (
    <div className="min-h-screen overflow-x-clip bg-background text-on-surface">
      <Header />
      <main className="mx-auto flex max-w-2xl justify-center px-4 pb-32 pt-28 sm:px-6 md:pb-12">
        {!isAuthReady ? (
          <p className="animate-pulse pt-20 font-label text-[0.65rem] uppercase tracking-[0.3em] text-on-surface-variant">Carregando</p>
        ) : session ? (
          <AccountDashboard />
        ) : (
          <AuthForms />
        )}
      </main>
      <BottomNavBar />
    </div>
  );
};
