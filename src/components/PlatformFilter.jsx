import { PLATFORMS } from '../data/catalog';
import { PLATFORM_GLYPH } from './Icons';
import './PlatformFilter.css';

export default function PlatformFilter({ value, onChange, counts, label = 'Platform' }) {
  return (
    <div className="platform-filter" role="radiogroup" aria-label={label}>
      {PLATFORMS.map((p) => {
        const Glyph = PLATFORM_GLYPH[p.id];
        const active = value === p.id;
        return (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={active}
            className={`platform-filter__opt is-${p.id}${active ? ' is-active' : ''}`}
            onClick={() => onChange(p.id)}
          >
            {Glyph && <Glyph className="platform-filter__glyph" />}
            <span>{p.label}</span>
            {counts && <span className="platform-filter__count">{counts[p.id] ?? 0}</span>}
          </button>
        );
      })}
    </div>
  );
}
