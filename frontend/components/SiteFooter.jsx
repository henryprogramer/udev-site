import Link from 'next/link';
import { socials, storeUrl } from '../lib/siteContent';

const quickLinks = [
  { href: '/about', label: 'Sobre a Udev' },
  { href: '/services', label: 'Produtos e Servicos' },
  { href: '/team', label: 'Membros' },
  { href: '/contact', label: 'Contato' }
];

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <div>
          <h3 className="section-title">Udev</h3>
          <p className="muted">
            Solucoes digitais praticas para PMEs com foco em eficiencia operacional e crescimento.
          </p>
        </div>

        <div>
          <h4>Links Uteis</h4>
          <ul className="list-plain">
            {quickLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} title={item.label}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4>Redes</h4>
          <ul className="list-plain">
            <li>
              <a
                href={socials.instagram}
                target="_blank"
                rel="noopener"
                title="Instagram da Udev"
                aria-label="Instagram da Udev"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href={socials.youtube}
                target="_blank"
                rel="noopener"
                title="YouTube da Udev"
                aria-label="YouTube da Udev"
              >
                YouTube
              </a>
            </li>
            <li>
              <a
                href={socials.linkedin}
                target="_blank"
                rel="noopener"
                title="LinkedIn da Udev"
                aria-label="LinkedIn da Udev"
              >
                LinkedIn
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="site-footer__bottom">
        <p className="muted">Ideia: 29/03/2023 | Estruturacao oficial: 30/11/2025</p>
        <a
          href={storeUrl}
          className="btn btn-secondary"
          target="_blank"
          rel="noopener"
          title="Acessar loja institucional"
          aria-label="Acessar loja institucional"
        >
          Acessar Loja Institucional
        </a>
      </div>
    </footer>
  );
}
