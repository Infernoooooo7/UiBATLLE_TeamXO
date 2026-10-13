/* Friends & Playing Together — local mock data for the demo. Nothing here talks to an online service.
   Keep in sync with the desktop app's src/data/social.js (same people, statuses, sessions and labels;
   here games are Steam app ids from data/games.js instead of slugs). */
window.XO_SOCIAL = {
  LABELS: {
    page: 'Friends',
    sessions: 'Playing Together',
    requests: 'Friend Requests',
    friends: 'Friends',
    find: 'Add Friends',
    note: 'Local demo — no sign-in, nothing is sent online.'
  },
  STATUS: {
    online: { label: 'Online', color: '#8fd694' },
    ingame: { label: 'In Game', color: '#ff5b24' },
    away: { label: 'Away', color: '#f2c14e' },
    offline: { label: 'Offline', color: '#77746e' }
  },
  ME: { id: 'me', name: 'You', color: '#ff5b24' },
  FRIENDS: [
    { id: 'alex', name: 'Alex', color: '#6b95ff', status: 'online', activity: 'Hosting Late Night Lobby', game: '1086940', session: 'late-night-lobby' },
    { id: 'nova', name: 'Nova', color: '#c7a4ff', status: 'ingame', activity: 'Playing Helldivers 2', game: '553850', session: 'squad-up' },
    { id: 'shadow', name: 'Shadow', color: '#9aa3ad', status: 'away', activity: 'Last played Elden Ring', game: '1245620' },
    { id: 'pixel', name: 'Pixel', color: '#5fd0c5', status: 'offline', activity: 'Last online 3 hours ago', game: '1145350' }
  ],
  REQUESTS: [
    { id: 'kira', name: 'Kira', color: '#ff8fb1', status: 'online', activity: 'Browsing the store' },
    { id: 'ronin', name: 'Ronin', color: '#e9c46a', status: 'offline', activity: 'Last online yesterday' }
  ],
  SUGGESTED: [
    { id: 'echo', name: 'Echo', color: '#7fd1ff', status: 'ingame', activity: 'In Squad Up with Nova', game: '553850' },
    { id: 'vex', name: 'Vex', color: '#b5e48c', status: 'ingame', activity: 'In Squad Up with Nova', game: '553850' }
  ],
  SESSIONS: [
    { id: 'squad-up', name: 'Squad Up', game: '553850', host: 'nova', members: ['nova', 'echo', 'vex'], max: 4, live: true, statusLabel: 'In progress' },
    { id: 'late-night-lobby', name: 'Late Night Lobby', game: '1086940', host: 'alex', members: ['alex'], max: 4, live: false, statusLabel: 'Waiting for players' }
  ]
};
