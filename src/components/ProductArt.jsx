import { useId } from 'react';

// Placeholder product imagery: a vector illustration whose metal colour follows the
// plating and whose stone colour follows the simulated stone. If a product has an
// `image` (or `gallery`) set, the real photo is shown instead.

const METALS = {
  gold: ['#fbecb4', '#d9ab4b', '#94681e'],
  rhodium: ['#ffffff', '#d3d8de', '#88909a'],
  silver: ['#f7f7f7', '#c8c8c8', '#8a8a8a'],
  rose: ['#fde3d8', '#e2a48f', '#a36452'],
  oxidised: ['#c4c4c4', '#7c7c7c', '#3a3a3a'],
};

const STONES = {
  ruby: { fill: '#c0163f', dark: '#5e0418', accent: '#e8c77a' },
  emerald: { fill: '#13915a', dark: '#044427', accent: '#1d1d1d' },
  pearl: { fill: '#f6efe2', dark: '#c9b99c', accent: '#f6efe2' },
  ad: { fill: '#f2f8ff', dark: '#9fb4cc', accent: '#f2f8ff' },
  kundan: { fill: '#fff7dd', dark: '#d8b866', accent: '#c0163f' },
  pink: { fill: '#f2a3bb', dark: '#a8445f', accent: '#fde3ea' },
  sapphire: { fill: '#3e6fc0', dark: '#132f66', accent: '#d9e6ff' },
};

export const BACKDROPS = {
  blush: ['#fbefe9', '#efcfc2'],
  beige: ['#f6ecdc', '#dfc7a3'],
  maroon: ['#7d2232', '#2e070d'],
  wine: ['#93413e', '#4a1614'],
  stone: ['#ece6df', '#bfb2a5'],
  midnight: ['#3a3f58', '#12141f'],
};

export function metalKey(plating = '') {
  const s = plating.toLowerCase();
  if (s.includes('rose')) return 'rose';
  if (s.includes('oxidised')) return 'oxidised';
  if (s.includes('rhodium')) return 'rhodium';
  if (s.includes('silver')) return 'silver';
  return 'gold';
}

const arc = (n, t0, t1, cx, cy, rx, ry) =>
  Array.from({ length: n }, (_, i) => {
    const th = Math.PI * (t0 + ((t1 - t0) * i) / (n - 1));
    return [cx + rx * Math.cos(th), cy + ry * Math.sin(th), th];
  });

const edge = { stroke: 'rgba(0,0,0,.18)', strokeWidth: 0.8 };

function Necklace({ M, S, A, P }) {
  const beads = arc(25, 0.12, 0.88, 150, 70, 100, 140);
  return (
    <g>
      <path d="M243 121 C 246 90 240 60 228 34" stroke={M} strokeWidth="3" fill="none" />
      <path d="M57 121 C 54 90 60 60 72 34" stroke={M} strokeWidth="3" fill="none" />
      {beads.map(([x, y], i) =>
        i % 3 === 1 ? (
          <g key={i}>
            <circle cx={x} cy={y} r="8" fill={M} {...edge} />
            <circle cx={x} cy={y} r="5" fill={S} />
            {i > 2 && i < 22 && (
              <>
                <line x1={x} y1={y + 8} x2={x} y2={y + 20} stroke={M} strokeWidth="1.5" />
                <circle cx={x} cy={y + 23} r="3.5" fill={P} {...edge} />
              </>
            )}
          </g>
        ) : (
          <circle key={i} cx={x} cy={y} r="5.5" fill={M} {...edge} />
        )
      )}
      <path d="M150 212 C 118 238 118 286 150 302 C 182 286 182 238 150 212 Z" fill={M} {...edge} />
      <ellipse cx="150" cy="262" rx="15" ry="22" fill={S} />
      <ellipse cx="145" cy="254" rx="4" ry="6" fill="#fff" opacity=".55" />
      {[[-22, 240], [22, 240], [-24, 275], [24, 275], [0, 228]].map(([dx, y], i) => (
        <circle key={i} cx={150 + dx} cy={y} r="4" fill={A} {...edge} />
      ))}
      <line x1="150" y1="302" x2="150" y2="314" stroke={M} strokeWidth="2" />
      <circle cx="150" cy="320" r="7" fill={P} {...edge} />
    </g>
  );
}

