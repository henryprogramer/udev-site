import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import SiteFooter from '../components/SiteFooter';
import SiteHeader from '../components/SiteHeader';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login({ email, password });
      const nextRoute = typeof router.query.next === 'string' ? router.query.next : null;
      if (nextRoute) {
        router.push(nextRoute);
        return;
      }
      if (user.role === 'manager') {
        router.push('/admin');
      } else {
        router.push('/account');
      }
    } catch (err) {
      setError(err.message || 'Falha no login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login | Udev</title>
        <meta name="description" content="Acesse sua conta de cliente Udev ou portal gestor." />
      </Head>

      <SiteHeader />

      <main className="page">
        <section className="hero hero--compact" data-animate="fade-up">
          <h1 className="hero-title">Login</h1>
          <p className="lead">Entre para acompanhar pedidos, projetos e acesso ao ecossistema Udev.</p>
        </section>

        <section className="section" data-animate="fade-up">
          <article className="card auth-card">
            <form className="form-grid" onSubmit={handleSubmit}>
              <div className="form-grid__full">
                <label htmlFor="login-email">E-mail</label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <div className="form-grid__full">
                <label htmlFor="login-password">Senha</label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>

              {error && <p className="error-text form-grid__full">{error}</p>}

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            <p className="muted">
              Ainda nao tem conta?{' '}
              <Link href="/cadastro" title="Criar conta">
                Criar cadastro
              </Link>
            </p>
          </article>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
