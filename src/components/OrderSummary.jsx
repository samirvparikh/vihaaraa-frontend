import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatINR } from '../utils/pricing';

function CouponForm() {
  const { coupon, applyCoupon, removeCoupon } = useStore();
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  if (coupon) {
    return (
      <div className="coupon coupon--applied">
        <span><b>{coupon.code}</b> applied · {coupon.label}</span>
        <button className="link-btn" onClick={() => { removeCoupon(); setMsg(null); }}>Remove</button>
      </div>
    );
  }
  return (
    <>
      <form
        className="coupon"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const r = await applyCoupon(code);
          setBusy(false);
          setMsg(r);
          if (r.ok) setCode('');
        }}
      >
        <input placeholder="Coupon code" value={code} onChange={(e) => setCode(e.target.value)} aria-label="Coupon code" />
        <button className="btn btn--outline btn--sm" disabled={!code.trim() || busy}>{busy ? '…' : 'Apply'}</button>
      </form>
      {msg && <p className={`small ${msg.ok ? 'text-offer' : 'error'}`}>{msg.message}</p>}
    </>
  );
}

export default function OrderSummary({ children }) {
  const { totals, coupon } = useStore();
  return (
    <aside className="summary">
      <h3>Order Summary</h3>
      <CouponForm />
      <div className="summary__rows">
        <div className="row-between"><span>MRP ({totals.itemCount} items)</span><span>{formatINR(totals.mrpTotal)}</span></div>
        <div className="row-between text-offer"><span>Discount on MRP</span><span>− {formatINR(totals.mrpSavings)}</span></div>
        {totals.b1g1Discount > 0 && (
          <div className="row-between text-offer"><span>Buy 1 Get 1 Free</span><span>− {formatINR(totals.b1g1Discount)}</span></div>
        )}
        {coupon && (
          <div className="row-between text-offer">
            <span>Coupon ({coupon.code})</span>
            <span>{totals.couponDiscount ? `− ${formatINR(totals.couponDiscount)}` : '—'}</span>
          </div>
        )}
        {totals.couponNote && <p className="small error">{totals.couponNote}</p>}
        <div className="row-between"><span>Shipping</span><span>{totals.shipping ? formatINR(totals.shipping) : 'FREE'}</span></div>
        <div className="row-between total"><span>Total</span><span>{formatINR(totals.total)}</span></div>
        {totals.totalSavings > 0 && (
          <p className="savings">You save {formatINR(totals.totalSavings)} on this order 🎉</p>
        )}
      </div>
      {children}
    </aside>
  );
}