function Earring({ x, M, S, A, P }) {
  return (
    <g>
      <path d={`M${x} 48 C ${x} 22 ${x + 20} 22 ${x + 20} 38`} stroke={M} strokeWidth="3" fill="none" />
      <circle cx={x} cy="62" r="16" fill={M} {...edge} />
      <circle cx={x} cy="62" r="10" fill={S} />
      <circle cx={x - 3} cy="58" r="3" fill="#fff" opacity=".6" />
      <line x1={x} y1="78" x2={x} y2="104" stroke={M} strokeWidth="3" />
      <circle cx={x} cy="106" r="6" fill={A} {...edge} />
      <path d={`M${x - 42} 192 Q ${x - 40} 118 ${x} 112 Q ${x + 40} 118 ${x + 42} 192 Z`} fill={M} {...edge} />
      <path d={`M${x - 30} 170 Q ${x} 160 ${x + 30} 170`} stroke="rgba(0,0,0,.2)" strokeWidth="1.5" fill="none" />
      <ellipse cx={x} cy="150" rx="11" ry="15" fill={S} />
      {[-3, -2, -1, 0, 1, 2, 3].map((i) => (
        <g key={i}>
          <line x1={x + i * 12.5} y1="192" x2={x + i * 12.5} y2={i % 2 ? 206 : 214} stroke={M} strokeWidth="1.5" />
          <circle cx={x + i * 12.5} cy={i % 2 ? 210 : 219} r="5" fill={P} {...edge} />
        </g>
      ))}
    </g>
  );
}

function Earrings(props) {
  return (
    <g transform="translate(0 50)">
      <Earring x={98} {...props} />
      <Earring x={202} {...props} />
    </g>
  );
}

function Bangles({ M, S, A }) {
  return (
    <g>
      {[0, 1, 2].map((r) => (
        <g key={r}>
          <ellipse cx="150" cy={140 + r * 34} rx="108" ry="48" fill="none" stroke={M} strokeWidth="14" />
          <ellipse cx="150" cy={140 + r * 34} rx="108" ry="48" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="2" transform="translate(0 -4)" />
          {arc(13, 0.08, 0.92, 150, 140 + r * 34, 108, 48).map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i % 2 ? 3.5 : 5} fill={i % 2 ? A : S} {...edge} />
          ))}
        </g>
      ))}
    </g>
  );
}

function Ring({ M, S, A }) {
  return (
    <g>
      <ellipse cx="150" cy="220" rx="64" ry="68" fill="none" stroke={M} strokeWidth="15" />
      <ellipse cx="150" cy="220" rx="56" ry="60" fill="none" stroke="rgba(0,0,0,.15)" strokeWidth="2" />
      <path d="M126 160 L138 176 L162 176 L174 160" fill={M} {...edge} />
      <polygon points="150,92 186,130 150,174 114,130" fill={S} stroke={M} strokeWidth="4" />
      <path d="M114 130 H186 M150 92 L132 130 L150 174 L168 130 Z" stroke="#fff" strokeOpacity=".55" strokeWidth="1.2" fill="none" />
      <circle cx="102" cy="176" r="6" fill={A} {...edge} />
      <circle cx="198" cy="176" r="6" fill={A} {...edge} />
    </g>
  );
}

function Bracelet({ M, S }) {
  const links = arc(22, 0.02, 0.98, 150, 140, 118, 100);
  return (
    <g>
      {links.map(([x, y, th], i) => (
        <ellipse
          key={i}
          cx={x}
          cy={y}
          rx="9"
          ry="5.5"
          fill="none"
          stroke={M}
          strokeWidth="3.5"
          transform={`rotate(${(th * 180) / Math.PI + 90} ${x} ${y})`}
        />
      ))}
      {links.filter((_, i) => i % 4 === 2).map(([x, y], i) => (
        <g key={i}>
          <line x1={x} y1={y + 5} x2={x} y2={y + 16} stroke={M} strokeWidth="1.5" />
          <circle cx={x} cy={y + 21} r="6" fill={S} stroke={M} strokeWidth="2" />
        </g>
      ))}
    </g>
  );
}

function Tikka({ M, S, A, P }) {
  return (
    <g>
      {Array.from({ length: 14 }, (_, i) => (
        <circle key={i} cx="150" cy={22 + i * 10} r={i % 3 === 0 ? 4.5 : 3} fill={i % 3 === 0 ? P : M} {...edge} />
      ))}
      <circle cx="150" cy="208" r="46" fill={M} {...edge} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <circle key={i} cx={150 + 38 * Math.cos(a)} cy={208 + 38 * Math.sin(a)} r="4.5" fill={i % 2 ? A : P} {...edge} />;
      })}
      <circle cx="150" cy="208" r="24" fill={S} />
      <circle cx="143" cy="200" r="6" fill="#fff" opacity=".5" />
      {[-24, -12, 0, 12, 24].map((dx, i) => (
        <g key={i}>
          <line x1={150 + dx} y1="252" x2={150 + dx} y2={i === 2 ? 280 : 270} stroke={M} strokeWidth="1.5" />
          <circle cx={150 + dx} cy={i === 2 ? 287 : 276} r={i === 2 ? 7 : 5} fill={P} {...edge} />
        </g>
      ))}
    </g>
  );
}

