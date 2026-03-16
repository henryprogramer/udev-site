import Head from 'next/head';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import SiteFooter from '../components/SiteFooter';
import SiteHeader from '../components/SiteHeader';
import { leaders } from '../lib/siteContent';

const specialties = [
  { value: 'all', label: 'Todas as especialidades' },
  { value: 'produto', label: 'Produto' },
  { value: 'backend', label: 'Backend' },
  { value: 'infraestrutura', label: 'Infraestrutura' },
  { value: 'financas', label: 'Financas' },
  { value: 'design', label: 'Design' },
  { value: 'iot', label: 'IoT e Hardware' }
];

export default function TeamPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredLeaders = useMemo(() => {
    return leaders.filter((leader) => {
      const normalizedSearch = search.trim().toLowerCase();
      const bySearch =
        normalizedSearch.length === 0 ||
        leader.name.toLowerCase().includes(normalizedSearch) ||
        leader.role.toLowerCase().includes(normalizedSearch);

      const byFilter =
        filter === 'all' ||
        leader.specialties.some((specialty) => specialty.toLowerCase().includes(filter));

      return bySearch && byFilter;
    });
  }, [filter, search]);

  return (
    <>
      <Head>
        <title>Equipe Udev | Liderancas e especialidades</title>
        <meta
          name="description"
          content="Conheca os membros da Udev, suas especialidades e portfolios individuais em tecnologia, produto, design e operacoes."
        />
      </Head>

      <SiteHeader />

      <main className="page">
        <section className="hero hero--compact" data-animate="fade-up">
          <h1 className="hero-title">Membros da Udev</h1>
          <p className="lead">Equipe multidisciplinar para construir solucoes digitais com foco em resultado.</p>
        </section>

        <section className="section" data-animate="fade-up">
          <h2 className="section-title">Buscar por especialidade</h2>
          <form className="card form-grid" onSubmit={(event) => event.preventDefault()} role="search">
            <div>
              <label htmlFor="member-search">Buscar por nome</label>
              <input
                id="member-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Ex.: Pedro"
                aria-label="Buscar membro por nome"
              />
            </div>

            <div>
              <label htmlFor="specialty-filter">Filtrar por especialidade</label>
              <select
                id="specialty-filter"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                aria-label="Filtrar por especialidade"
              >
                {specialties.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </form>
        </section>

        <section className="section" data-animate="fade-up">
          <h2 className="section-title">Liderancas</h2>
          <div className="card-grid card-grid--team">
            {filteredLeaders.map((leader) => (
              <article key={leader.slug} className="team-card lead-card card" data-role="founder">
                <img
                  src={leader.image || '/assets/team/placeholder.png'}
                  alt={`Foto de ${leader.name}`}
                  className="lead-card__photo"
                />
                <h3>{leader.name}</h3>
                <p className="muted">{leader.role}</p>
                <p className="muted">Tags: {leader.specialties.join(' | ')}</p>
                <p>{leader.bio}</p>
                <Link
                  href={`/portfolio/${leader.slug}`}
                  className="btn btn-secondary"
                  title={`Ver portfolio de ${leader.name}`}
                >
                  Ver Portfolio
                </Link>
              </article>
            ))}
          </div>
          {filteredLeaders.length === 0 && (
            <p className="muted">Nenhum membro encontrado para os filtros selecionados.</p>
          )}
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
