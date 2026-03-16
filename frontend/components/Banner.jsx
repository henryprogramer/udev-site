export default function Banner() {
  return (
    <article className="banner card" data-animate="fade-up">
      <div className="banner__copy">
        <p className="muted">Udev Signature Layer</p>
        <h2 className="section-title">Design, clareza e impacto para operacoes reais.</h2>
        <p className="lead">
          Camada visual e estrategica para apresentar a startup com autoridade e converter interesse em negocio.
        </p>
      </div>
      <div className="mockup-placeholder" aria-label="Placeholder de mockup principal" role="img">
        {/* substituir por /assets/mockups/hero-1.png */}
      </div>
    </article>
  );
}
