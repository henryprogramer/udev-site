import Head from 'next/head';
import Link from 'next/link';
import SiteFooter from '../../components/SiteFooter';
import SiteHeader from '../../components/SiteHeader';
import { leaders } from '../../lib/siteContent';

export default function PortfolioPage({ leader }) {
  if (!leader) return null;

  return (
    <>
      <Head>
        <title>{`${leader.name} | Portfolio Udev`}</title>
        <meta
          name="description"
          content={`${leader.name} - ${leader.role}. Portfolio individual com projetos, stack, contribuicoes e metas na Udev.`}
        />
      </Head>

      <SiteHeader />

      <main className="page">
        <article className="portfolio-page">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/" title="Home">
              Home
            </Link>{' '}
            /{' '}
            <Link href="/team" title="Equipe">
              Equipe
            </Link>{' '}
            / <span>{leader.name}</span>
          </nav>

          <header className="profile-header card" data-role="founder">
            <img
              src={leader.image || '/assets/team/placeholder.png'}
              alt={`Foto de ${leader.name}`}
              className="profile-header__photo"
            />
            <div>
              <h1 className="hero-title">{leader.name}</h1>
              <p className="lead">{leader.role}</p>
              <p>{leader.bio}</p>
              <div className="actions-row">
                <a
                  href={`mailto:${leader.email}`}
                  className="btn btn-secondary"
                  title={`Enviar e-mail para ${leader.name}`}
                  aria-label={`Enviar e-mail para ${leader.name}`}
                >
                  Email
                </a>
                <a
                  href={leader.linkedin}
                  target="_blank"
                  rel="noopener"
                  className="btn btn-secondary"
                  title={`LinkedIn de ${leader.name}`}
                  aria-label={`LinkedIn de ${leader.name}`}
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </header>

          <section className="section">
            <h2 className="section-title">Especialidades</h2>
            <ul>
              {leader.specialties.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="section">
            <h2 className="section-title">Stack</h2>
            <div className="chips">
              {leader.stack.map((tech) => (
                <span className="chip" key={tech}>
                  {tech}
                </span>
              ))}
            </div>
          </section>

          <section className="section">
            <h2 className="section-title">Projetos</h2>
            <div className="card-grid">
              {leader.projects.map((project) => (
                <article key={project.title} className="project-item card">
                  <h3>{project.title}</h3>
                  <p>
                    <strong>Problema:</strong> {project.problem}
                  </p>
                  <p>
                    <strong>Solucao:</strong> {project.solution}
                  </p>
                  <div className="chips">
                    {project.technologies.map((technology) => (
                      <span className="chip" key={technology}>
                        {technology}
                      </span>
                    ))}
                  </div>
                  <Link href={project.caseLink} title={`Ver case de ${project.title}`}>
                    Ver case
                  </Link>
                </article>
              ))}
            </div>
          </section>

          <section className="section split-grid">
            <article className="card">
              <h2 className="section-title">Contribuicoes na Udev</h2>
              <ul>
                {leader.contributions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="card">
              <h2 className="section-title">Metas 2026-2030</h2>
              <ul>
                {leader.goals.map((goal) => (
                  <li key={goal}>{goal}</li>
                ))}
              </ul>
            </article>
          </section>

          <footer className="card">
            <div className="actions-row">
              <a href={leader.linkedin} target="_blank" rel="noopener" title={`LinkedIn de ${leader.name}`}>
                LinkedIn
              </a>
              <a href={leader.github} target="_blank" rel="noopener" title={`GitHub de ${leader.name}`}>
                GitHub
              </a>
              <a href={`mailto:${leader.email}`} title={`Email de ${leader.name}`}>
                Email
              </a>
            </div>
          </footer>
        </article>
      </main>

      <SiteFooter />
    </>
  );
}

export async function getStaticPaths() {
  return {
    paths: leaders.map((leader) => ({ params: { slug: leader.slug } })),
    fallback: false
  };
}

export async function getStaticProps({ params }) {
  const leader = leaders.find((item) => item.slug === params.slug) || null;

  return {
    props: {
      leader
    }
  };
}
