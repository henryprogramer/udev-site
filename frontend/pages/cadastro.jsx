import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import SiteFooter from '../components/SiteFooter';
import SiteHeader from '../components/SiteHeader';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({
        full_name: fullName,
        email,
        password
      });
      router.push('/account');
    } catch (err) {
      setError(err.message || 'Falha no cadastro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Cadastro | Udev</title>
        <meta
          name="description"
          content="Crie sua conta de cliente para contratar e acompanhar servicos da Udev."
        />
      </Head>

      <SiteHeader />

      <main className="page">
        <section className="hero hero--compact" data-animate="fade-up">
          <h1 className="hero-title">Cadastro de Cliente</h1>
          <p className="lead">Crie seu acesso para contratar servicos e acompanhar entregas com seguranca.</p>
        </section>

        <section className="section" data-animate="fade-up">
          <article className="card auth-card">
            <form className="form-grid" onSubmit={handleSubmit}>
              <div className="form-grid__full">
                <label htmlFor="register-name">Nome completo</label>
                <input
                  id="register-name"
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  required
                />
              </div>

              <div className="form-grid__full">
                <label htmlFor="register-email">E-mail</label>
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <div className="form-grid__full">
                <label htmlFor="register-password">Senha</label>
                <input
                  id="register-password"
                  type="password"
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>

              {error && <p className="error-text form-grid__full">{error}</p>}

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Criando conta...' : 'Criar conta'}
              </button>
            </form>

            <p className="muted">
              Ja possui conta?{' '}
              <Link href="/login" title="Ir para login">
                Fazer login
              </Link>
            </p>
          </article>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
