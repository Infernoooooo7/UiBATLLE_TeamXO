import { useCallback, useEffect, useRef } from 'react';

// Stack of open modals so Escape/Tab only act on the topmost one.
const stack = [];
let locks = 0;

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

function lockScroll() {
  if (locks++ > 0) return;
  const gap = window.innerWidth - document.documentElement.clientWidth;
  document.documentElement.style.setProperty('--lock-gap', `${gap}px`);
  document.body.classList.add('is-locked');
}

function unlockScroll() {
  if (--locks > 0) return;
  document.body.classList.remove('is-locked');
  document.documentElement.style.removeProperty('--lock-gap');
}

function trapFocus(e, dialog) {
  const items = [...dialog.querySelectorAll(FOCUSABLE)].filter((el) => el.getClientRects().length > 0);
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  const inside = dialog.contains(document.activeElement);
  if (e.shiftKey && (document.activeElement === first || !inside)) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && (document.activeElement === last || !inside)) {
    e.preventDefault();
    first.focus();
  }
}

/**
 * Scroll lock, Escape-to-close, focus trap, initial focus and focus restore.
 * Returns `release()`: call it when a close animation starts so Escape
 * immediately reaches the modal underneath.
 */
export function useModal(onRequestClose, initialFocusRef) {
  const closeRef = useRef(onRequestClose);
  closeRef.current = onRequestClose;
  const tokenRef = useRef(null);

  useEffect(() => {
    const token = {};
    tokenRef.current = token;
    stack.push(token);
    lockScroll();
    const previous = document.activeElement;
    initialFocusRef?.current?.focus({ preventScroll: true });

    const onKey = (e) => {
      if (stack[stack.length - 1] !== token) return;
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeRef.current();
      } else if (e.key === 'Tab') {
        const dialog = initialFocusRef?.current?.closest('[role="dialog"]');
        if (dialog) trapFocus(e, dialog);
      }
    };
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
      const i = stack.indexOf(token);
      if (i >= 0) stack.splice(i, 1);
      unlockScroll();
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus({ preventScroll: true });
    };
  }, [initialFocusRef]);

  return useCallback(() => {
    const i = stack.indexOf(tokenRef.current);
    if (i >= 0) stack.splice(i, 1);
  }, []);
}

/** True while any modal is open — used to mute global shortcuts. */
export const isModalOpen = () => locks > 0;
