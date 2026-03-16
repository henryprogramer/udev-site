import Head from 'next/head';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import SiteFooter from '../components/SiteFooter';
import SiteHeader from '../components/SiteHeader';
import { services } from '../lib/siteContent';

const categories = [
  { value: 'all', label: 'Todas' },
  { value: 'web', label: 'Web' },
  { value: 'sistemas', label: 'Sistemas' },
  { value: 'automacao', label: 'Automacao' },
  { value: 'dados', label: 'Dados e BI' },
  { value: 'saas', label: 'SaaS' }
];

export default function ServicesPage() {
  const [category, setCategory] = useState('all');
  const [keyword, setKeyword] = useState('');

  const filtered = useMemo(() => {
    return services.filter((service) => {
      const byCategory = category === 'all' || service.category === category;
      const normalized = keyword.trim().toLowerCase();
      const byKeyword =
        normalized.length === 0 ||
        service.title.toLowerCase().includes(normalized) ||
        service.description.toLowerCase().includes(normalized);

      return byCategory && byKeyword;
    });
  }, [category, keyword]);

  return (
    <>
      <Head>
        <title>Servicos Udev | Produtos digitais para PMEs</title>
        <meta
          name="description"
          content="Produtos e servicos da Udev com foco em eficiencia operacional: sites, sistemas, automacao, CRMs, dashboards e SaaS."
        />
      </Head>

      <SiteHeader />

      <main className="page">
        <section className="hero hero--compact" data-animate="fade-up">
          <h1 className="hero-title">Produtos e Servicos</h1>
          <p className="lead">Solucoes digitais praticas para reduzir tarefas manuais e escalar resultados.</p>
        </section>

        <section className="section" data-animate="fade-up">
          <h2 className="section-title">Filtrar por categoria</h2>
          <form className="card form-grid" onSubmit={(event) => event.preventDefault()}>
            <div>
              <label htmlFor="service-category">Categoria</label>
              <select
                id="service-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                aria-label="Selecionar categoria"
              >
                {categories.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="service-keyword">Palavra-chave</label>
              <input
                id="service-keyword"
                type="search"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Ex.: CRM"
                aria-label="Buscar servico por palavra-chave"
              />
            </div>
          </form>
        </section>

        <section className="section" data-animate="fade-up">
          <h2 className="section-title">Vitrine</h2>
          <div className="card-grid card-grid--services">
            {filtered.map((service, index) => (
              <article className="card" key={service.id}>
                <img src="/assets/products/placeholder.png" alt={`Servico ${service.title}`} className="service-image" />
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <p className="muted">Preco a partir de R$ {1990 + index * 700}</p>
                <Link href={`/product/${service.id}`} className="btn btn-secondary" title={`Saiba mais sobre ${service.title}`}>
                  Saiba mais
                </Link>
              </article>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="muted">Nenhum servico encontrado para os filtros selecionados.</p>
          )}
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
