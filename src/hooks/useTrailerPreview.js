import { useCallback, useEffect, useRef, useState } from 'react';
import { isModalOpen } from './useModal';

const HOVER_DELAY = 500; // how long the pointer rests on a card before its trailer starts
const FADE_OUT = 280; // keep in step with .card__video's fade-out in GameCard.css

// Only one preview plays at a time, across every card on the page.
let current = null;
// Trailers that errored aren't retried this session, and if the browser blocks
// muted autoplay altogether, previews stay off.
const failed = new Set();
let autoplayBlocked = false;

/** End whichever card preview is running (e.g. when a dialog opens over it). */
export const stopTrailerPreview = () => current?.stop();

document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopTrailerPreview();
});

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const saveData = () => Boolean(navigator.connection?.saveData);

// Full-length trailers open on rating cards and publisher logos; start a few seconds in.
const introSkip = (duration) => (duration > 30 ? Math.min(8, duration * 0.15) : 0);

/**
 * Steam-style muted trailer preview for a game card: hover with a mouse for
 * HOVER_DELAY and the trailer fades in over the cover; leave and it fades back
 * out. Touch, reduced motion, Data Saver and missing or broken trailers all keep
 * the plain cover. The <video> only exists while a preview runs, and its
 * download is aborted the moment the preview stops.
 */
export function useTrailerPreview(src) {
  // idle → loading (video mounted, invisible) → playing (faded in) → leaving (fading out) → idle
  const [phase, setPhase] = useState('idle');
  const [run, setRun] = useState(0); // a fresh <video> element per preview
  const phaseRef = useRef('idle');
  const videoRef = useRef(null);
  const timers = useRef({ intent: 0, leave: 0 });
  const srcRef = useRef(src);
  srcRef.current = src;

  const set = (next) => {
    phaseRef.current = next;
    setPhase(next);
  };

  // Stop playback and abort the download, so nothing keeps buffering off-screen
  const unload = () => {
    const v = videoRef.current;
    videoRef.current = null;
    if (!v) return;
    v.pause();
    v.removeAttribute('src');
    v.load();
  };

  const owner = useRef(null);
  if (!owner.current) {
    owner.current = {
      stop() {
        const t = timers.current;
        window.clearTimeout(t.intent);
        if (current === owner.current) current = null;
        const p = phaseRef.current;
        if (p === 'idle' || p === 'leaving') return;
        if (p === 'loading') {
          // nothing is visible yet: drop straight back to the cover
          unload();
          set('idle');
          return;
        }
        // freeze the frame and let it fade back to the cover
        videoRef.current?.pause();
        set('leaving');
        t.leave = window.setTimeout(() => {
          unload();
          set('idle');
        }, FADE_OUT);
      },

      start() {
        const s = srcRef.current;
        if (!s || failed.has(s) || autoplayBlocked || isModalOpen() || document.hidden) return;
        const p = phaseRef.current;
        if (p === 'loading' || p === 'playing') return;
        if (current && current !== owner.current) current.stop();
        current = owner.current;
        window.clearTimeout(timers.current.leave);
        unload();
        setRun((n) => n + 1);
        set('loading');
      },

      fail(blocked) {
        if (blocked) autoplayBlocked = true;
        else if (srcRef.current) failed.add(srcRef.current);
        owner.current.stop();
      },
    };
  }
  const ctl = owner.current;

  // Start playing once the new <video> is in the DOM
  useEffect(() => {
    if (phase !== 'loading') return;
    const v = videoRef.current;
    if (!v) return;
    v.muted = true; // browsers only allow muted autoplay
    v.play()?.catch((err) => {
      // AbortError: the preview was stopped before it got going. Not a failure.
      if (err?.name !== 'AbortError' && phaseRef.current !== 'idle') ctl.fail(err?.name === 'NotAllowedError');
    });
  }, [phase, run, ctl]);

  // Card unmounted (filtered out, removed from the library…) mid-preview
  useEffect(
    () => () => {
      window.clearTimeout(timers.current.intent);
      window.clearTimeout(timers.current.leave);
      if (current === ctl) current = null;
      unload();
    },
    [ctl],
  );

  const attach = useCallback((el) => {
    // keep the element after React detaches it, so unload() can still release it
    if (el) videoRef.current = el;
  }, []);

  const onPointerEnter = (e) => {
    // mouse only: touch has no hover, and never autoplays
    if (e.pointerType !== 'mouse' || !srcRef.current || reducedMotion() || saveData()) return;
    window.clearTimeout(timers.current.intent);
    timers.current.intent = window.setTimeout(ctl.start, HOVER_DELAY);
  };

  return {
    mounted: phase !== 'idle',
    playing: phase === 'playing',
    run,
    stop: ctl.stop,
    triggers: { onPointerEnter, onPointerLeave: ctl.stop },
    videoProps: {
      ref: attach,
      src,
      muted: true,
      playsInline: true,
      preload: 'auto',
      'aria-hidden': true,
      onLoadedMetadata: (e) => {
        const v = e.currentTarget;
        const at = introSkip(v.duration);
        if (at) v.currentTime = at;
      },
      onPlaying: () => {
        if (phaseRef.current === 'loading') set('playing');
      },
      onEnded: (e) => {
        // loop, but past the intro again
        const v = e.currentTarget;
        v.currentTime = introSkip(v.duration);
        v.play().catch(() => {});
      },
      onError: (e) => {
        if (e.currentTarget.getAttribute('src') && phaseRef.current !== 'idle') ctl.fail(false);
      },
    },
  };
}
