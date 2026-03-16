import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import SiteFooter from '../components/SiteFooter';
import SiteHeader from '../components/SiteHeader';
import { useAuth } from '../context/AuthContext';

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, initializing, apiRequestWithAuth } = useAuth();
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!initializing && !isAuthenticated) {
      router.replace('/login?next=/checkout');
    }
  }, [initializing, isAuthenticated, router]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const total = Number(formData.get('total') || 0);

    try {
      const result = await apiRequestWithAuth('/api/orders', {
        method: 'POST',
        body: { total }
      });
      setMessage(`Solicitacao enviada. Pedido #${result.order_id} criado com status ${result.status}.`);
      event.currentTarget.reset();
    } catch (error) {
      setMessage(error.message || 'Falha ao enviar solicitacao.');
    }
  };

  if (!isAuthenticated) return null;

  return (
    <>
      <Head>
        <title>Checkout Udev | Contratacao</title>
        <meta name="description" content="Fluxo inicial de checkout para contratacao de produtos e servicos da Udev." />
      </Head>

      <SiteHeader />

      <main className="page">
        <section className="hero hero--compact" data-animate="fade-up">
          <h1 className="hero-title">Checkout</h1>
          <p className="lead">Preencha os dados para iniciar o processo de contratacao com a Udev.</p>
        </section>

        <section className="section split-grid" data-animate="fade-up">
          <article className="card">
            <h2 className="section-title">Dados da solicitacao</h2>
            <form className="form-grid" action="#" method="post" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="checkout-name">Nome</label>
                <input id="checkout-name" name="name" type="text" required />
              </div>
              <div>
                <label htmlFor="checkout-email">E-mail</label>
                <input id="checkout-email" name="email" type="email" required />
              </div>
              <div>
                <label htmlFor="checkout-phone">Telefone</label>
                <input id="checkout-phone" name="phone" type="tel" />
              </div>
              <div>
                <label htmlFor="checkout-service">Servico</label>
                <select id="checkout-service" name="service" defaultValue="site-performance">
                  <option value="site-performance">Site Institucional Performance</option>
                  <option value="crm-comercial-udev">CRM Comercial Udev</option>
                  <option value="painel-executivo">Painel de Indicadores Executivo</option>
                </select>
              </div>
              <div className="form-grid__full">
                <label htmlFor="checkout-total">Orcamento estimado (R$)</label>
                <input id="checkout-total" name="total" type="number" min="0" step="0.01" defaultValue="0" />
              </div>
              <div className="form-grid__full">
                <label htmlFor="checkout-notes">Objetivo do projeto</label>
                <textarea id="checkout-notes" name="notes" rows="5" />
              </div>

              <button className="btn btn-primary" type="submit">
                Enviar solicitacao
              </button>
            </form>
          </article>

          <article className="card">
            <h2 className="section-title">Proximos passos</h2>
            <ol>
              <li>Analise tecnica do seu contexto.</li>
              <li>Proposta comercial com escopo e prazo.</li>
              <li>Kickoff e inicio da entrega.</li>
            </ol>
            <p className="muted">
              Para uma rota totalmente automatizada, conectar este formulario ao endpoint de pedidos do backend.
            </p>
            <Link href="/contact" className="btn btn-secondary" title="Falar com time comercial">
              Falar com comercial
            </Link>
          </article>
        </section>
        {message && (
          <section className="section" data-animate="fade-up">
            <p className="muted">{message}</p>
          </section>
        )}
      </main>

      <SiteFooter />
    </>
  );
}
