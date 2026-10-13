import { IconArrowUp } from './Icons';
import Logo from './Logo';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Logo />
          <p className="footer__tagline">PC, PlayStation and Xbox games, curated.</p>
        </div>
        <p className="footer__note">
          A storefront concept by Team XO. Game titles, artwork, prices and trailers come from the Steam store and belong
          to their respective publishers. Nothing here is for sale.
        </p>
        <button type="button" className="btn btn--quiet footer__top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <IconArrowUp />
          Back to top
        </button>
      </div>
    </footer>
  );
}
