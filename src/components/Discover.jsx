import { useMemo } from 'react';
import { GAMES, GENRES, SORTS, filterGames, platformLabel, sortGames } from '../data/catalog';
import { IconClose } from './Icons';
import GameCard from './GameCard';
import PlatformFilter from './PlatformFilter';
import SortMenu from './SortMenu';
import Trending from './Trending';
import './Discover.css';

export default function Discover({ filters, setFilters, isOwned, onOpen, onToggleLibrary, onTrailer }) {
  const { platform, genre, sort, query, sale } = filters;
  const set = (patch) => setFilters((f) => ({ ...f, ...patch }));

  const counts = useMemo(() => {
    const base = filterGames(GAMES, { genre, query, sale });
    return {
      all: base.length,
      pc: base.filter((g) => g.platforms.includes('pc')).length,
      ps: base.filter((g) => g.platforms.includes('ps')).length,
      xbox: base.filter((g) => g.platforms.includes('xbox')).length,
    };
  }, [genre, query, sale]);

  const list = useMemo(() => sortGames(filterGames(GAMES, filters), sort), [filters, sort]);
  const trending = useMemo(() => sortGames(filterGames(GAMES, { platform, genre, sale }), 'trending').slice(0, 6), [platform, genre, sale]);

  const narrowed = query.trim() || sale;
  const showTrending = !narrowed && trending.length >= 4;
  const where = platform === 'all' ? 'every platform' : platformLabel(platform);

  let heading = 'All games';
  if (query.trim()) heading = `Results for “${query.trim()}”`;
  else if (sale) heading = 'On sale this week';
  else if (genre !== 'all') heading = `${genre} games`;

  const reset = () => setFilters((f) => ({ ...f, platform: 'all', genre: 'all', query: '', sale: false }));

  return (
    <section className="discover" id="browse" aria-label="Browse games">
      <div className="toolbar">
        <div className="toolbar__inner container">
          <PlatformFilter value={platform} onChange={(id) => set({ platform: id })} counts={counts} />

          <div className="genres" role="radiogroup" aria-label="Genre">
            {['all', ...GENRES].map((g) => (
              <button
                key={g}
                type="button"
                role="radio"
                aria-checked={genre === g}
                className={`genres__opt${genre === g ? ' is-active' : ''}`}
                onClick={() => set({ genre: g })}
              >
                {g === 'all' ? 'All genres' : g}
              </button>
            ))}
          </div>

          <div className="toolbar__end">
            <button
              type="button"
              role="switch"
              aria-checked={sale}
              className={`sale-toggle${sale ? ' is-on' : ''}`}
              onClick={() => set({ sale: !sale })}
            >
              <span className="sale-toggle__box" aria-hidden="true" />
              On sale
            </button>
            <SortMenu value={sort} options={SORTS} onChange={(id) => set({ sort: id })} />
          </div>
        </div>
      </div>

      <div className="container discover__body">
        {showTrending && (
          <Trending
            games={trending}
            where={where}
            isOwned={isOwned}
            onOpen={onOpen}
            onToggleLibrary={onToggleLibrary}
            onTrailer={onTrailer}
          />
        )}

        <div className="catalog">
          <header className="section-head">
            <div>
              <p className="eyebrow">{query.trim() ? 'Search' : 'The catalog'}</p>
              <h2 className="section-title">{heading}</h2>
            </div>
            <div className="section-head__end">
              {query.trim() && (
                <button type="button" className="token" onClick={() => set({ query: '' })}>
                  “{query.trim()}”
                  <IconClose width={14} height={14} />
                  <span className="visually-hidden">Clear search</span>
                </button>
              )}
              <p className="section-count">
                {list.length} {list.length === 1 ? 'game' : 'games'}
                {platform !== 'all' && <> on {platformLabel(platform)}</>}
              </p>
            </div>
          </header>

          {list.length > 0 ? (
            <div className="card-grid">
              {list.map((g) => (
                <GameCard key={g.id} game={g} owned={isOwned(g.id)} onOpen={onOpen} onToggleLibrary={onToggleLibrary} />
              ))}
            </div>
          ) : (
            <div className="no-results">
              <p className="no-results__title">Nothing fits that combination.</p>
              <p className="no-results__text">
                No {genre !== 'all' ? genre.toLowerCase() + ' ' : ''}games
                {platform !== 'all' ? ` on ${platformLabel(platform)}` : ''}
                {sale ? ' are on sale' : ''}
                {query.trim() ? ` match “${query.trim()}”` : ''}. Loosen a filter or start over.
              </p>
              <button type="button" className="btn btn--secondary" onClick={reset}>
                Reset filters
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
