import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import SiteFooter from '../../components/SiteFooter';
import SiteHeader from '../../components/SiteHeader';
import { apiRequest } from '../../lib/api';
import { products, services, storeUrl } from '../../lib/siteContent';

const fallbackOffer = {
  headline: 'Sua operacao perde tempo com tarefas manuais e retrabalho?',
  subheadline:
    'A Udev implementa uma solucao digital para centralizar dados, automatizar fluxos e escalar resultados.',
  benefits: [
    'Reducao de tarefas manuais e erros operacionais.',
    'Visibilidade de indicadores em tempo real.',
    'Automacao de processos criticos do time.',
    'Arquitetura escalavel para evolucao continua.',
    'Acompanhamento estrategico orientado a KPI.'
  ],
  testimonial: 'A Udev estruturou nossa operacao em poucas semanas, com impacto real no faturamento.',
  kpi: '+37% de produtividade operacional em 90 dias',
  price: '1990.00'
};

const fallbackCatalog = [
  ...products.map((item) => ({
    id: String(item.id),
    title: item.title,
    description: item.description,
    priceFrom: item.priceFrom
  })),
  ...services.map((item) => ({
    id: String(item.id),
    title: item.title,
    description: item.description,
    priceFrom: 'Sob consulta'
  }))
];

function getCatalogItem(id) {
  if (!id || typeof id !== 'string') return null;
  return fallbackCatalog.find((entry) => entry.id === id) || null;
}

export default function ProductDetailPage({ initialItem = null }) {
  const router = useRouter();
  const routeId = typeof router.query.id === 'string' ? router.query.id : initialItem?.id || null;

  const [item, setItem] = useState(initialItem);
  const [loading, setLoading] = useState(false);

  const fallbackItem = useMemo(() => {
    return getCatalogItem(routeId) || initialItem || null;
  }, [initialItem, routeId]);

  useEffect(() => {
    if (!routeId || typeof routeId !== 'string') return;

    const numericId = Number(routeId);
    if (!Number.isInteger(numericId)) {
      setItem(fallbackItem);
      return;
    }

    let active = true;

    const load = async () => {
      setLoading(true);
      try {
        const data = await apiRequest(`/api/products/${numericId}`);
        if (!active) return;
        setItem({
          id: String(data.id),
          title: data.name,
          description: data.description || 'Produto da loja Udev',
          priceFrom: `R$ ${Number(data.price || 0).toFixed(2).replace('.', ',')}`
        });
      } catch (_error) {
        if (active) setItem(fallbackItem);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [fallbackItem, routeId]);

  const current = item || fallbackItem || {
    id: String(routeId || 'produto'),
    title: 'Produto Udev',
    description: 'Solucao digital com foco em resultado.',
    priceFrom: 'R$ 1.990'
  };

  return (
    <>
      <Head>
        <title>{`${current.title} | Udev`}</title>
        <meta
          name="description"
          content={`Pagina de venda da Udev para ${current.title}, com beneficios, prova social, FAQ e CTA para contratacao.`}
        />
      </Head>

      <SiteHeader />

      <main className="page">
        <section className="hero hero--compact" data-animate="fade-up">
          <h1 className="hero-title">{fallbackOffer.headline}</h1>
          <p className="lead">{fallbackOffer.subheadline}</p>
          <div className="actions-row">
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener"
              className="btn btn-primary"
              title="Comprar ou contratar"
              aria-label="Comprar ou contratar"
            >
              Comprar / Contratar
            </a>
            <Link href="/contact" className="btn btn-secondary" title="Falar com consultor Udev">
              Falar com consultor
            </Link>
          </div>
        </section>

        <section className="section split-grid" data-animate="fade-up">
          <article className="card">
            <img src="/assets/products/placeholder.png" alt={`Imagem do produto ${current.title}`} className="product-hero-image" />
            <h2 className="section-title">{current.title}</h2>
            <p>{current.description}</p>
            <p className="muted">Preco estimado: {current.priceFrom}</p>
            {loading && <p className="muted">Carregando dados atualizados...</p>}
          </article>

          <article className="card">
            <h2 className="section-title">Beneficios</h2>
            <ul>
              {fallbackOffer.benefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          </article>
        </section>

        <section className="section" data-animate="fade-up">
          <h2 className="section-title">Prova social</h2>
          <article className="card">
            <blockquote>{fallbackOffer.testimonial}</blockquote>
            <p>
              <strong>KPI:</strong> {fallbackOffer.kpi}
            </p>
          </article>
        </section>

        <section className="section" data-animate="fade-up">
          <h2 className="section-title">FAQ</h2>
          <details className="card">
            <summary>Quanto tempo leva para colocar a solucao em producao?</summary>
            <p>Para MVPs, o intervalo medio e entre 2 e 6 semanas, variando conforme escopo.</p>
          </details>
          <details className="card">
            <summary>Integra com sistemas que ja utilizamos?</summary>
            <p>Sim. O desenho tecnico considera integracao com ferramentas atuais para reduzir friccao.</p>
          </details>
          <details className="card">
            <summary>Existe suporte apos a entrega?</summary>
            <p>Sim. Ha planos de suporte evolutivo e acompanhamento de performance.</p>
          </details>
        </section>
      </main>

      <SiteFooter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: current.title,
            description: current.description,
            brand: {
              '@type': 'Brand',
              name: 'Udev'
            },
            sku: `UDEV-${String(current.id).toUpperCase()}`,
            offers: {
              '@type': 'Offer',
              url: storeUrl,
              priceCurrency: 'BRL',
              price: fallbackOffer.price,
              availability: 'https://schema.org/InStock'
            }
          })
        }}
      />
    </>
  );
}

export async function getStaticPaths() {
  return {
    paths: fallbackCatalog.map((item) => ({ params: { id: item.id } })),
    fallback: false
  };
}

export async function getStaticProps({ params }) {
  return {
    props: {
      initialItem: getCatalogItem(params.id)
    }
  };
}
