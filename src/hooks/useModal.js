import { useEffect, useRef } from 'react';

// Stack of open modals so Escape only closes the topmost one.
const stack = [];

/** Body scroll lock, Escape-to-close, initial focus and focus restore. */
export function useModal(onRequestClose, initialFocusRef) {
  const closeRef = useRef(onRequestClose);
  closeRef.current = onRequestClose;

  useEffect(() => {
    const token = {};
    stack.push(token);
    const previous = document.activeElement;

    if (stack.length === 1) {
      const gap = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = gap ? `${gap}px` : '';
      document.body.classList.add('is-locked');
    }
    initialFocusRef?.current?.focus({ preventScroll: true });

    const onKey = (e) => {
      if (e.key === 'Escape' && stack[stack.length - 1] === token) {
        e.stopPropagation();
        closeRef.current();
      }
    };
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
      stack.splice(stack.indexOf(token), 1);
      if (stack.length === 0) {
        document.body.classList.remove('is-locked');
        document.body.style.paddingRight = '';
      }
      if (previous instanceof HTMLElement) previous.focus({ preventScroll: true });
    };
  }, [initialFocusRef]);
}
