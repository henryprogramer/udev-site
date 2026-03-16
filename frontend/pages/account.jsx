import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import SiteFooter from '../components/SiteFooter';
import SiteHeader from '../components/SiteHeader';
import { useAuth } from '../context/AuthContext';

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, isManager, initializing } = useAuth();

  useEffect(() => {
    if (!initializing && !isAuthenticated) {
      router.replace('/login?next=/account');
    }
  }, [initializing, isAuthenticated, router]);

  if (initializing || !isAuthenticated) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Minha Conta | Udev</title>
        <meta name="description" content="Painel da conta do cliente Udev." />
      </Head>

      <SiteHeader />

      <main className="page">
        <section className="hero hero--compact" data-animate="fade-up">
          <h1 className="hero-title">Minha Conta</h1>
          <p className="lead">Acesso autenticado para clientes e equipe gestora.</p>
        </section>

        <section className="section split-grid" data-animate="fade-up">
          <article className="card">
            <h2 className="section-title">Dados de acesso</h2>
            <p>
              <strong>Nome:</strong> {user.full_name}
            </p>
            <p>
              <strong>E-mail:</strong> {user.email}
            </p>
            <p>
              <strong>Perfil:</strong> {user.role}
            </p>
          </article>

          <article className="card">
            <h2 className="section-title">Acoes</h2>
            <div className="actions-row">
              <Link href="/services" className="btn btn-secondary">
                Ver servicos
              </Link>
              <Link href="/checkout" className="btn btn-primary">
                Iniciar contratacao
              </Link>
              {isManager && (
                <Link href="/admin" className="btn btn-primary">
                  Abrir Portal Admin
                </Link>
              )}
            </div>
          </article>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
