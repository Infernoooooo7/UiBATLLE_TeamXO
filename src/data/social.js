/* Friends & Playing Together — local mock data for the demo. Nothing here talks to an online service.
   Keep in sync with mobile/data/social.js (same people, statuses, sessions and labels;
   mobile refers to games by Steam app id instead of slug). */

export const LABELS = {
  page: 'Friends',
  sessions: 'Playing Together',
  requests: 'Friend Requests',
  friends: 'Friends',
  find: 'Add Friends',
  note: 'Local demo — no sign-in, nothing is sent online.',
};

export const STATUS = {
  online: { label: 'Online', color: '#8fd694' },
  ingame: { label: 'In Game', color: '#ff5b24' },
  away: { label: 'Away', color: '#f2c14e' },
  offline: { label: 'Offline', color: '#77746e' },
};

export const ME = { id: 'me', name: 'You', color: '#ff5b24' };

export const FRIENDS = [
  { id: 'alex', name: 'Alex', color: '#6b95ff', status: 'online', activity: 'Hosting Late Night Lobby', game: 'baldurs-gate-3', session: 'late-night-lobby' },
  { id: 'nova', name: 'Nova', color: '#c7a4ff', status: 'ingame', activity: 'Playing Helldivers 2', game: 'helldivers-2', session: 'squad-up' },
  { id: 'shadow', name: 'Shadow', color: '#9aa3ad', status: 'away', activity: 'Last played Elden Ring', game: 'elden-ring' },
  { id: 'pixel', name: 'Pixel', color: '#5fd0c5', status: 'offline', activity: 'Last online 3 hours ago', game: 'hades-ii' },
];

export const REQUESTS = [
  { id: 'kira', name: 'Kira', color: '#ff8fb1', status: 'online', activity: 'Browsing the store' },
  { id: 'ronin', name: 'Ronin', color: '#e9c46a', status: 'offline', activity: 'Last online yesterday' },
];

export const SUGGESTED = [
  { id: 'echo', name: 'Echo', color: '#7fd1ff', status: 'ingame', activity: 'In Squad Up with Nova', game: 'helldivers-2' },
  { id: 'vex', name: 'Vex', color: '#b5e48c', status: 'ingame', activity: 'In Squad Up with Nova', game: 'helldivers-2' },
];

export const SESSIONS = [
  { id: 'squad-up', name: 'Squad Up', game: 'helldivers-2', host: 'nova', members: ['nova', 'echo', 'vex'], max: 4, live: true, statusLabel: 'In progress' },
  { id: 'late-night-lobby', name: 'Late Night Lobby', game: 'baldurs-gate-3', host: 'alex', members: ['alex'], max: 4, live: false, statusLabel: 'Waiting for players' },
];

export const PEOPLE = Object.fromEntries([ME, ...FRIENDS, ...REQUESTS, ...SUGGESTED].map((p) => [p.id, p]));

/* Deterministic 5×5 mirrored pixel avatar — same algorithm on mobile, so everyone looks identical. */
export function avatarCells(name) {
  let h = 2166136261;
  for (let i = 0; i < name.length; i++) {
    h ^= name.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h >>>= 0;
  const cells = [];
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 3; x++) {
      if ((h >>> (y * 3 + x)) & 1) {
        cells.push([x, y]);
        if (x < 2) cells.push([4 - x, y]);
      }
    }
  }
  return cells;
}
