import { useRef, useState } from 'react';
import { PLATFORMS, formatCount, formatDate } from '../data/catalog';
import { useModal } from '../hooks/useModal';
import { IconCheck, IconClose, IconExternal, IconPlay, PLATFORM_GLYPH } from './Icons';
import { LibraryButton, Price } from './GameBits';
import './GameDetail.css';

export default function GameDetail({ game, owned, onToggleLibrary, onTrailer, onClose }) {
  const [closing, setClosing] = useState(false);
  const [shot, setShot] = useState(0);
  const closeRef = useRef(null);
  const shots = game.art.shots;

  const closingRef = useRef(false);
  const requestClose = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    release();
    setClosing(true);
    window.setTimeout(onClose, 220);
  };
  const release = useModal(requestClose, closeRef);

  return (
    <div className={`modal${closing ? ' is-closing' : ''}`} role="dialog" aria-modal="true" aria-labelledby="detail-title">
      <div className="modal__backdrop" onClick={requestClose} />

      <div className="detail">
        <button ref={closeRef} type="button" className="detail__close" onClick={requestClose} aria-label="Close details">
          <IconClose />
          <kbd>Esc</kbd>
        </button>

        <header className="detail__head">
          <img className="detail__banner" src={game.art.hero} alt="" style={{ objectPosition: game.focus }} />
          <div className="detail__head-scrim" />
          <div className="detail__head-content">
            <p className="eyebrow detail__eyebrow">
              {game.genre}
              <span aria-hidden="true">/</span>
              {game.developer}
            </p>
            <h2 id="detail-title" className="detail__title">
              {game.title}
            </h2>
          </div>
        </header>

        <div className="detail__body">
          <div className="detail__main">
            <figure className="gallery">
              <div className="gallery__stage">
                {shots.map((src, i) => (
                  <img
                    key={src}
                    src={src}
                    alt={`${game.title} screenshot ${i + 1}`}
                    className={i === shot ? 'is-active' : ''}
                    loading={i === 0 ? 'eager' : 'lazy'}
                  />
                ))}
                {game.trailer && (
                  <button type="button" className="gallery__play" onClick={() => onTrailer(game.id)}>
                    <span className="gallery__play-icon">
                      <IconPlay width={18} height={18} />
                    </span>
                    <span>
                      <span className="gallery__play-label">Play trailer</span>
                      <span className="gallery__play-name">{game.trailer.name}</span>
                    </span>
                  </button>
                )}
              </div>
              <div className="gallery__thumbs" role="tablist" aria-label="Screenshots">
                {shots.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    role="tab"
                    aria-selected={i === shot}
                    aria-label={`Screenshot ${i + 1}`}
                    className={`gallery__thumb${i === shot ? ' is-active' : ''}`}
                    onClick={() => setShot(i)}
                  >
                    <img src={src} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            </figure>

            <section className="detail__section">
              <h3 className="eyebrow">About the game</h3>
              <p className="detail__lede">{game.blurb}</p>
              <p className="detail__about">{game.about}</p>
            </section>

            {game.features.length > 0 && (
              <section className="detail__section">
                <h3 className="eyebrow">Features</h3>
                <ul className="detail__features">
                  {game.features.map((f) => (
                    <li key={f}>
                      <IconCheck width={14} height={14} />
                      {f}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside className="detail__aside">
            <div className="buy">
              <Price game={game} size="lg" />
              <div className="buy__actions">
                <LibraryButton game={game} owned={owned} onToggle={onToggleLibrary} size="lg" block withPrice={false} />
                <button type="button" className="btn btn--secondary btn--lg btn--block" onClick={() => onTrailer(game.id)}>
                  <IconPlay />
                  Watch trailer
                </button>
              </div>
              <p className="buy__note">Demo store: adding a game saves it to your library in this browser. Nothing is charged.</p>
            </div>

            <dl className="facts">
              <div>
                <dt>Reviews</dt>
                <dd>
                  <span className="facts__score">{game.rating.percent}%</span> positive
                  <span className="facts__sub">
                    {game.rating.label} · {formatCount(game.rating.count)}
                  </span>
                </dd>
              </div>
              {game.metacritic && (
                <div>
                  <dt>Metacritic</dt>
                  <dd>{game.metacritic}</dd>
                </div>
              )}
              <div>
                <dt>Released</dt>
                <dd>{formatDate(game.released)}</dd>
              </div>
              <div>
                <dt>Developer</dt>
                <dd>{game.developer}</dd>
              </div>
              <div>
                <dt>Publisher</dt>
                <dd>{game.publisher}</dd>
              </div>
              <div>
                <dt>Platforms</dt>
                <dd className="facts__platforms">
                  {PLATFORMS.filter((p) => game.platforms.includes(p.id)).map((p) => {
                    const Glyph = PLATFORM_GLYPH[p.id];
                    return (
                      <span key={p.id}>
                        <Glyph width={14} height={14} />
                        {p.long}
                      </span>
                    );
                  })}
                </dd>
              </div>
            </dl>

            <a
              className="detail__steam"
              href={`https://store.steampowered.com/app/${game.appid}`}
              target="_blank"
              rel="noreferrer"
            >
              View on Steam
              <IconExternal width={14} height={14} />
            </a>
          </aside>
        </div>
      </div>
    </div>
  );
}
