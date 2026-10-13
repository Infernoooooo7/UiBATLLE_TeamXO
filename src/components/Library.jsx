import { useMemo, useState } from 'react';
import { TRENDING, getGame } from '../data/catalog';
import { IconArrowRight, IconClose } from './Icons';
import GameCard from './GameCard';
import PlatformFilter from './PlatformFilter';
import SortMenu from './SortMenu';
import './Library.css';

const LIBRARY_SORTS = [
  { id: 'recent', label: 'Recently added' },
  { id: 'title', label: 'Title A–Z' },
  { id: 'release', label: 'Release date' },
];

const addedLabel = (ts) => {
  const mins = Math.round((Date.now() - ts) / 60000);
  if (mins < 1) return 'Added just now';
  if (mins < 60) return `Added ${mins} min ago`;
  return `Added ${new Date(ts).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`;
};

export default function Library({ entries, isOwned, onOpen, onToggleLibrary, onBrowse }) {
  const [platform, setPlatform] = useState('all');
  const [sort, setSort] = useState('recent');

  const owned = useMemo(
    () => entries.map((e) => ({ game: getGame(e.id), addedAt: e.addedAt })).filter((e) => e.game),
    [entries],
  );

  const counts = useMemo(
    () => ({
      all: owned.length,
      pc: owned.filter((e) => e.game.platforms.includes('pc')).length,
      ps: owned.filter((e) => e.game.platforms.includes('ps')).length,
      xbox: owned.filter((e) => e.game.platforms.includes('xbox')).length,
    }),
    [owned],
  );

  const visible = useMemo(() => {
    const list = platform === 'all' ? owned : owned.filter((e) => e.game.platforms.includes(platform));
    const out = [...list];
    if (sort === 'title') out.sort((a, b) => a.game.title.localeCompare(b.game.title));
    else if (sort === 'release') out.sort((a, b) => b.game.released.localeCompare(a.game.released));
    else out.sort((a, b) => b.addedAt - a.addedAt);
    return out;
  }, [owned, platform, sort]);

  const suggestions = useMemo(() => TRENDING.filter((g) => !isOwned(g.id)).slice(0, 6), [isOwned]);

  return (
    <main className="library" id="main">
      <div className="container">
        <header className="library__head">
          <p className="eyebrow">Your collection</p>
          <div className="library__titlebar">
            <h1 className="library__title">
              Library
              <span className="library__total">{owned.length}</span>
            </h1>
            {owned.length > 0 && (
              <div className="library__controls">
                <PlatformFilter value={platform} onChange={setPlatform} counts={counts} label="Filter library by platform" />
                <SortMenu value={sort} options={LIBRARY_SORTS} onChange={setSort} />
              </div>
            )}
          </div>
        </header>

        {owned.length === 0 ? (
          <section className="empty">
            <div className="empty__shelf" aria-hidden="true">
              {Array.from({ length: 6 }, (_, i) => (
                <span key={i} className="empty__slot" style={{ '--i': i }} />
              ))}
            </div>
            <div className="empty__copy">
              <h2 className="empty__title">Your backlog is suspiciously empty.</h2>
              <p className="empty__text">
                Add games from the store and they’ll wait here, sorted and ready — no judgement about how long they sit.
              </p>
              <button type="button" className="btn btn--primary btn--lg" onClick={onBrowse}>
                Browse the catalog
                <IconArrowRight />
              </button>
            </div>
          </section>
        ) : visible.length === 0 ? (
          <div className="library__none">
            <p>None of your games are on this platform yet.</p>
            <button type="button" className="btn btn--secondary" onClick={() => setPlatform('all')}>
              Show all platforms
            </button>
          </div>
        ) : (
          <div className="card-grid library__grid">
            {visible.map(({ game, addedAt }) => (
              <GameCard
                key={game.id}
                game={game}
                owned
                onOpen={onOpen}
                onToggleLibrary={onToggleLibrary}
                footer={
                  <div className="library__foot">
                    <span>{addedLabel(addedAt)}</span>
                    <button type="button" className="library__remove" onClick={() => onToggleLibrary(game)}>
                      <IconClose width={13} height={13} />
                      Remove
                    </button>
                  </div>
                }
              />
            ))}
          </div>
        )}

        {suggestions.length > 0 && (
          <section className="library__suggest">
            <header className="section-head">
              <div>
                <p className="eyebrow">{owned.length ? 'Pairs well with your library' : 'A good place to start'}</p>
                <h2 className="section-title">Trending right now</h2>
              </div>
              <button type="button" className="btn btn--quiet" onClick={onBrowse}>
                See the full catalog
                <IconArrowRight />
              </button>
            </header>
            <div className="card-grid">
              {suggestions.map((g) => (
                <GameCard key={g.id} game={g} owned={false} onOpen={onOpen} onToggleLibrary={onToggleLibrary} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
