import { useEffect, useState } from 'react';
import { formatCount, formatDate } from '../data/catalog';
import { IconArrowRight, IconPlay } from './Icons';
import { LibraryButton, Platforms } from './GameBits';
import './Hero.css';

const SLIDE_MS = 9000;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

export default function Hero({ games, isOwned, onToggleLibrary, onOpen, onTrailer, paused: externallyPaused }) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const reduced = usePrefersReducedMotion();
  const game = games[index];
  const paused = hovered || externallyPaused;

  const next = () => setIndex((i) => (i + 1) % games.length);

  return (
    <section
      className="hero"
      id="discover"
      aria-roledescription="carousel"
      aria-label="Featured games"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="hero__media" aria-hidden="true">
        {games.map((g, i) => (
          <img
            key={g.id}
            src={g.art.hero}
            alt=""
            className={`hero__img${i === index ? ' is-active' : ''}`}
            style={{ objectPosition: g.focus }}
            fetchPriority={i === 0 ? 'high' : 'low'}
            decoding="async"
          />
        ))}
        <div className="hero__scrim" />
      </div>

      <div className="hero__inner container">
        <div className="hero__content" key={game.id}>
          <p className="hero__kicker">
            <span className="hero__label">{game.featureLabel}</span>
            <span className="hero__studio">{game.developer}</span>
          </p>

          <h1 className="hero__title">
            {game.titleLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h1>

          <p className="hero__blurb">{game.blurb}</p>

          <ul className="hero__facts">
            <li>{game.genre}</li>
            <li>{formatDate(game.released, { month: 'short', year: 'numeric' })}</li>
            <li>
              <span className="hero__score">{game.rating.percent}%</span> positive · {formatCount(game.rating.count)}
            </li>
            <li>
              <Platforms ids={game.platforms} size={15} className="hero__platforms" />
            </li>
          </ul>

          <div className="hero__actions">
            <LibraryButton game={game} owned={isOwned(game.id)} onToggle={onToggleLibrary} size="lg" />
            <button type="button" className="btn btn--secondary btn--lg" onClick={() => onTrailer(game.id)}>
              <IconPlay />
              Watch trailer
            </button>
            <button type="button" className="btn btn--quiet btn--lg hero__more" onClick={() => onOpen(game.id)}>
              Details
              <IconArrowRight />
            </button>
          </div>
        </div>

        <ol className="hero__rail" aria-label="Featured games">
          {games.map((g, i) => {
            const active = i === index;
            return (
              <li key={g.id}>
                <button
                  type="button"
                  className={`rail-item${active ? ' is-active' : ''}`}
                  onClick={() => setIndex(i)}
                  aria-current={active ? 'true' : undefined}
                  aria-label={`Feature ${i + 1}: ${g.title}`}
                >
                  <span className="rail-item__bar">
                    {active && (
                      <span
                        className={`rail-item__fill${reduced ? ' is-static' : ''}`}
                        style={{ animationDuration: `${SLIDE_MS}ms`, animationPlayState: paused ? 'paused' : 'running' }}
                        onAnimationEnd={reduced ? undefined : next}
                      />
                    )}
                  </span>
                  <img src={g.art.capsule} alt="" loading="lazy" />
                  <span className="rail-item__text">
                    <span className="rail-item__num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="rail-item__title">{g.title}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
