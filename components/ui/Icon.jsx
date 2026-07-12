/**
 * Lightweight inline SVG icon set (stroke = currentColor).
 * Self-contained — no external icon dependency, tree-shakeable, theme-aware.
 * Usage: <Icon name="shield" size={22} />
 */
const P = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" };

const PATHS = {
  shield: <path {...P} d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3zM9 12l2 2 4-4" />,
  truck: <><path {...P} d="M3 6h11v9H3zM14 9h4l3 3v3h-7z" /><circle {...P} cx="7" cy="18" r="1.8" /><circle {...P} cx="17" cy="18" r="1.8" /></>,
  tag: <><path {...P} d="M4 4h7l9 9-7 7-9-9V4z" /><circle cx="8" cy="8" r="1.4" fill="currentColor" /></>,
  headset: <path {...P} d="M4 13v-1a8 8 0 0116 0v1M4 13v3a2 2 0 002 2h1v-6H6a2 2 0 00-2 2zM20 13v3a2 2 0 01-2 2h-1v-6h1a2 2 0 012 2zM17 18a4 4 0 01-4 3h-1" />,
  badge: <><path {...P} d="M12 3l2.2 1.6 2.7-.2.9 2.6 2.2 1.6-.9 2.6.9 2.6-2.2 1.6-.9 2.6-2.7-.2L12 21l-2.2-1.6-2.7.2-.9-2.6L4 15.6l.9-2.6L4 10.4l2.2-1.6.9-2.6 2.7.2z" /><path {...P} d="M9 12l2 2 4-4" /></>,
  layers: <path {...P} d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 17l9 5 9-5" />,
  building: <><path {...P} d="M5 21V5a2 2 0 012-2h6a2 2 0 012 2v16M15 21V9h3a2 2 0 012 2v10" /><path {...P} d="M8 7h2M8 11h2M8 15h2M3 21h18" /></>,
  factory: <path {...P} d="M3 21V10l5 3V10l5 3V6l5 3v12H3zM7 17h1M12 17h1M17 17h1" />,
  hospital: <><rect {...P} x="4" y="4" width="16" height="17" rx="2" /><path {...P} d="M12 8v6M9 11h6M8 21v-3h8v3" /></>,
  hotel: <><path {...P} d="M3 21V6l9-3 9 3v15" /><path {...P} d="M9 21v-4h6v4M8 9h.01M12 9h.01M16 9h.01M8 13h.01M12 13h.01M16 13h.01" /></>,
  cart: <><circle {...P} cx="9" cy="20" r="1.4" /><circle {...P} cx="18" cy="20" r="1.4" /><path {...P} d="M3 4h2l2.2 11.2a1 1 0 001 .8h9.2a1 1 0 001-.8L21 8H6" /></>,
  cap: <path {...P} d="M12 4l9 4-9 4-9-4 9-4zM7 11v4c0 1.5 2.2 3 5 3s5-1.5 5-3v-4M21 8v5" />,
  home: <path {...P} d="M4 11l8-7 8 7M6 10v10h12V10M10 20v-6h4v6" />,
  bolt: <path {...P} d="M13 3L5 13h5l-1 8 8-11h-5l1-7z" />,
  whatsapp: <path {...P} d="M4 20l1.4-4A8 8 0 1112 20a7.9 7.9 0 01-3.5-.8L4 20zM9 9c0 4 3 6 5 6M8.8 9.2c.2-.6.7-.7 1.1-.3.2.2.6.9.6.9M14.8 14.2c.6.2.9-.1 1-.6" />,
  phone: <path {...P} d="M6 3h3l1.5 5-2 1.5a11 11 0 005 5l1.5-2 5 1.5v3a2 2 0 01-2 2A16 16 0 014 5a2 2 0 012-2z" />,
  mail: <><rect {...P} x="3" y="5" width="18" height="14" rx="2" /><path {...P} d="M4 7l8 6 8-6" /></>,
  share: <><circle {...P} cx="18" cy="5" r="2.5" /><circle {...P} cx="6" cy="12" r="2.5" /><circle {...P} cx="18" cy="19" r="2.5" /><path {...P} d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4" /></>,
  heart: <path {...P} d="M12 20s-7-4.5-9-9a4.5 4.5 0 018-3 4.5 4.5 0 018 3c-2 4.5-9 9-9 9z" />,
  download: <path {...P} d="M12 4v10m0 0l-4-4m4 4l4-4M5 19h14" />,
  arrow: <path {...P} d="M5 12h14m0 0l-6-6m6 6l-6 6" />,
  check: <path {...P} d="M5 12l4 4L19 6" />,
  star: <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.6 1-5.8L3.5 9.7l5.9-.9L12 3.5z" fill="currentColor" />,
  search: <><circle {...P} cx="11" cy="11" r="6" /><path {...P} d="M20 20l-3.5-3.5" /></>,
  filter: <path {...P} d="M4 5h16l-6 8v5l-4 2v-7L4 5z" />,
  close: <path {...P} d="M6 6l12 12M18 6L6 18" />,
  quote: <path d="M7 7h5v5c0 3-1.5 4.5-4 5v-2c1.3-.4 2-1.2 2-2.5H7V7zm7 0h5v5c0 3-1.5 4.5-4 5v-2c1.3-.4 2-1.2 2-2.5h-3V7z" fill="currentColor" />,
  chevron: <path {...P} d="M6 9l6 6 6-6" />,
  clock: <><circle {...P} cx="12" cy="12" r="8" /><path {...P} d="M12 8v4l3 2" /></>,
  pin: <><path {...P} d="M12 21s-6-5-6-10a6 6 0 1112 0c0 5-6 10-6 10z" /><circle {...P} cx="12" cy="11" r="2" /></>,
  sparkle: <path {...P} d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6L12 4zM19 15l.7 1.8L21 17.5l-1.3.7L19 20l-.7-1.8L17 17.5l1.3-.7L19 15z" />,
  box: <path {...P} d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3zM4 7.5l8 4.5 8-4.5M12 12v9" />,
  users: <><circle {...P} cx="9" cy="8" r="3" /><path {...P} d="M3 20a6 6 0 0112 0M16 5.5a3 3 0 010 5.5M17 14c2.5.6 4 2.4 4 6" /></>,
  award: <><circle {...P} cx="12" cy="9" r="5" /><path {...P} d="M9 13.5L8 21l4-2 4 2-1-7.5" /></>,
};

export default function Icon({ name, size = 22, className = "", strokeWidth }) {
  const glyph = PATHS[name];
  if (!glyph) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      style={strokeWidth ? { strokeWidth } : undefined}
    >
      {glyph}
    </svg>
  );
}
