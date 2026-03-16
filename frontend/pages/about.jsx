import Head from 'next/head';
import Link from 'next/link';
import SiteFooter from '../components/SiteFooter';
import SiteHeader from '../components/SiteHeader';
import { mission, originText, timeline, values } from '../lib/siteContent';

const differentials = [
  'Entrega rapida de MVPs com foco em valor de negocio.',
  'Foco em usabilidade para adocao real pelos times.',
  'Integracao hardware-software para cenarios hibridos.',
  'Solucoes escalaveis com arquitetura orientada a evolucao.'
];

const technologies = ['React', 'Node.js', 'Python', 'Electron', 'PostgreSQL', 'Docker'];

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>Sobre a Udev | Tecnologia pratica para PMEs</title>
        <meta
          name="description"
          content="Udev - solucoes digitais praticas para PMEs. Sites, sistemas, automacao e SaaS com foco em eficiencia e crescimento sustentavel."
        />
      </Head>

      <SiteHeader />

      <main className="page">
        <section className="hero hero--compact" data-animate="fade-up">
          <h1 className="hero-title">Sobre a Udev</h1>
          <p className="lead">{originText}</p>
        </section>

        <section className="section" data-animate="fade-up">
          <h2 className="section-title">Nossa Historia</h2>
          <p>{originText}</p>
          <ol className="timeline">
            {timeline.map((event) => (
              <li key={event.date} className="card">
                <span className="timeline__date">{event.date}</span>
                <p>{event.label}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="section split-grid" data-animate="fade-up">
          <article className="card">
            <h2 className="section-title">Missao</h2>
            <p>{mission}</p>
            <ul>
              {values.map((value) => (
                <li key={value}>{value}</li>
              ))}
            </ul>
          </article>

          <article className="card">
            <h2 className="section-title">Diferenciais</h2>
            <ul>
              {differentials.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </section>

        <section className="section" data-animate="fade-up">
          <h2 className="section-title">Tecnologias</h2>
          <div className="chips">
            {technologies.map((tech) => (
              <span className="chip" key={tech}>
                {tech}
              </span>
            ))}
          </div>
        </section>

        <section className="section cta-block" data-animate="fade-up">
          <h2 className="section-title">Proximos Passos</h2>
          <div className="actions-row">
            <Link href="/cases" className="btn btn-primary" title="Conheca nossos projetos">
              Conheca nossos projetos
            </Link>
            <Link href="/contact" className="btn btn-secondary" title="Contrate uma consultoria">
              Contrate uma consultoria
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
