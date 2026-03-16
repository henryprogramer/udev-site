import Head from 'next/head';
import SiteFooter from '../components/SiteFooter';
import SiteHeader from '../components/SiteHeader';
import { cases } from '../lib/siteContent';

export default function CasesPage() {
  return (
    <>
      <Head>
        <title>Cases Udev | Projetos e resultados</title>
        <meta
          name="description"
          content="Cases da Udev com problema, solucao e KPI para demonstrar resultado real em operacoes de PMEs."
        />
      </Head>

      <SiteHeader />

      <main className="page">
        <section className="hero hero--compact" data-animate="fade-up">
          <h1 className="hero-title">Cases Udev</h1>
          <p className="lead">Projetos com foco em impacto mensuravel e evolucao operacional.</p>
        </section>

        <section className="section" data-animate="fade-up">
          <div className="card-grid">
            {cases.map((item) => (
              <article key={item.id} id={item.id} className="card">
                <h2 className="section-title">{item.title}</h2>
                <p>
                  <strong>Problema:</strong> {item.problem}
                </p>
                <p>
                  <strong>Resultado:</strong> {item.result}
                </p>
                <p>
                  <strong>KPI:</strong> {item.kpi}
                </p>
                <blockquote>{item.testimonial}</blockquote>
              </article>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
