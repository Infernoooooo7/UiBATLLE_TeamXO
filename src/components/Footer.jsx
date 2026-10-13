import { BrandMark, IconArrowUp } from './Icons';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <span className="brand">
            <BrandMark />
            <span className="brand__word">Backlog</span>
          </span>
          <p className="footer__tagline">Games worth falling behind on.</p>
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
