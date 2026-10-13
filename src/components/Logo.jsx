import './Logo.css';

/* XO | STORE wordmark — shared with the mobile UI */
export default function Logo({ className = '' }) {
  return (
    <span className={`logo ${className}`}>
      <span className="logo__xo" aria-hidden="true">
        X<span className="logo__o">O</span>
      </span>
      <span className="logo__rule" aria-hidden="true" />
      <span className="logo__store" aria-hidden="true">
        Store
      </span>
      <span className="visually-hidden">XO Store</span>
    </span>
  );
}
