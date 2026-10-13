const stroke = {
  width: 16,
  height: 16,
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: 'false',
};

export const IconSearch = (p) => (
  <svg {...stroke} {...p}>
    <circle cx="7" cy="7" r="4.75" />
    <path d="m10.6 10.6 3.4 3.4" />
  </svg>
);

export const IconPlus = (p) => (
  <svg {...stroke} {...p}>
    <path d="M8 3v10M3 8h10" />
  </svg>
);

export const IconCheck = (p) => (
  <svg {...stroke} {...p}>
    <path d="m3 8.6 3.1 3L13 4.6" />
  </svg>
);

export const IconClose = (p) => (
  <svg {...stroke} {...p}>
    <path d="m4 4 8 8M12 4l-8 8" />
  </svg>
);

export const IconArrowRight = (p) => (
  <svg {...stroke} {...p}>
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);

export const IconArrowUp = (p) => (
  <svg {...stroke} {...p}>
    <path d="M8 13V3M4 7l4-4 4 4" />
  </svg>
);

export const IconChevronDown = (p) => (
  <svg {...stroke} {...p}>
    <path d="m4 6 4 4 4-4" />
  </svg>
);

export const IconExternal = (p) => (
  <svg {...stroke} {...p}>
    <path d="M6.5 3.5h-3v9h9v-3M9.5 2.5h4v4M13.5 2.5 7.5 8.5" />
  </svg>
);

export const IconLibrary = (p) => (
  <svg {...stroke} {...p}>
    <path d="M2.75 2.5v11M5.75 2.5v11M8.75 2.5v11M10.9 3.1l2.6 10.2" />
  </svg>
);

export const IconPlay = (p) => (
  <svg {...stroke} fill="currentColor" stroke="none" {...p}>
    <path d="M4.5 3.06v9.88a.7.7 0 0 0 1.06.6l7.9-4.94a.7.7 0 0 0 0-1.2l-7.9-4.94a.7.7 0 0 0-1.06.6Z" />
  </svg>
);

export const IconPause = (p) => (
  <svg {...stroke} fill="currentColor" stroke="none" {...p}>
    <rect x="3.5" y="2.5" width="3" height="11" rx="0.7" />
    <rect x="9.5" y="2.5" width="3" height="11" rx="0.7" />
  </svg>
);

export const IconVolume = (p) => (
  <svg {...stroke} {...p}>
    <path d="M2.5 6v4h2.5l3.5 3V3L5 6H2.5Z" />
    <path d="M11 5.5a3.5 3.5 0 0 1 0 5M12.8 3.6a6 6 0 0 1 0 8.8" />
  </svg>
);

export const IconMute = (p) => (
  <svg {...stroke} {...p}>
    <path d="M2.5 6v4h2.5l3.5 3V3L5 6H2.5Z" />
    <path d="m11 6.25 3.5 3.5M14.5 6.25 11 9.75" />
  </svg>
);

export const IconExpand = (p) => (
  <svg {...stroke} {...p}>
    <path d="M2.5 6V2.5H6M10 2.5h3.5V6M13.5 10v3.5H10M6 13.5H2.5V10" />
  </svg>
);

/* ---- Platform glyphs (original marks, not brand logos) ---- */

export const PcGlyph = (p) => (
  <svg {...stroke} strokeWidth={1.4} {...p}>
    <rect x="1.75" y="2.5" width="12.5" height="8.5" rx="1" />
    <path d="M5.5 13.75h5M8 11v2.75" />
  </svg>
);

/* PlayStation: the four face buttons */
export const PsGlyph = (p) => (
  <svg {...stroke} strokeWidth={1.3} {...p}>
    <path d="M8 1.6 9.7 4.4H6.3Z" />
    <circle cx="12.4" cy="8" r="1.75" />
    <path d="m6.6 10.6 2.8 2.8M9.4 10.6l-2.8 2.8" />
    <rect x="2" y="6.4" width="3.2" height="3.2" rx="0.2" />
  </svg>
);

/* Xbox: a sphere crossed by two arcs */
export const XboxGlyph = (p) => (
  <svg {...stroke} strokeWidth={1.4} {...p}>
    <circle cx="8" cy="8" r="6.25" />
    <path d="M4.3 3.7c2.4 1.6 4.9 4.8 7.2 8.8M11.7 3.7c-2.4 1.6-4.9 4.8-7.2 8.8" />
  </svg>
);

export const PLATFORM_GLYPH = { pc: PcGlyph, ps: PsGlyph, xbox: XboxGlyph };

