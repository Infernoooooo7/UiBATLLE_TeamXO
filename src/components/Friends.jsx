import { useRef, useState } from 'react';
import { getGame } from '../data/catalog';
import { FRIENDS, LABELS, ME, PEOPLE, REQUESTS, SESSIONS, STATUS, SUGGESTED } from '../data/social';
import { useModal } from '../hooks/useModal';
import { IconCheck, IconClose, IconPlus } from './Icons';
import PixelAvatar from './PixelAvatar';
import './Friends.css';

function StatusText({ status }) {
  return (
    <span className="fx-status" style={{ '--s': STATUS[status].color }}>
      {STATUS[status].label}
    </span>
  );
}

function Modal({ title, kicker, onClose, children }) {
  const closeRef = useRef(null);
  useModal(onClose, closeRef);
  return (
    <div className="fx-modal" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="fx-modal__panel" role="dialog" aria-modal="true" aria-label={title}>
        <header className="fx-modal__head">
          <div>
            {kicker && <p className="eyebrow">{kicker}</p>}
            <h2 className="fx-modal__title">{title}</h2>
          </div>
          <button ref={closeRef} type="button" className="fx-modal__close" onClick={onClose} aria-label="Close">
            <IconClose width={18} height={18} />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}

export default function Friends({ push, onOpen }) {
  const [friends, setFriends] = useState(FRIENDS);
  const [requests, setRequests] = useState(REQUESTS);
  const [sent, setSent] = useState({});
  const [invited, setInvited] = useState({});
  const [joined, setJoined] = useState(null);
  const [lobbyId, setLobbyId] = useState(null);
  const [inviteId, setInviteId] = useState(null);

  const sessions = SESSIONS.map((s) => ({ ...s, members: joined === s.id ? [...s.members, ME.id] : s.members }));
  const findSession = (id) => sessions.find((s) => s.id === id);
  const online = friends.filter((f) => f.status !== 'offline').length;

  const accept = (r) => {
    setRequests((list) => list.filter((x) => x.id !== r.id));
    setFriends((list) => [...list, r]);
    push({ message: `${r.name} is now your friend` });
  };
  const decline = (r) => {
    setRequests((list) => list.filter((x) => x.id !== r.id));
    push({ message: `Declined ${r.name}’s request` });
  };
  const addFriend = (p) => {
    setSent((m) => ({ ...m, [p.id]: true }));
    push({ message: `Friend request sent to ${p.name}` });
  };
  const join = (s) => {
    setJoined(s.id);
    setLobbyId(s.id);
    push({ game: getGame(s.game), message: `You joined ${s.name}` });
  };
  const leave = (s) => {
    setJoined(null);
    setLobbyId(null);
    push({ message: `You left ${s.name}` });
  };
  const invite = (s, f) => {
    setInvited((m) => ({ ...m, [`${s.id}:${f.id}`]: true }));
    push({ message: `Invite to ${s.name} sent to ${f.name}` });
  };

  const lobby = lobbyId && findSession(lobbyId);
  const inviting = inviteId && findSession(inviteId);

  return (
    <main id="main" className="friends">
      <div className="container">
        <header className="friends__head">
          <p className="eyebrow">Pixel Arena social</p>
          <div className="friends__titlebar">
            <h1 className="friends__title">
              {LABELS.page}
              <span className="friends__total">{online} online</span>
            </h1>
            <p className="friends__note">{LABELS.note}</p>
          </div>
        </header>

        <div className="friends__grid">
          <div className="friends__main">
            <section aria-labelledby="fx-sessions">
              <h2 className="fx-h" id="fx-sessions">
                {LABELS.sessions}
              </h2>
              <div className="fx-sessions">
                {sessions.map((s) => {
                  const game = getGame(s.game);
                  const isIn = joined === s.id;
                  const full = s.members.length >= s.max;
                  return (
                    <article key={s.id} className={`fx-session${isIn ? ' is-joined' : ''}`}>
                      <button type="button" className="fx-session__art" onClick={() => onOpen(game.id)} aria-label={`${game.title} details`}>
                        <img src={game.art.hero} alt="" loading="lazy" />
                      </button>
                      <div className="fx-session__body">
                        <p className={`fx-live${s.live ? ' is-live' : ''}`}>
                          <i />
                          {isIn ? 'You’re in this session' : s.statusLabel}
                        </p>
                        <h3 className="fx-session__name">{s.name}</h3>
                        <p className="fx-session__game">
                          {game.title} · hosted by {PEOPLE[s.host].name}
                        </p>
                        <div className="fx-session__foot">
                          <div className="fx-stack">
                            {s.members.map((id) => (
                              <PixelAvatar key={id} person={PEOPLE[id]} size={30} />
                            ))}
                            {Array.from({ length: s.max - s.members.length }, (_, i) => (
                              <span key={i} className="fx-slot" />
                            ))}
                            <span className="fx-count">
                              <b>{s.members.length}</b>/{s.max} players
                            </span>
                          </div>
                          <div className="fx-session__actions">
                            <button type="button" className="btn btn--secondary" onClick={() => setInviteId(s.id)}>
                              Invite
                            </button>
                            {isIn ? (
                              <button type="button" className="btn btn--owned" onClick={() => setLobbyId(s.id)}>
                                <IconCheck width={16} height={16} />
                                Open lobby
                              </button>
                            ) : (
                              <button type="button" className="btn btn--primary" disabled={full} onClick={() => join(s)}>
                                {full ? 'Full' : 'Join'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="fx-section" aria-labelledby="fx-friends">
              <h2 className="fx-h" id="fx-friends">
                {LABELS.friends}
                <span>{friends.length}</span>
              </h2>
              <ul className="fx-friends">
                {friends.map((f) => {
                  const game = f.game && getGame(f.game);
                  const s = f.session && findSession(f.session);
                  const isIn = s && joined === s.id;
                  return (
                    <li key={f.id} className={`fx-friend is-${f.status}`}>
                      <PixelAvatar person={f} size={48} status={f.status} />
                      <div className="fx-friend__text">
                        <p className="fx-name">{f.name}</p>
                        <p className="fx-meta">
                          <StatusText status={f.status} /> · {f.activity}
                        </p>
                      </div>
                      {game && (
                        <button type="button" className="fx-friend__game" onClick={() => onOpen(game.id)} aria-label={`${game.title} details`}>
                          <img src={game.art.cover} alt="" loading="lazy" />
                        </button>
                      )}
                      {s && (
                        <button
                          type="button"
                          className={`btn btn--sm ${isIn ? 'btn--owned' : 'btn--secondary'}`}
                          disabled={!isIn && s.members.length >= s.max}
                          onClick={() => (isIn ? setLobbyId(s.id) : join(s))}
                        >
                          {isIn ? 'In lobby' : 'Join'}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>

          <aside className="friends__side">
            <section className="fx-panel" aria-labelledby="fx-requests">
              <h2 className="fx-h" id="fx-requests">
                {LABELS.requests}
                <span>{requests.length}</span>
              </h2>
              {requests.length ? (
                <ul className="fx-people">
                  {requests.map((r) => (
                    <li key={r.id} className="fx-person">
                      <PixelAvatar person={r} size={40} status={r.status} />
                      <div className="fx-person__text">
                        <p className="fx-name">{r.name}</p>
                        <p className="fx-meta">Wants to be friends</p>
                      </div>
                      <div className="fx-person__actions">
                        <button type="button" className="btn btn--sm btn--primary" onClick={() => accept(r)}>
                          Accept
                        </button>
                        <button type="button" className="btn btn--sm btn--quiet" onClick={() => decline(r)}>
                          Decline
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="fx-empty">You’re all caught up.</p>
              )}
            </section>

            <section className="fx-panel" aria-labelledby="fx-find">
              <h2 className="fx-h" id="fx-find">
                {LABELS.find}
              </h2>
              <ul className="fx-people">
                {SUGGESTED.map((p) => {
                  const isSent = Boolean(sent[p.id]);
                  return (
                    <li key={p.id} className="fx-person">
                      <PixelAvatar person={p} size={40} status={p.status} />
                      <div className="fx-person__text">
                        <p className="fx-name">{p.name}</p>
                        <p className="fx-meta">{p.activity}</p>
                      </div>
                      <button
                        type="button"
                        className={`btn btn--sm ${isSent ? 'btn--owned' : 'btn--secondary'}`}
                        disabled={isSent}
                        onClick={() => addFriend(p)}
                      >
                        {isSent ? <IconCheck width={14} height={14} /> : <IconPlus width={14} height={14} />}
                        {isSent ? 'Request Sent' : 'Add Friend'}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          </aside>
        </div>
      </div>

      {lobby && (
        <Modal title={lobby.name} kicker={`Lobby · ${getGame(lobby.game).title}`} onClose={() => setLobbyId(null)}>
          <div className="fx-lobby__art">
            <img src={getGame(lobby.game).art.hero} alt="" />
          </div>
          <ul className="fx-lobby__list">
            {lobby.members.map((id) => (
              <li key={id}>
                <PixelAvatar person={PEOPLE[id]} size={36} status={PEOPLE[id].status ?? 'online'} />
                <span>{PEOPLE[id].name}</span>
                {id === lobby.host && <em>Host</em>}
                {id === ME.id && <em className="is-you">You</em>}
              </li>
            ))}
            {Array.from({ length: lobby.max - lobby.members.length }, (_, i) => (
              <li key={`open-${i}`} className="is-open">
                <span className="fx-slot" />
                Open slot
              </li>
            ))}
          </ul>
          <p className="fx-modal__note">{LABELS.note}</p>
          <div className="fx-modal__actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => {
                setLobbyId(null);
                setInviteId(lobby.id);
              }}
            >
              Invite friends
            </button>
            {joined === lobby.id ? (
              <button type="button" className="btn btn--quiet" onClick={() => leave(lobby)}>
                Leave session
              </button>
            ) : (
              <button type="button" className="btn btn--primary" disabled={lobby.members.length >= lobby.max} onClick={() => join(lobby)}>
                Join
              </button>
            )}
          </div>
        </Modal>
      )}

      {inviting && (
        <Modal title={`Invite to ${inviting.name}`} kicker={LABELS.sessions} onClose={() => setInviteId(null)}>
          <ul className="fx-people fx-people--modal">
            {friends.map((f) => {
              const inSession = inviting.members.includes(f.id);
              const done = Boolean(invited[`${inviting.id}:${f.id}`]);
              return (
                <li key={f.id} className="fx-person">
                  <PixelAvatar person={f} size={40} status={f.status} />
                  <div className="fx-person__text">
                    <p className="fx-name">{f.name}</p>
                    <p className="fx-meta">
                      <StatusText status={f.status} />
                    </p>
                  </div>
                  <button
                    type="button"
                    className={`btn btn--sm ${done || inSession ? 'btn--owned' : 'btn--primary'}`}
                    disabled={done || inSession}
                    onClick={() => invite(inviting, f)}
                  >
                    {done && <IconCheck width={14} height={14} />}
                    {inSession ? 'In session' : done ? 'Invited' : 'Invite'}
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="fx-modal__note">{LABELS.note}</p>
        </Modal>
      )}
    </main>
  );
}