function Brooch({ M, S, A, P }) {
  return (
    <g>
      {Array.from({ length: 10 }, (_, i) => (
        <ellipse key={i} cx="150" cy="96" rx="13" ry="30" fill={M} {...edge} transform={`rotate(${i * 36} 150 126)`} />
      ))}
      <circle cx="150" cy="126" r="30" fill={M} {...edge} />
      <circle cx="150" cy="126" r="20" fill={S} />
      <circle cx="143" cy="119" r="5" fill="#fff" opacity=".55" />
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2 + 0.31;
        return <circle key={i} cx={150 + 50 * Math.cos(a)} cy={126 + 50 * Math.sin(a)} r="5" fill={A} {...edge} />;
      })}
      {[-40, -20, 0, 20, 40].map((dx, i) => {
        const len = 120 + (2 - Math.abs(i - 2)) * 30;
        return (
          <g key={i}>
            {Array.from({ length: 9 }, (_, j) => (
              <circle key={j} cx={150 + dx} cy={176 + j * (len / 9)} r="3.2" fill={j % 2 ? P : M} {...edge} />
            ))}
            <path
              d={`M${150 + dx} ${176 + len} c -9 10 -9 22 0 28 c 9 -6 9 -18 0 -28 Z`}
              fill={S}
              stroke={M}
              strokeWidth="2"
            />
          </g>
        );
      })}
    </g>
  );
}

function Anklet({ M, A }) {
  const beads = arc(26, 0, 1, 150, 130, 118, 80);
  return (
    <g>
      <path d="M32 130 C 20 112 30 96 48 100" stroke={M} strokeWidth="2" fill="none" />
      {beads.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="5" fill={M} {...edge} />
          {i % 3 === 1 && (
            <>
              <line x1={x} y1={y + 5} x2={x} y2={y + 14} stroke={M} strokeWidth="1.5" />
              <path d={`M${x - 7} ${y + 26} Q ${x - 7} ${y + 14} ${x} ${y + 14} Q ${x + 7} ${y + 14} ${x + 7} ${y + 26} Z`} fill={M} {...edge} />
              <circle cx={x} cy={y + 27} r="2" fill={A} />
            </>
          )}
        </g>
      ))}
    </g>
  );
}

const SHAPES = {
  necklace: Necklace,
  earrings: Earrings,
  bangles: Bangles,
  ring: Ring,
  bracelet: Bracelet,
  tikka: Tikka,
  brooch: Brooch,
  anklet: Anklet,
};

const VARIANT_TRANSFORMS = [
  '',
  'translate(150 190) scale(1.4) translate(-150 -170)',
  'rotate(-10 150 180) translate(0 6)',
];

// `fit="contain"` shows the whole piece instead of cropping to fill the box;
// `bare` drops the painted backdrop so the art blends into its container's background.
export default function ProductArt({ product, variant = 0, bg, className = '', fit = 'cover', bare = false }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const photo = product.gallery?.[variant] || (variant === 0 ? product.image : null);
  if (photo) {
    return <img src={photo} alt={product.name} className={`product-art product-art--photo ${className}`} loading="lazy" />;
  }

  const metal = METALS[metalKey(product.plating)];
  const stone = STONES[product.stone];
  const backdrop = BACKDROPS[bg || product.bg] || BACKDROPS.blush;
  const M = `url(#m${uid})`;
  const S = stone ? `url(#s${uid})` : M;
  const A = stone ? stone.accent : metal[1];
  const P = `url(#p${uid})`;
  const Shape = SHAPES[product.shape] || Necklace;

  return (
    <svg
      viewBox="0 0 300 360"
      className={`product-art ${className}`}
      role="img"
      aria-label={product.name}
      preserveAspectRatio={fit === 'contain' ? 'xMidYMid meet' : 'xMidYMid slice'}
    >
      <defs>
        <linearGradient id={`bg${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={backdrop[0]} />
          <stop offset="1" stopColor={backdrop[1]} />
        </linearGradient>
        <linearGradient id={`m${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={metal[0]} />
          <stop offset=".5" stopColor={metal[1]} />
          <stop offset="1" stopColor={metal[2]} />
        </linearGradient>
        {stone && (
          <radialGradient id={`s${uid}`} cx=".35" cy=".3" r=".75">
            <stop offset="0" stopColor="#fff" stopOpacity=".9" />
            <stop offset=".3" stopColor={stone.fill} />
            <stop offset="1" stopColor={stone.dark} />
          </radialGradient>
        )}
        <radialGradient id={`p${uid}`} cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".6" stopColor="#f3ead8" />
          <stop offset="1" stopColor="#c8b796" />
        </radialGradient>
        <radialGradient id={`g${uid}`} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#fff" stopOpacity=".35" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      {!bare && <rect width="300" height="360" fill={`url(#bg${uid})`} />}
      <circle cx="150" cy="180" r="150" fill={`url(#g${uid})`} />
      <ellipse cx="150" cy="340" rx="110" ry="10" fill="#000" opacity=".08" />
      <g transform={VARIANT_TRANSFORMS[variant] || ''}>
        <Shape M={M} S={S} A={A} P={P} />
      </g>
    </svg>
  );
}
