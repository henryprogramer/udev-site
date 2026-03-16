import Head from 'next/head';
import SiteFooter from '../components/SiteFooter';
import SiteHeader from '../components/SiteHeader';

export default function ContactPage() {
  return (
    <>
      <Head>
        <title>Contato Udev | Fale com nosso time</title>
        <meta
          name="description"
          content="Entre em contato com a Udev para projetos de sites, sistemas, automacao, dashboards e SaaS sob medida."
        />
      </Head>

      <SiteHeader />

      <main className="page">
        <section className="hero hero--compact" data-animate="fade-up">
          <h1 className="hero-title">Fale com a Udev</h1>
          <p className="lead">Envie seu contexto e retornamos com diagnostico objetivo e proximos passos.</p>
        </section>

        <section className="section split-grid" data-animate="fade-up">
          <article className="card">
            <h2 className="section-title">Formulario</h2>
            <form className="form-grid" action="#" method="post">
              <div>
                <label htmlFor="name">Nome</label>
                <input id="name" name="name" type="text" required aria-label="Digite seu nome" />
              </div>

              <div>
                <label htmlFor="email">E-mail</label>
                <input id="email" name="email" type="email" required aria-label="Digite seu e-mail" />
              </div>

              <div className="form-grid__full">
                <label htmlFor="message">Mensagem</label>
                <textarea id="message" name="message" rows="6" required aria-label="Digite sua mensagem" />
              </div>

              <label className="checkbox-inline form-grid__full" htmlFor="consent">
                <input id="consent" name="consent" type="checkbox" required />
                Concordo com o uso dos meus dados para retorno comercial, conforme aviso de privacidade.
              </label>

              <button className="btn btn-primary" type="submit" aria-label="Enviar mensagem para Udev">
                Enviar
              </button>
            </form>
          </article>

          <article className="card">
            <h2 className="section-title">Canais alternativos</h2>
            <ul className="list-plain list-spaced">
              <li>
                <strong>WhatsApp:</strong>{' '}
                <a
                  href="https://wa.me/5500000000000"
                  target="_blank"
                  rel="noopener"
                  title="Conversar no WhatsApp"
                  aria-label="Conversar no WhatsApp"
                >
                  Iniciar conversa
                </a>
              </li>
              <li>
                <strong>Email comercial:</strong>{' '}
                <a href="mailto:contato@udev.com.br" title="Enviar e-mail para contato@udev.com.br">
                  contato@udev.com.br
                </a>
              </li>
              <li>
                <strong>Endereco:</strong> Rua Exemplo, 123 - Cidade/UF
              </li>
            </ul>

            <div className="map-frame">
              <iframe
                src="https://www.google.com/maps/embed?pb=SEU_EMBED_AQUI"
                title="Mapa de localizacao da Udev"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <p className="muted">
              Aviso de privacidade: seus dados serao usados apenas para retorno comercial e diagnostico da demanda.
            </p>
          </article>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
