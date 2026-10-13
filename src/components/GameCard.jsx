import { useLayoutEffect, useRef, useState } from 'react';
import { formatDate } from '../data/catalog';
import { useTrailerPreview } from '../hooks/useTrailerPreview';
import { IconCheck, IconPlus } from './Icons';
import { Platforms, Price } from './GameBits';
import './GameCard.css';

const reviewTone = (percent) => (percent >= 70 ? 'is-positive' : percent >= 40 ? 'is-mixed' : 'is-negative');

export default function GameCard({ game, owned, onOpen, onToggleLibrary, footer }) {
  const [broken, setBroken] = useState(false);
  const preview = useTrailerPreview(game.trailer?.src);
  const peekRef = useRef(null);
  const [peekLeft, setPeekLeft] = useState(false);

  // The info panel opens to the right of the card, or to the left when it would run off-screen
  useLayoutEffect(() => {
    if (!preview.open) {
      setPeekLeft(false);
      return;
    }
    const r = peekRef.current?.getBoundingClientRect();
    if (r && r.right > document.documentElement.clientWidth - 12) setPeekLeft(true);
  }, [preview.open]);

  // the card's genre line ("Survival horror") as a tag too, unless the genres already say it ("Action adventure")
  const genres = game.genres.map((t) => t.toLowerCase());
  const specific = game.genre.toLowerCase();
  const tags = specific.split(/[\s-]+/).every((w) => genres.includes(w)) ? genres : [specific, ...genres.filter((t) => t !== specific)];

  return (
    <article
      className={`card${owned ? ' is-owned' : ''}${preview.playing ? ' is-previewing' : ''}`}
      {...preview.triggers}
    >
      <div className="card__media">
        {broken ? (
          <div className="card__fallback">
            <span className="card__fallback-title">{game.title}</span>
            <span className="eyebrow">Artwork unavailable</span>
          </div>
        ) : (
          <img src={game.art.cover} alt="" loading="lazy" decoding="async" onError={() => setBroken(true)} />
        )}
        {preview.mounted && <video key={preview.run} className="card__video" {...preview.videoProps} />}
        {game.discount > 0 && <span className="card__badge">−{game.discount}%</span>}
      </div>

      <button
        type="button"
        className="card__hit"
        onClick={() => {
          preview.close();
          onOpen(game.id);
        }}
      >
        <span className="visually-hidden">{game.title} — view details</span>
      </button>

      <button
        type="button"
        className="card__lib"
        onClick={() => onToggleLibrary(game)}
        aria-pressed={owned}
        aria-label={owned ? `Remove ${game.title} from library` : `Add ${game.title} to library`}
        title={owned ? 'In your library — click to remove' : 'Add to library'}
      >
        {owned ? <IconCheck /> : <IconPlus />}
      </button>

      <div className="card__body">
        <h3 className="card__title">{game.title}</h3>
        <div className="card__meta">
          <span className="card__genre">{game.genre}</span>
          <Platforms ids={game.platforms} size={13} />
        </div>
        <div className="card__foot">{footer ?? <Price game={game} size="sm" />}</div>
      </div>

      {/* Steam-style hover info, beside the card. Mouse-only extra: the details dialog has all of it. */}
      {preview.open && (
        <div ref={peekRef} className={`peek${peekLeft ? ' is-left' : ''}`} aria-hidden="true">
          <p className="peek__title">{game.title}</p>
          <p className="peek__date">Released {formatDate(game.released)}</p>
          <p className="peek__blurb">{game.blurb}</p>
          <div className="peek__reviews">
            <p className="eyebrow">Reviews</p>
            <p className={`peek__score ${reviewTone(game.rating.percent)}`}>{game.rating.label}</p>
            <p>
              {game.rating.percent}% of {game.rating.count.toLocaleString('en-US')} reviews
            </p>
          </div>
          <p className="eyebrow">Tags</p>
          <ul className="peek__tags">
            {tags.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
