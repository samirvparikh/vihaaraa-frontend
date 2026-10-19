import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../api';
import { computeTotals } from '../utils/pricing';
import { useAuth } from './AuthContext';
import { useSite } from './SiteContext';

const StoreContext = createContext(null);

const KEYS = { cart: 'vihaaraa_cart', wishlist: 'vihaaraa_wishlist', coupon: 'vihaaraa_coupon' };

function load(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}
function save(key, value) {
  try {
    if (value === null || (Array.isArray(value) && value.length === 0)) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — cart still works for this session */
  }
}

// Guest cart lines are keyed by product id + optional size so a ring in size 12 and 14 are separate lines.
// Signed-in lines use the server's cart item id as their key.
const lineKey = (id, size) => (size ? `${id}__${size}` : String(id));

/**
 * Cart, wishlist and coupon. Guests keep them in localStorage; once a customer signs in they live
 * on the server and anything collected as a guest is merged into the account.
 */
export function StoreProvider({ children }) {
  const { user, checking } = useAuth();
  const { settings } = useSite();
  const [cart, setCart] = useState(() => load(KEYS.cart, []));
  const [wishlist, setWishlist] = useState(() => load(KEYS.wishlist, []));
  const [coupon, setCoupon] = useState(() => load(KEYS.coupon, null));
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef();
  const syncedUser = useRef(undefined);
  // Which account (or null for guest) the cart in state belongs to; until it matches, the cart is still loading.
  const [loadedFor, setLoadedFor] = useState(undefined);
  const signedIn = !!user;
  const cartReady = !checking && loadedFor === (user?.id ?? null);

  const showToast = useCallback((message) => {
    clearTimeout(toastTimer.current);
    setToast({ message, id: Date.now() });
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  // Guests: persist locally. Signed in: the server is the source of truth.
  useEffect(() => {
    if (!signedIn && !checking) save(KEYS.cart, cart);
  }, [cart, signedIn, checking]);
  useEffect(() => {
    if (!signedIn && !checking) save(KEYS.wishlist, wishlist);
  }, [wishlist, signedIn, checking]);
  useEffect(() => {
    save(KEYS.coupon, coupon);
  }, [coupon]);

  // React to sign-in / sign-out.
  useEffect(() => {
    if (checking) return;
    const id = user?.id ?? null;
    if (syncedUser.current === id) return;
    const previous = syncedUser.current;
    syncedUser.current = id;

    if (id) {
      const guestCart = load(KEYS.cart, []);
      const guestWish = load(KEYS.wishlist, []);
      save(KEYS.cart, []);
      save(KEYS.wishlist, []);
      api('/cart/merge', { method: 'POST', body: { lines: guestCart.map((l) => ({ product_id: l.id, size: l.size, qty: l.qty })) } })
        .then((d) => setCart(d.items))
        .catch(() => setCart([]))
        .finally(() => setLoadedFor(id));
      api('/wishlist/merge', { method: 'POST', body: { ids: guestWish } })
        .then((d) => setWishlist(d.ids))
        .catch(() => {});
    } else if (previous) {
      // Signed out: start an empty guest session.
      setCart([]);
      setWishlist([]);
      setCoupon(null);
      setLoadedFor(null);
    } else {
      // Guest visit: refresh saved lines so prices and availability are current.
      setLoadedFor(null);
      const ids = [...new Set(load(KEYS.cart, []).map((l) => l.id))];
      if (!ids.length) return;
      api(`/products?ids=${ids.join(',')}`)
        .then(({ products }) => {
          const byId = new Map(products.map((p) => [p.id, p]));
          setCart((c) => c.filter((l) => byId.has(l.id)).map((l) => ({ ...l, product: byId.get(l.id) })));
        })
        .catch(() => {});
    }
  }, [user, checking]);

  const maxFor = useCallback((product) => Math.max(1, Math.min(settings.maxQty, product.stock ?? settings.maxQty)), [settings.maxQty]);

  const run = useCallback(
    async (request) => {
      try {
        const d = await request;
        setCart(d.items);
        return true;
      } catch (e) {
        showToast(e.message);
        return false;
      }
    },
    [showToast]
  );

  const addToCart = useCallback(
    async (product, qty = 1, { size = null, openDrawer = true } = {}) => {
      if (product.inStock === false) {
        showToast('Sorry, this piece is out of stock.');
        return false;
      }
      if (signedIn) {
        const ok = await run(api('/cart', { method: 'POST', body: { product_id: product.id, size, qty } }));
        if (!ok) return false;
      } else {
        setCart((c) => {
          const key = lineKey(product.id, size);
          const existing = c.find((l) => l.key === key);
          if (existing) return c.map((l) => (l.key === key ? { ...l, product, qty: Math.min(l.qty + qty, maxFor(product)) } : l));
          return [...c, { key, id: product.id, size, qty: Math.min(qty, maxFor(product)), product }];
        });
      }
      showToast(`${product.name} added to cart`);
      if (openDrawer) setCartOpen(true);
      return true;
    },
    [signedIn, run, showToast, maxFor]
  );

  const updateQty = useCallback(
    (key, qty) => {
      if (signedIn) return run(api(`/cart/${key}`, { method: 'PATCH', body: { qty: Math.max(0, qty) } }));
      setCart((c) =>
        qty <= 0 ? c.filter((l) => l.key !== key) : c.map((l) => (l.key === key ? { ...l, qty: Math.min(qty, maxFor(l.product)) } : l))
      );
      return true;
    },
    [signedIn, run, maxFor]
  );

  const removeFromCart = useCallback(
    (key) => {
      if (signedIn) return run(api(`/cart/${key}`, { method: 'DELETE' }));
      setCart((c) => c.filter((l) => l.key !== key));
      return true;
    },
    [signedIn, run]
  );

  const clearCart = useCallback(() => {
    if (signedIn) return run(api('/cart', { method: 'DELETE' }));
    setCart([]);
    return true;
  }, [signedIn, run]);

  const toggleWishlist = useCallback(
    async (id) => {
      const had = wishlist.includes(id);
      if (signedIn) {
        try {
          const d = await api(`/wishlist/${id}`, { method: 'POST' });
          setWishlist(d.ids);
        } catch (e) {
          showToast(e.message);
          return;
        }
      } else {
        setWishlist((w) => (had ? w.filter((x) => x !== id) : [...w, id]));
      }
      showToast(had ? 'Removed from wishlist' : 'Saved to wishlist');
    },
    [wishlist, signedIn, showToast]
  );

  const applyCoupon = useCallback(async (code) => {
    try {
      const d = await api('/coupons/apply', { method: 'POST', body: { code: code.trim() } });
      setCoupon(d.coupon);
      return { ok: true, message: d.message };
    } catch (e) {
      return { ok: false, message: e.field('code') || e.message };
    }
  }, []);

  /** Places the order from the server cart. Throws ApiError with field errors on failure. */
  const placeOrder = useCallback(
    async (customer) => {
      const d = await api('/orders', { method: 'POST', body: { ...customer, coupon: coupon?.code || null } });
      setCart([]);
      setCoupon(null);
      return d.order;
    },
    [coupon]
  );

  const totals = useMemo(() => computeTotals(cart, coupon, settings), [cart, coupon, settings]);

  const value = {
    lines: cart,
    cartReady,
    totals,
    cartCount: totals.itemCount,
    maxQtyFor: maxFor,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
    coupon,
    applyCoupon,
    removeCoupon: () => setCoupon(null),
    wishlist,
    toggleWishlist,
    isWishlisted: (id) => wishlist.includes(id),
    cartOpen,
    setCartOpen,
    toast,
    showToast,
    placeOrder,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}
