import { useState } from 'react';
import { useTrailerPreview } from '../hooks/useTrailerPreview';
import { IconCheck, IconPlus } from './Icons';
import { Platforms, Price } from './GameBits';
import './GameCard.css';

export default function GameCard({ game, owned, onOpen, onToggleLibrary, footer }) {
  const [broken, setBroken] = useState(false);
  const preview = useTrailerPreview(game.trailer?.src);

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
          preview.stop();
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
    </article>
  );
}
