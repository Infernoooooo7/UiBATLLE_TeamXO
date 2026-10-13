import { useEffect, useRef, useState } from 'react';
import { IconCheck, IconChevronDown } from './Icons';
import './SortMenu.css';

export default function SortMenu({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const [focus, setFocus] = useState(0);
  const ref = useRef(null);
  const listRef = useRef(null);
  const current = options.find((o) => o.id === value) ?? options[0];

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    listRef.current?.querySelectorAll('button')[focus]?.focus();
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open, focus]);

  const toggle = () => {
    setFocus(Math.max(0, options.findIndex((o) => o.id === value)));
    setOpen((o) => !o);
  };

  const pick = (id) => {
    onChange(id);
    setOpen(false);
    ref.current?.querySelector('.sort__trigger')?.focus();
  };

  const onKeyDown = (e) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocus((f) => (f + 1) % options.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocus((f) => (f - 1 + options.length) % options.length);
    } else if (e.key === 'Escape') {
      e.stopPropagation();
      setOpen(false);
      ref.current?.querySelector('.sort__trigger')?.focus();
    }
  };

  return (
    <div className={`sort${open ? ' is-open' : ''}`} ref={ref} onKeyDown={onKeyDown}>
      <button type="button" className="sort__trigger" aria-haspopup="listbox" aria-expanded={open} onClick={toggle}>
        <span className="sort__label">Sort</span>
        <span>{current.label}</span>
        <IconChevronDown className="sort__chev" />
      </button>
      {open && (
        <ul className="sort__menu" role="listbox" aria-label="Sort games" ref={listRef}>
          {options.map((o) => (
            <li key={o.id} role="none">
              <button
                type="button"
                role="option"
                aria-selected={o.id === value}
                className={`sort__opt${o.id === value ? ' is-active' : ''}`}
                onClick={() => pick(o.id)}
              >
                {o.label}
                {o.id === value && <IconCheck />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
