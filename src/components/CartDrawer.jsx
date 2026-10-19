import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { useStore } from '../context/StoreContext';
import { formatINR } from '../utils/pricing';
import { CloseIcon } from './Icons';
import CartLine from './CartLine';

export default function CartDrawer() {
  const { cartOpen, setCartOpen, lines, totals } = useStore();
  const { settings } = useSite();
  const navigate = useNavigate();
  const close = () => setCartOpen(false);

  useEffect(() => {
    document.body.style.overflow = cartOpen ? 'hidden' : '';
    const onKey = (e) => e.key === 'Escape' && setCartOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cartOpen, setCartOpen]);

  const toFree = settings.freeShippingMin - (totals.total - totals.shipping);
  const progress = settings.freeShippingMin > 0 ? Math.min(100, ((totals.total - totals.shipping) / settings.freeShippingMin) * 100) : 100;

  return (
    <>
      <div className={`overlay ${cartOpen ? 'is-open' : ''}`} onClick={close} />
      <aside className={`drawer drawer--right ${cartOpen ? 'is-open' : ''}`} aria-hidden={!cartOpen} aria-label="Shopping cart">
        <div className="drawer__head">
          <h3>Your Cart ({totals.itemCount})</h3>
          <button className="icon-btn" onClick={close} aria-label="Close cart"><CloseIcon /></button>
        </div>

        {lines.length === 0 ? (
          <div className="drawer__empty">
            <p>Your cart is empty.</p>
            <button className="btn btn--dark" onClick={() => { close(); navigate('/collections/best-sellers'); }}>
              Shop Best Sellers
            </button>
          </div>
        ) : (
          <>
            <div className="drawer__notice">
              {settings.b1g1Enabled && (totals.needsOneMoreForFree ? (
                <p><strong>Buy 1 Get 1 Free:</strong> add one more piece and the lower-priced one is free.</p>
              ) : (
                <p>🎉 B1G1 applied — you save <strong>{formatINR(totals.b1g1Discount)}</strong></p>
              ))}
              {toFree > 0 ? (
                <p className="muted">Add {formatINR(toFree)} more for free shipping</p>
              ) : (
                <p className="muted">You’ve unlocked free shipping</p>
              )}
              <div className="progress"><span style={{ width: `${progress}%` }} /></div>
            </div>
            <div className="drawer__body">
              {lines.map((l) => (
                <CartLine key={l.key} line={l} onNavigate={close} compact />
              ))}
            </div>
            <div className="drawer__foot">
              <div className="row-between"><span>Subtotal</span><span>{formatINR(totals.subtotal)}</span></div>
              {totals.b1g1Discount > 0 && (
                <div className="row-between text-offer"><span>Buy 1 Get 1</span><span>− {formatINR(totals.b1g1Discount)}</span></div>
              )}
              <div className="row-between total"><span>Total</span><span>{formatINR(totals.total)}</span></div>
              <p className="muted small">Taxes included. Coupons & shipping calculated at checkout.</p>
              <button className="btn btn--dark btn--block" onClick={() => { close(); navigate('/checkout'); }}>Checkout</button>
              <Link to="/cart" className="btn btn--outline btn--block" onClick={close}>View Cart</Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
