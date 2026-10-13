import { useEffect, useRef, useState } from 'react';
import { useModal } from '../hooks/useModal';
import { IconClose, IconExpand, IconExternal, IconMute, IconPause, IconPlay, IconVolume } from './Icons';
import './TrailerTheater.css';

const fmt = (s) => {
  if (!Number.isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
};

export default function TrailerTheater({ game, onClose }) {
  const [closing, setClosing] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [waiting, setWaiting] = useState(Boolean(game.trailer));
  const [failed, setFailed] = useState(!game.trailer);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [idle, setIdle] = useState(false);
  const videoRef = useRef(null);
  const stageRef = useRef(null);
  const idleTimer = useRef(0);

  const requestClose = () => {
    if (closing) return;
    videoRef.current?.pause();
    setClosing(true);
    window.setTimeout(onClose, 220);
  };
  useModal(requestClose, stageRef);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  const seek = (t) => {
    const v = videoRef.current;
    if (v && Number.isFinite(t)) v.currentTime = Math.max(0, Math.min(t, v.duration || t));
  };

  const fullscreen = () => {
    const el = stageRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.().catch(() => {});
  };

  const wake = () => {
    setIdle(false);
    window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => setIdle(true), 2400);
  };

  useEffect(() => () => window.clearTimeout(idleTimer.current), []);

  // Keyboard: space/k play, m mute, f fullscreen, arrows seek
  useEffect(() => {
    if (failed) return undefined;
    const onKey = (e) => {
      // let focused controls handle their own keys natively
      if (e.target instanceof HTMLElement && ['INPUT', 'BUTTON', 'A'].includes(e.target.tagName)) return;
      const v = videoRef.current;
      if (!v) return;
      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        toggle();
      } else if (e.key === 'm') {
        v.muted = !v.muted;
      } else if (e.key === 'f') {
        fullscreen();
      } else if (e.key === 'ArrowRight') {
        seek(v.currentTime + 5);
      } else if (e.key === 'ArrowLeft') {
        seek(v.currentTime - 5);
      } else return;
      wake();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [failed]);

  const progress = duration ? (time / duration) * 100 : 0;
  const steamUrl = `https://store.steampowered.com/app/${game.appid}`;

  return (
    <div className={`theater${closing ? ' is-closing' : ''}`} role="dialog" aria-modal="true" aria-labelledby="theater-title">
      <div className="theater__backdrop" onClick={requestClose} />

      <div className="theater__frame">
        <header className="theater__bar">
          <div>
            <p className="eyebrow">Now showing</p>
            <h2 id="theater-title" className="theater__title">
              {game.title}
              {game.trailer && <span className="theater__name">{game.trailer.name}</span>}
            </h2>
          </div>
          <button type="button" className="theater__close" onClick={requestClose} aria-label="Close trailer">
            <IconClose />
            <kbd>Esc</kbd>
          </button>
        </header>

        <div
          ref={stageRef}
          tabIndex={-1}
          className={`theater__stage${idle && playing ? ' is-idle' : ''}`}
          onMouseMove={wake}
          onMouseLeave={() => setIdle(true)}
        >
          {failed ? (
            <div className="theater__fallback">
              <img src={game.art.hero} alt="" style={{ objectPosition: game.focus }} />
              <div className="theater__fallback-body">
                <p className="eyebrow">Trailer unavailable</p>
                <p className="theater__fallback-title">
                  {game.trailer
                    ? 'This trailer couldn’t be loaded right now.'
                    : 'There’s no trailer we can stream here yet.'}
                </p>
                <p className="theater__fallback-text">
                  {game.trailer
                    ? 'The video host didn’t respond. Check your connection, or watch it on the official store page.'
                    : 'The publisher’s latest trailers are only available on the official store page.'}
                </p>
                <a className="btn btn--secondary" href={steamUrl} target="_blank" rel="noreferrer">
                  Watch on Steam
                  <IconExternal />
                </a>
              </div>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                className="theater__video"
                src={game.trailer.src}
                poster={game.art.shots[0]}
                autoPlay
                playsInline
                preload="auto"
                onClick={toggle}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onWaiting={() => setWaiting(true)}
                onPlaying={() => setWaiting(false)}
                onCanPlay={() => setWaiting(false)}
                onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
                onEnded={() => setIdle(false)}
                onError={() => setFailed(true)}
              />

              {waiting && (
                <div className="theater__loading" aria-live="polite">
                  <span className="theater__spinner" />
                  <span className="eyebrow">Loading trailer</span>
                </div>
              )}

              {!playing && !waiting && (
                <button type="button" className="theater__bigplay" onClick={toggle} aria-label="Play trailer">
                  <IconPlay width={26} height={26} />
                </button>
              )}

              <div className="theater__controls">
                <button type="button" className="theater__btn" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
                  {playing ? <IconPause /> : <IconPlay />}
                </button>
                <span className="theater__time">
                  {fmt(time)} <span>/ {fmt(duration)}</span>
                </span>
                <input
                  className="theater__scrub"
                  type="range"
                  min={0}
                  max={duration || 0}
                  step={0.1}
                  value={time}
                  onChange={(e) => seek(Number(e.target.value))}
                  style={{ '--p': `${progress}%` }}
                  aria-label="Seek"
                />
                <button
                  type="button"
                  className="theater__btn"
                  onClick={() => {
                    if (videoRef.current) videoRef.current.muted = !videoRef.current.muted;
                  }}
                  aria-label={muted ? 'Unmute' : 'Mute'}
                >
                  {muted ? <IconMute /> : <IconVolume />}
                </button>
                <button type="button" className="theater__btn" onClick={fullscreen} aria-label="Fullscreen">
                  <IconExpand />
                </button>
              </div>
            </>
          )}
        </div>

        <p className="theater__hint">
          {failed ? 'Trailers stream from the Steam video CDN.' : 'Space to play/pause · ← → to seek · M to mute · F for fullscreen'}
        </p>
      </div>
    </div>
  );
}
