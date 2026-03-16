import Head from 'next/head';
import Link from 'next/link';
import Banner from '../components/Banner';
import ProductCard from '../components/ProductCard';
import SiteFooter from '../components/SiteFooter';
import SiteHeader from '../components/SiteHeader';
import { useTheme } from '../context/ThemeContext';
import {
  cases,
  leaders,
  mission,
  originText,
  products,
  services,
  socials,
  storeUrl,
  values
} from '../lib/siteContent';
import { usePublicProducts } from '../lib/usePublicProducts';

export default function HomePage() {
  const { products: featuredProducts, loading: loadingProducts } = usePublicProducts(products);
  const { theme } = useTheme();
  const brandLogo =
    theme === 'light'
      ? '/assets/logos/logo-dark-lightmode.png'
      : '/assets/logos/logo-light-darkmode.png';

  return (
    <>
      <Head>
        <title>Udev | Solucoes digitais para PMEs</title>
        <meta
          name="description"
          content="Udev: landing institucional com servicos, portfolio dos membros, cases e acesso rapido a loja institucional."
        />
      </Head>

      <SiteHeader />

      <main className="page page--landing">
        <section id="hero" className="hero hero--landing" data-animate="fade-up">
          <div className="hero__copy">
            <p className="eyebrow">Startup de tecnologia para empresas em escala</p>
            <h1 className="hero-title">Produtos digitais que simplificam operacoes e ampliam resultados.</h1>
            <p className="lead">
              Tecnologia pratica para converter tarefas manuais em processos inteligentes e mensuraveis.
            </p>
            <div className="hero__actions">
              <Link
                href="/contact"
                className="btn btn-primary"
                title="Falar com a Udev"
                aria-label="Falar com a Udev"
              >
                Fale com a Udev
              </Link>
              <a
                href="#cases"
                className="btn btn-secondary"
                title="Conheca nossos projetos"
                aria-label="Conheca nossos projetos"
              >
                Conheca nossos projetos
              </a>
            </div>
          </div>

          <aside className="hero__visual card">
            <img src={brandLogo} alt="Udev - logo U.D com dragao" className="hero__logo" />
          </aside>
        </section>

        <Banner />

        <section id="about" className="section" data-animate="fade-up">
          <h2 className="section-title">Sobre a Startup</h2>
          <p className="lead">{originText}</p>
          <div className="split-grid">
            <article className="card">
              <h3>Missao</h3>
              <p>{mission}</p>
            </article>
            <article className="card">
              <h3>Valores</h3>
              <ul>
                {values.map((value) => (
                  <li key={value}>{value}</li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <section id="services" className="section" data-animate="fade-up">
          <div className="section__header">
            <h2 className="section-title">Servicos e Solucoes</h2>
            <Link href="/services" className="link-inline" title="Abrir pagina de servicos">
              Ver todos
            </Link>
          </div>

          <div className="card-grid card-grid--services">
            {services.slice(0, 6).map((service) => (
              <article className="card" key={service.id}>
                <img src="/assets/icons/placeholder.png" alt={`Icone de ${service.title}`} className="icon-mark" />
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <Link href="/services" title={`Saiba mais sobre ${service.title}`}>
                  Saiba mais
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section id="products-preview" className="section" data-animate="fade-up">
          <div className="section__header">
            <h2 className="section-title">Produtos em destaque</h2>
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener"
              className="link-inline"
              title="Abrir loja institucional"
            >
              Ir para loja
            </a>
          </div>
          {loadingProducts && <p className="muted">Sincronizando produtos da API...</p>}
          <div className="card-grid card-grid--products">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <section id="team-preview" className="section" data-animate="fade-up">
          <div className="section__header">
            <h2 className="section-title">Equipe</h2>
            <Link href="/team" className="link-inline" title="Abrir pagina de equipe">
              Ver equipe completa
            </Link>
          </div>
          <div className="card-grid card-grid--team">
            {leaders.map((leader) => (
              <article key={leader.slug} className="lead-card card" data-role="founder">
                <img
                  src={leader.image || '/assets/team/placeholder.png'}
                  alt={`Foto de ${leader.name}`}
                  className="lead-card__photo"
                />
                <h3>{leader.name}</h3>
                <p className="muted">{leader.role}</p>
                <p>{leader.shortBio}</p>
                <Link
                  href={`/portfolio/${leader.slug}`}
                  className="btn btn-secondary"
                  title={`Ver portfolio de ${leader.name}`}
                  aria-label={`Ver portfolio de ${leader.name}`}
                >
                  Ver Portfolio
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section id="cases" className="section" data-animate="fade-up">
          <div className="section__header">
            <h2 className="section-title">Projetos e Resultados</h2>
            <Link href="/cases" className="link-inline" title="Abrir pagina completa de cases">
              Cases completos
            </Link>
          </div>

          <div className="card-grid">
            {cases.map((item) => (
              <article key={item.id} className="card">
                <h3>{item.title}</h3>
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

        <section id="video" className="section" data-animate="fade-up">
          <h2 className="section-title">Video Institucional</h2>
          <div className="video-frame card">
            <iframe
              src="https://www.youtube.com/embed/VIDEO_ID"
              title="Video institucional da Udev"
              loading="lazy"
              allowFullScreen
            />
          </div>
          <p className="muted">Substitua VIDEO_ID pelo conteudo oficial da startup.</p>
        </section>

        <section id="socials" className="section" data-animate="fade-up">
          <h2 className="section-title">Redes</h2>
          <div className="actions-row">
            <a
              href={socials.instagram}
              target="_blank"
              rel="noopener"
              className="btn btn-secondary"
              title="Instagram da Udev"
              aria-label="Instagram da Udev"
            >
              Instagram
            </a>
            <a
              href={socials.youtube}
              target="_blank"
              rel="noopener"
              className="btn btn-secondary"
              title="YouTube da Udev"
              aria-label="YouTube da Udev"
            >
              YouTube
            </a>
            <a
              href={socials.linkedin}
              target="_blank"
              rel="noopener"
              className="btn btn-secondary"
              title="LinkedIn da Udev"
              aria-label="LinkedIn da Udev"
            >
              LinkedIn
            </a>
          </div>
        </section>

        <section id="cta-footer" className="section cta-block" data-animate="fade-up">
          <h2 className="section-title">Pronto para tirar seu projeto do papel?</h2>
          <p className="lead">Landing institucional, portfolio da equipe e paginas de venda no mesmo ecossistema Udev.</p>
          <div className="actions-row">
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener"
              className="btn btn-primary"
              title="Acessar Loja Institucional"
              aria-label="Acessar Loja Institucional"
            >
              Acessar Loja Institucional
            </a>
            <Link
              href="/contact"
              className="btn btn-secondary"
              title="Falar com a Udev"
              aria-label="Falar com a Udev"
            >
              Fale com a Udev
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
