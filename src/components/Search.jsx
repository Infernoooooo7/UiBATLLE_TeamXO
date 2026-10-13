import { useEffect, useMemo, useRef, useState } from 'react';
import { GAMES, TRENDING, filterGames, platformLabel } from '../data/catalog';
import { isModalOpen } from '../hooks/useModal';
import { IconArrowRight, IconSearch } from './Icons';
import { Price } from './GameBits';
import './Search.css';

const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

function Highlight({ text, query }) {
  const q = query.trim();
  const i = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark>{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

/**
 * The query is owned by App: typing filters the catalog instantly,
 * together with the active platform filter.
 */
export default function Search({ query, onQueryChange, platform = 'all', onOpenGame, onSearchAll }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(-1);
  const inputRef = useRef(null);
  const wrapRef = useRef(null);

  const q = query.trim();
  const matches = useMemo(() => (q ? filterGames(GAMES, { platform, query: q }) : []), [q, platform]);
  const results = q ? matches.slice(0, 6) : TRENDING.slice(0, 5);
  const where = platform !== 'all' ? ` on ${platformLabel(platform)}` : '';

  // "/" or Ctrl/Cmd+K focuses search from anywhere (except inside a dialog)
  useEffect(() => {
    const onKey = (e) => {
      const isK = e.key.toLowerCase() === 'k' && (IS_MAC ? e.metaKey : e.ctrlKey);
      const tag = document.activeElement?.tagName;
      const isSlash = e.key === '/' && !e.metaKey && !e.ctrlKey && !['INPUT', 'TEXTAREA', 'SELECT'].includes(tag);
      if (!isK && !isSlash) return;
      if (isModalOpen()) return;
      e.preventDefault();
      inputRef.current?.focus();
      inputRef.current?.select();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  // keep the highlighted row valid as results change
  useEffect(() => {
    setIndex((i) => Math.min(i, results.length - 1));
  }, [results.length]);

  const close = () => {
    setOpen(false);
    setIndex(-1);
    inputRef.current?.blur();
  };

  const choose = (game) => {
    close();
    onOpenGame(game.id);
  };

  const showAll = () => {
    if (!q) return;
    close();
    onSearchAll(q);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (index >= 0 && results[index]) choose(results[index]);
      else showAll();
    } else if (e.key === 'Escape') {
      e.stopPropagation();
      if (query) {
        onQueryChange('');
        setIndex(-1);
      } else close();
    }
  };

  return (
    <div className={`search${open ? ' is-open' : ''}`} ref={wrapRef}>
      <label className="search__field">
        <IconSearch className="search__icon" />
        <span className="visually-hidden">Search the store</span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder="Search games, studios, genres"
          onChange={(e) => {
            onQueryChange(e.target.value);
            setIndex(-1);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          role="combobox"
          aria-expanded={open}
          aria-controls="search-results"
          aria-autocomplete="list"
          aria-keyshortcuts={IS_MAC ? 'Meta+K /' : 'Control+K /'}
          aria-activedescendant={index >= 0 && results[index] ? `sr-${results[index].id}` : undefined}
          autoComplete="off"
          spellCheck={false}
        />
        {query ? (
          <button
            type="button"
            className="search__clear"
            onClick={() => {
              onQueryChange('');
              setIndex(-1);
              inputRef.current?.focus();
            }}
          >
            Clear
          </button>
        ) : (
          <kbd className="search__kbd" aria-hidden="true">
            {IS_MAC ? '⌘K' : 'Ctrl K'}
          </kbd>
        )}
      </label>

      {open && (
        <div className="search__panel">
          <p className="search__label eyebrow">
            {q ? (matches.length ? `${matches.length} match${matches.length > 1 ? 'es' : ''}${where}` : `No matches${where}`) : 'Trending now'}
          </p>

          {results.length > 0 && (
            <ul id="search-results" role="listbox" aria-label="Search results">
              {results.map((g, i) => (
                <li
                  key={g.id}
                  id={`sr-${g.id}`}
                  role="option"
                  aria-selected={i === index}
                  className={`search__item${i === index ? ' is-active' : ''}`}
                  onMouseEnter={() => setIndex(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(g)}
                >
                  <img src={g.art.cover} alt="" loading="lazy" />
                  <div className="search__text">
                    <p className="search__title">
                      <Highlight text={g.title} query={q} />
                    </p>
                    <p className="search__meta">
                      {g.genre} · {g.developer}
                    </p>
                  </div>
                  <Price game={g} size="sm" className="search__price" />
                </li>
              ))}
            </ul>
          )}

          {q && matches.length === 0 && (
            <p className="search__empty">
              Nothing matches “{q}”{where}. Try a studio like <em>FromSoftware</em> or a genre like <em>horror</em>
              {where && ', or switch the platform filter to All'}.
            </p>
          )}

          {q && matches.length > 0 && (
            <button type="button" className="search__all" onMouseDown={(e) => e.preventDefault()} onClick={showAll}>
              <span>
                Show {matches.length > 1 ? `all ${matches.length} results` : 'it'} in the catalog
              </span>
              <IconArrowRight />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
