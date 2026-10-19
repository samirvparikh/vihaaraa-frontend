import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import { useStore } from '../context/StoreContext';
import { formatINR } from '../utils/pricing';
import ProductArt from './ProductArt';
import { BagIcon, ChevronLeft, ChevronRight, CloseIcon, HeartIcon, MenuIcon, SearchIcon, UserIcon } from './Icons';

function AnnouncementBar() {
  const { announcements } = useSite();
  const [i, setI] = useState(0);
  const n = announcements.length;
  useEffect(() => {
    if (n < 2) return undefined;
    const t = setInterval(() => setI((x) => (x + 1) % n), 4000);
    return () => clearInterval(t);
  }, [n]);
  if (!n) return null;
  const a = announcements[i % n];
  return (
    <div className="announce">
      <button aria-label="Previous offer" onClick={() => setI((i - 1 + n) % n)}><ChevronLeft width={16} height={16} /></button>
      <p key={a.id} className="announce__text">{a.link ? <Link to={a.link}>{a.text}</Link> : a.text}</p>
      <button aria-label="Next offer" onClick={() => setI((i + 1) % n)}><ChevronRight width={16} height={16} /></button>
    </div>
  );
}

function MenuDrawer({ open, onClose }) {
  const { menu } = useSite();
  const { user } = useAuth();
  return (
    <>
      <div className={`overlay ${open ? 'is-open' : ''}`} onClick={onClose} />
      <aside className={`drawer drawer--left ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <div className="drawer__head">
          <span className="logo logo--sm">Vihaaraa</span>
          <button className="icon-btn" onClick={onClose} aria-label="Close menu"><CloseIcon /></button>
        </div>
        <nav className="menu">
          {menu.filter((g) => g.links.length).map((group) => (
            <div key={group.title} className="menu__group">
              <h4>{group.title}</h4>
              {group.links.map((l) => (
                <Link key={l.handle} to={`/collections/${l.handle}`} onClick={onClose}>{l.title}</Link>
              ))}
            </div>
          ))}
          <div className="menu__group">
            <h4>Help</h4>
            {user ? <Link to="/account" onClick={onClose}>My Account & Orders</Link> : <Link to="/login" onClick={onClose}>Sign In / Register</Link>}
            <Link to="/pages/care" onClick={onClose}>Jewellery Care</Link>
            <Link to="/pages/returns" onClick={onClose}>Return & Exchange</Link>
            <Link to="/pages/contact" onClick={onClose}>Contact Us</Link>
          </div>
        </nav>
      </aside>
    </>
  );
}

function SearchOverlay({ open, onClose }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const inputRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else setQ('');
  }, [open]);

  // Debounced live search against the catalogue.
  useEffect(() => {
    const term = q.trim();
    if (!term) {
      setResults([]);
      return undefined;
    }
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      api(`/products?q=${encodeURIComponent(term)}&limit=6`, { signal: ctrl.signal })
        .then((d) => setResults(d.products))
        .catch(() => {});
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  const submit = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    navigate(`/search?q=${encodeURIComponent(q.trim())}`);
    onClose();
  };

  if (!open) return null;
  return (
    <div className="search-overlay" role="dialog" aria-label="Search">
      <form className="search-overlay__bar container" onSubmit={submit}>
        <SearchIcon />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search kundan, jhumka, American diamond, rose gold…"
          onKeyDown={(e) => e.key === 'Escape' && onClose()}
        />
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close search"><CloseIcon /></button>
      </form>
      {q && (
        <div className="search-overlay__results container">
          {results.length === 0 && <p className="muted">No matches for “{q}”.</p>}
          {results.map((p) => (
            <Link key={p.id} to={`/product/${p.slug}`} className="search-hit" onClick={onClose}>
              <ProductArt product={p} />
              <div>
                <p>{p.name}</p>
                <span className="muted">{p.plating} · {formatINR(p.price)}</span>
              </div>
            </Link>
          ))}
          {results.length > 0 && (
            <button className="btn btn--outline" onClick={submit}>See all results</button>
          )}
        </div>
      )}
      <div className="search-overlay__backdrop" onClick={onClose} />
    </div>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { cartCount, wishlist, setCartOpen } = useStore();
  const { user } = useAuth();
  const { pathname } = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  return (
    <>
      <AnnouncementBar />
      <div className="toplinks container">
        <Link to="/pages/store-locator">Store Locator</Link>
        <Link to="/account">Track Package</Link>
        <Link to="/pages/contact">Contact Us</Link>
        <Link to="/pages/returns">Return & Exchange</Link>
        <span className="toplinks__account">
          {user ? <Link to="/account">Hi, {user.name.split(' ')[0]}</Link> : <><Link to="/login">Sign In</Link> / <Link to="/register">Register</Link></>}
        </span>
      </div>
      <header className="header">
        <div className="header__inner container">
          <div className="header__left">
            <button className="icon-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu"><MenuIcon /></button>
            <nav className="header__nav">
              <Link to="/collections/new-launches">New</Link>
              <Link to="/collections/ethnic">Ethnic</Link>
              <Link to="/collections/western">Western</Link>
              <Link to="/collections/925-silver">925 Silver</Link>
            </nav>
          </div>
          <Link to="/" className="logo" aria-label="Vihaaraa home">Vihaaraa</Link>
          <div className="header__right">
            <Link to={user ? '/account' : '/login'} className="icon-btn hide-sm" aria-label={user ? 'My account' : 'Sign in'}><UserIcon /></Link>
            <button className="icon-btn" onClick={() => setSearchOpen(true)} aria-label="Search"><SearchIcon /></button>
            <Link to="/wishlist" className="icon-btn" aria-label="Wishlist">
              <HeartIcon />
              {wishlist.length > 0 && <span className="count">{wishlist.length}</span>}
            </Link>
            <button className="icon-btn" onClick={() => setCartOpen(true)} aria-label={`Cart, ${cartCount} items`}>
              <BagIcon />
              {cartCount > 0 && <span className="count">{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>
      <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
