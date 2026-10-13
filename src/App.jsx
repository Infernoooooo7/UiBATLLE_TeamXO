import { useCallback, useEffect, useState } from 'react';
import { FEATURED, getGame } from './data/catalog';
import { useLibrary } from './hooks/useLibrary';
import Nav from './components/Nav';
import Hero from './components/Hero';
import Discover from './components/Discover';
import Library from './components/Library';
import GameDetail from './components/GameDetail';
import TrailerTheater from './components/TrailerTheater';
import Toasts, { useToasts } from './components/Toasts';
import Footer from './components/Footer';

const DEFAULT_FILTERS = { platform: 'all', genre: 'all', sort: 'trending', query: '', sale: false };

export default function App() {
  const [view, setView] = useState('store');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [detailId, setDetailId] = useState(null);
  const [trailerId, setTrailerId] = useState(null);
  const [scrollTarget, setScrollTarget] = useState(null);
  const [section, setSection] = useState('discover');
  const library = useLibrary();
  const { toasts, push, dismiss } = useToasts();

  // Scroll after the target view has rendered
  useEffect(() => {
    if (!scrollTarget) return undefined;
    const frame = requestAnimationFrame(() => {
      if (scrollTarget === 'top') window.scrollTo({ top: 0, behavior: 'smooth' });
      else if (scrollTarget === 'top-instant') window.scrollTo({ top: 0, behavior: 'instant' });
      else document.getElementById(scrollTarget)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setScrollTarget(null);
    });
    return () => cancelAnimationFrame(frame);
  }, [scrollTarget]);

  // Which store section is in view, for the nav indicator
  useEffect(() => {
    if (view !== 'store') return undefined;
    const onScroll = () => {
      const browse = document.getElementById('browse');
      if (!browse) return;
      setSection(browse.getBoundingClientRect().top < window.innerHeight * 0.5 ? 'browse' : 'discover');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [view]);

  const navigate = useCallback((id) => {
    if (id === 'library') {
      setView('library');
      setScrollTarget('top-instant');
      return;
    }
    setView('store');
    setSection(id === 'discover' ? 'discover' : 'browse');
    if (id === 'discover') {
      setScrollTarget('top');
    } else {
      setFilters((f) => ({ ...f, sale: id === 'deals' }));
      setScrollTarget('browse');
    }
  }, []);

  const setQuery = useCallback((query) => setFilters((f) => ({ ...f, query })), []);

  const searchAll = useCallback((query) => {
    setView('store');
    setFilters((f) => ({ ...f, query, genre: 'all', sale: false }));
    setScrollTarget('browse');
  }, []);

  const toggleLibrary = useCallback(
    (game) => {
      if (library.has(game.id)) {
        const entry = library.entries.find((e) => e.id === game.id);
        library.remove(game.id);
        push({ game, message: 'Removed from library', action: { label: 'Undo', run: () => library.add(game.id, entry?.addedAt) } });
      } else {
        library.add(game.id);
        push({ game, message: 'Added to your library', action: { label: 'View', run: () => navigate('library') } });
      }
    },
    [library, navigate, push],
  );

  const active = view === 'library' ? 'library' : section === 'browse' && filters.sale ? 'deals' : section;
  const detailGame = detailId ? getGame(detailId) : null;
  const trailerGame = trailerId ? getGame(trailerId) : null;

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Nav
        view={view}
        active={active}
        librarySize={library.size}
        onNavigate={navigate}
        onOpenGame={setDetailId}
        onSearchAll={searchAll}
        query={filters.query}
        onQueryChange={setQuery}
        searchPlatform={view === 'store' ? filters.platform : 'all'}
      />

      {view === 'store' ? (
        <main id="main">
          <Hero
            games={FEATURED}
            isOwned={library.has}
            onToggleLibrary={toggleLibrary}
            onOpen={setDetailId}
            onTrailer={setTrailerId}
            paused={Boolean(detailId || trailerId)}
          />
          <Discover
            filters={filters}
            setFilters={setFilters}
            isOwned={library.has}
            onOpen={setDetailId}
            onToggleLibrary={toggleLibrary}
            onTrailer={setTrailerId}
          />
        </main>
      ) : (
        <Library
          entries={library.entries}
          isOwned={library.has}
          onOpen={setDetailId}
          onToggleLibrary={toggleLibrary}
          onBrowse={() => navigate('browse')}
        />
      )}

      <Footer />

      {detailGame && (
        <GameDetail
          key={`detail-${detailGame.id}`}
          game={detailGame}
          owned={library.has(detailGame.id)}
          onToggleLibrary={toggleLibrary}
          onTrailer={setTrailerId}
          onClose={() => setDetailId(null)}
        />
      )}
      {trailerGame && <TrailerTheater key={`trailer-${trailerGame.id}`} game={trailerGame} onClose={() => setTrailerId(null)} />}

      <Toasts toasts={toasts} dismiss={dismiss} />
    </>
  );
}
