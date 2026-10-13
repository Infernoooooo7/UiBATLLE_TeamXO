import { formatCount } from '../data/catalog';
import { IconPlay } from './Icons';
import { LibraryButton, Platforms, Price } from './GameBits';
import './Trending.css';

export default function Trending({ games, where, isOwned, onOpen, onToggleLibrary, onTrailer }) {
  const [lead, ...rest] = games;

  return (
    <section className="trending" aria-labelledby="trending-title">
      <header className="section-head">
        <div>
          <p className="eyebrow">Most played this week</p>
          <h2 id="trending-title" className="section-title">
            Trending on {where}
          </h2>
        </div>
      </header>

      <div className="trending__body">
        <article className="spot">
          <img className="spot__img" src={lead.art.hero} alt="" style={{ objectPosition: lead.focus }} loading="lazy" />
          <div className="spot__scrim" />
          <button type="button" className="spot__hit" onClick={() => onOpen(lead.id)}>
            <span className="visually-hidden">{lead.title} — view details</span>
          </button>

          <span className="spot__rank" aria-hidden="true">01</span>

          <div className="spot__content">
            <p className="eyebrow spot__eyebrow">
              {lead.genre} <span aria-hidden="true">/</span> {lead.developer}
            </p>
            <h3 className="spot__title">{lead.title}</h3>
            <p className="spot__blurb">{lead.blurb}</p>
            <div className="spot__actions">
              <LibraryButton game={lead} owned={isOwned(lead.id)} onToggle={onToggleLibrary} />
              <button type="button" className="btn btn--secondary" onClick={() => onTrailer(lead.id)}>
                <IconPlay />
                Trailer
              </button>
              <span className="spot__score">
                <strong>{lead.rating.percent}%</strong> positive of {formatCount(lead.rating.count)} reviews
              </span>
            </div>
          </div>
        </article>

        <ol className="chart">
          {rest.map((g, i) => (
            <li key={g.id} className="chart__row">
              <button type="button" className="chart__hit" onClick={() => onOpen(g.id)}>
                <span className="visually-hidden">{g.title} — view details</span>
              </button>
              <span className="chart__rank">{String(i + 2).padStart(2, '0')}</span>
              <img className="chart__thumb" src={g.art.capsule} alt="" loading="lazy" />
              <div className="chart__info">
                <p className="chart__title">{g.title}</p>
                <p className="chart__meta">
                  <span>{g.genre}</span>
                  <Platforms ids={g.platforms} size={12} />
                </p>
              </div>
              <div className="chart__end">
                <Price game={g} size="sm" />
                <span className="chart__score">{g.rating.percent}% positive</span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
