import './Logo.css';

/* PIXEL | ARENA wordmark — the X keeps the Team XO accent */
export default function Logo({ className = '' }) {
  return (
    <span className={`logo ${className}`}>
      <span className="logo__mark" aria-hidden="true">
        Pi<span className="logo__accent">x</span>el
      </span>
      <span className="logo__rule" aria-hidden="true" />
      <span className="logo__word" aria-hidden="true">
        Arena
      </span>
      <span className="visually-hidden">Pixel Arena</span>
    </span>
  );
}
