import { GAMES } from './games.js';

export { GAMES };

export const PLATFORMS = [
  { id: 'all', label: 'All platforms' },
  { id: 'pc', label: 'PC', long: 'PC' },
  { id: 'ps', label: 'PlayStation', long: 'PlayStation 5' },
  { id: 'xbox', label: 'Xbox', long: 'Xbox Series X|S' },
];

export const GENRES = ['Action', 'RPG', 'Shooter', 'Horror', 'Adventure', 'Strategy'];

export const SORTS = [
  { id: 'trending', label: 'Trending' },
  { id: 'newest', label: 'Newest' },
  { id: 'rating', label: 'Top rated' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
];

const byId = new Map(GAMES.map((g) => [g.id, g]));
export const getGame = (id) => byId.get(id);

export const FEATURED = GAMES.filter((g) => g.featured).sort((a, b) => a.featured - b.featured);
export const TRENDING = [...GAMES].sort((a, b) => a.rank - b.rank);

export const platformLabel = (id) => PLATFORMS.find((p) => p.id === id)?.label ?? id;

export const finalPrice = (g) => (g.free ? 0 : g.salePrice ?? g.price);

export const formatPrice = (n) => (n === 0 ? 'Free' : `$${n.toFixed(2)}`);

export function formatDate(iso, opts = { day: 'numeric', month: 'short', year: 'numeric' }) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', opts);
}

export function formatCount(n) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1e3) return `${Math.round(n / 1e3)}K`;
  return String(n);
}

const norm = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ');

export function searchGames(list, query) {
  const q = norm(query).trim();
  if (!q) return list;
  const terms = q.split(/\s+/);
  return list
    .map((g) => {
      const title = norm(g.title);
      const hay = `${title} ${norm(g.developer)} ${norm(g.publisher)} ${norm(g.genre)} ${g.genres.map(norm).join(' ')}`;
      if (!terms.every((t) => hay.includes(t))) return null;
      const score = title.startsWith(q) ? 0 : title.includes(q) ? 1 : 2;
      return { g, score };
    })
    .filter(Boolean)
    .sort((a, b) => a.score - b.score || a.g.rank - b.g.rank)
    .map((r) => r.g);
}

export function filterGames(list, { platform = 'all', genre = 'all', query = '', sale = false }) {
  let out = list;
  if (platform !== 'all') out = out.filter((g) => g.platforms.includes(platform));
  if (genre !== 'all') out = out.filter((g) => g.genres.includes(genre));
  if (sale) out = out.filter((g) => g.discount > 0);
  if (query.trim()) {
    const hits = new Set(searchGames(out, query).map((g) => g.id));
    out = out.filter((g) => hits.has(g.id));
  }
  return out;
}

export function sortGames(list, sort) {
  const out = [...list];
  switch (sort) {
    case 'newest':
      return out.sort((a, b) => b.released.localeCompare(a.released));
    case 'rating':
      return out.sort((a, b) => b.rating.percent - a.rating.percent || b.rating.count - a.rating.count);
    case 'price-asc':
      return out.sort((a, b) => finalPrice(a) - finalPrice(b) || a.rank - b.rank);
    case 'price-desc':
      return out.sort((a, b) => finalPrice(b) - finalPrice(a) || a.rank - b.rank);
    default:
      return out.sort((a, b) => a.rank - b.rank);
  }
}
