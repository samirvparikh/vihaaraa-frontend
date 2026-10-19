import { useEffect, useState } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { LoadError, Loading } from '../components/Status';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { formatINR } from '../utils/pricing';

const STEPS = ['confirmed', 'processing', 'shipped', 'delivered'];

/** Order confirmation (after checkout, ?placed=1) and order detail from My Account. */
export default function OrderSuccess() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { user, checking } = useAuth();
  const { showToast } = useStore();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!user) return;
    api(`/orders/${encodeURIComponent(id)}`)
      .then((d) => setOrder(d.order))
      .catch(setError);
  }, [id, user]);

  if (checking) return <Loading />;
  if (!user) return <Navigate to={`/login?redirect=/order/${id}`} replace />;
  if (error) return <LoadError error={error} />;
  if (!order) return <Loading />;

  const c = order.customer;
  const placed = params.get('placed') === '1';
  const step = STEPS.indexOf(order.statusKey);

  const cancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    setCancelling(true);
    try {
      const d = await api(`/orders/${encodeURIComponent(order.id)}/cancel`, { method: 'POST' });
      setOrder(d.order);
      showToast(d.message);
    } catch (e) {
      showToast(e.field('order') || e.message);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="container page narrow">
      {placed ? (
        <div className="success">
          <div className="success__tick">✓</div>
          <h1 className="page__title">Thank you, {c.name.split(' ')[0]}!</h1>
          <p>Your order <b>#{order.id}</b> is confirmed. We’ll send updates to {c.email}.</p>
        </div>
      ) : (
        <>
          <nav className="crumbs"><Link to="/">Home</Link> / <Link to="/account">My Account</Link> / Order #{order.id}</nav>
          <h1 className="page__title">Order #{order.id}</h1>
        </>
      )}

      {step >= 0 && (
        <ol className="tracker">
          {STEPS.map((s, i) => (
            <li key={s} className={i <= step ? 'is-done' : ''}>{s[0].toUpperCase() + s.slice(1)}</li>
          ))}
        </ol>
      )}

      <div className="panel">
        <div className="row-between">
          <h3>Order details</h3>
          <span className={`status status--${order.statusKey}`}>{order.status}</span>
        </div>
        <p className="small muted">
          Placed {new Date(order.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
        </p>
        {order.lines.map((l, i) => (
          <div key={i} className="row-between">
            <span>
              {l.slug ? <Link to={`/product/${l.slug}`}>{l.name}</Link> : l.name}
              {l.size && ` · Size ${l.size}`} × {l.qty}
            </span>
            <span>{formatINR(l.price * l.qty)}</span>
          </div>
        ))}
        <hr />
        {order.totals.b1g1Discount > 0 && (
          <div className="row-between text-offer"><span>Buy 1 Get 1</span><span>− {formatINR(order.totals.b1g1Discount)}</span></div>
        )}
        {order.totals.couponDiscount > 0 && (
          <div className="row-between text-offer"><span>Coupon ({order.coupon})</span><span>− {formatINR(order.totals.couponDiscount)}</span></div>
        )}
        <div className="row-between"><span>Shipping</span><span>{order.totals.shipping ? formatINR(order.totals.shipping) : 'FREE'}</span></div>
        <div className="row-between total"><span>Total</span><span>{formatINR(order.totals.total)}</span></div>
        <p className="small muted">Payment: {order.paymentMethod} · {order.paymentStatus}</p>
        {order.trackingNumber && <p className="small"><b>Tracking:</b> {order.trackingNumber}</p>}
        <p className="small muted">Ship to: {c.address}{c.landmark ? `, ${c.landmark}` : ''}, {c.city}, {c.state} – {c.pincode} · {c.phone}</p>
        {order.canCancel && (
          <button className="link-btn" onClick={cancel} disabled={cancelling}>{cancelling ? 'Cancelling…' : 'Cancel this order'}</button>
        )}
      </div>
      <div className="center">
        <Link to="/collections/all" className="btn btn--dark">Continue Shopping</Link>
      </div>
    </div>
  );
}
