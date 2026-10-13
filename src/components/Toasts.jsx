import { useCallback, useRef, useState } from 'react';
import { IconClose } from './Icons';
import './Toasts.css';

export function useToasts() {
  const [toasts, setToasts] = useState([]);
  const seq = useRef(0);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const push = useCallback(
    (toast) => {
      const id = ++seq.current;
      setToasts((list) => [...list.slice(-2), { ...toast, id }]);
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss],
  );

  return { toasts, push, dismiss };
}

export default function Toasts({ toasts, dismiss }) {
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          {t.game && <img className="toast__art" src={t.game.art.cover} alt="" />}
          <div className="toast__text">
            <p className="toast__msg">{t.message}</p>
            {t.game && <p className="toast__title">{t.game.title}</p>}
          </div>
          {t.action && (
            <button
              type="button"
              className="toast__action"
              onClick={() => {
                t.action.run();
                dismiss(t.id);
              }}
            >
              {t.action.label}
            </button>
          )}
          <button type="button" className="toast__close" onClick={() => dismiss(t.id)} aria-label="Dismiss">
            <IconClose width={14} height={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
