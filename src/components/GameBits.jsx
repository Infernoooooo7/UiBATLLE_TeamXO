import { PLATFORMS, finalPrice, formatPrice } from '../data/catalog';
import { IconCheck, IconPlus, PLATFORM_GLYPH } from './Icons';
import './GameBits.css';

export function Platforms({ ids, size = 14, className = '' }) {
  const names = ids.map((id) => PLATFORMS.find((p) => p.id === id)?.label).join(', ');
  return (
    <span className={`platforms ${className}`} role="img" aria-label={`Available on ${names}`} title={names}>
      {ids.map((id) => {
        const Glyph = PLATFORM_GLYPH[id];
        return <Glyph key={id} width={size} height={size} />;
      })}
    </span>
  );
}

export function Price({ game, size = 'md', className = '' }) {
  if (game.free) {
    return <p className={`price price--${size} ${className}`}><span className="price__now">Free to play</span></p>;
  }
  return (
    <p className={`price price--${size} ${className}`}>
      {game.discount > 0 && (
        <>
          {size !== 'sm' && <span className="price__cut">−{game.discount}%</span>}
          <s className="price__was">{formatPrice(game.price)}</s>
        </>
      )}
      <span className="price__now">{formatPrice(finalPrice(game))}</span>
    </p>
  );
}

/** Primary add/remove control. Hovering an owned game reveals "Remove". */
export function LibraryButton({ game, owned, onToggle, size, block = false, withPrice = true }) {
  const cls = `btn ${owned ? 'btn--owned' : 'btn--primary'}${size === 'lg' ? ' btn--lg' : ''}${block ? ' btn--block' : ''} lib-btn`;
  if (owned) {
    return (
      <button type="button" className={cls} onClick={() => onToggle(game)} aria-pressed="true">
        <IconCheck />
        <span className="lib-btn__owned">In your library</span>
        <span className="lib-btn__remove">Remove from library</span>
      </button>
    );
  }
  const price = finalPrice(game);
  return (
    <button type="button" className={cls} onClick={() => onToggle(game)} aria-pressed="false">
      <IconPlus />
      {game.free ? 'Add free game' : 'Add to library'}
      {withPrice && !game.free && (
        <span className="btn__price">
          {game.discount > 0 && <s>{formatPrice(game.price)}</s>}
          {formatPrice(price)}
        </span>
      )}
    </button>
  );
}
