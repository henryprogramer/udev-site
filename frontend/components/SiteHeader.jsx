import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { storeUrl } from '../lib/siteContent';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'Startup' },
  { href: '/services', label: 'Servicos' },
  { href: '/team', label: 'Equipe' },
  { href: '/cases', label: 'Cases' },
  { href: '/contact', label: 'Contato' }
];

export default function SiteHeader() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, isManager, logout } = useAuth();

  const logoSrc =
    theme === 'light'
      ? '/assets/logos/logo-dark-lightmode.png'
      : '/assets/logos/logo-light-darkmode.png';

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      <div className="fx-layer" aria-hidden="true">
        <span className="fx-orb fx-orb--one" />
        <span className="fx-orb fx-orb--two" />
        <span className="fx-orb fx-orb--three" />
      </div>
      <header id="site-header" className="site-header" data-animate="fade-down">
        <div className="site-header__inner">
          <Link
            href="/"
            className="brand"
            title="Pagina inicial da Udev"
            aria-label="Ir para a pagina inicial da Udev"
          >
            <img src={logoSrc} alt="Udev - logo U.D com dragao" className="brand__logo" />
            <span className="brand__text">Udev</span>
          </Link>

          <nav className="site-nav" aria-label="Navegacao principal">
            <ul className="site-nav__list">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} title={`Abrir ${item.label}`}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="site-header__actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={toggleTheme}
              title="Alternar tema"
              aria-label="Alternar tema claro e escuro"
            >
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>

            <a
              href={storeUrl}
              target="_blank"
              rel="noopener"
              className="btn btn-secondary"
              title="Acessar loja institucional"
              aria-label="Acessar loja institucional"
            >
              Loja
            </a>

            {!isAuthenticated && (
              <>
                <Link href="/login" className="btn btn-secondary" title="Entrar na conta">
                  Login
                </Link>
                <Link href="/cadastro" className="btn btn-primary" title="Criar conta de cliente">
                  Cadastro
                </Link>
              </>
            )}

            {isAuthenticated && (
              <>
                <Link href="/account" className="btn btn-secondary" title="Minha conta">
                  {user?.full_name?.split(' ')[0] || 'Conta'}
                </Link>

                {isManager && (
                  <Link href="/admin" className="btn btn-primary" title="Portal Admin Udev">
                    Portal Admin
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-secondary"
                  title="Sair da conta"
                  aria-label="Sair da conta"
                >
                  Sair
                </button>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
