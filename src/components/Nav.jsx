import { useEffect, useState } from 'react';
import { IconLibrary } from './Icons';
import Logo from './Logo';
import Search from './Search';
import './Nav.css';

const LINKS = [
  { id: 'discover', label: 'Discover' },
  { id: 'browse', label: 'Browse' },
  { id: 'deals', label: 'Deals' },
];

export default function Nav({ view, active, librarySize, onNavigate, onOpenGame, onSearchAll }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (id) => (e) => {
    e.preventDefault();
    onNavigate(id);
  };

  return (
    <header className={`nav${scrolled || view === 'library' ? ' is-solid' : ''}`}>
      <div className="nav__inner container">
        <a href="#top" className="brand" onClick={go('discover')} aria-label="XO Store — home">
          <Logo />
        </a>

        <nav className="nav__links" aria-label="Store">
          {LINKS.map((l) => (
            <a
              key={l.id}
              href={`#${l.id === 'deals' ? 'browse' : l.id}`}
              className={`nav__link${active === l.id ? ' is-active' : ''}`}
              aria-current={active === l.id ? 'page' : undefined}
              onClick={go(l.id)}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="nav__end">
          <Search onOpenGame={onOpenGame} onSearchAll={onSearchAll} />
          <button
            type="button"
            className={`nav__library${active === 'library' ? ' is-active' : ''}`}
            onClick={() => onNavigate('library')}
            aria-current={active === 'library' ? 'page' : undefined}
          >
            <IconLibrary />
            <span>Library</span>
            <span className="nav__count" key={librarySize} aria-label={`${librarySize} games`}>
              {librarySize}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
