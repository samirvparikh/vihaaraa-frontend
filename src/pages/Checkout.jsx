import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import OrderSummary from '../components/OrderSummary';
import ProductArt from '../components/ProductArt';
import { Loading } from '../components/Status';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import { useStore } from '../context/StoreContext';
import { formatINR } from '../utils/pricing';

const STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
  'Jammu & Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab',
  'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Other',
];

const PAYMENTS = [
  { id: 'upi', label: 'UPI (GPay, PhonePe, Paytm)' },
  { id: 'card', label: 'Credit / Debit Card' },
  { id: 'netbanking', label: 'Net Banking' },
  { id: 'cod', label: 'Cash on Delivery' },
];

const ADDRESS_KEY = 'vihaaraa_address';

function savedAddress() {
  try {
    return JSON.parse(localStorage.getItem(ADDRESS_KEY)) || {};
  } catch {
    return {};
  }
}

function validate(f, total, codLimit) {
  const e = {};
  if (f.name.trim().length < 2) e.name = 'Enter your full name';
  if (!/^[6-9]\d{9}$/.test(f.phone)) e.phone = 'Enter a valid 10-digit mobile number';
  if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Enter a valid email';
  if (f.address.trim().length < 8) e.address = 'Enter your full address';
  if (!f.city.trim()) e.city = 'Enter your city';
  if (!f.state) e.state = 'Select your state';
  if (!/^[1-9]\d{5}$/.test(f.pincode)) e.pincode = 'Enter a valid 6-digit pincode';
  if (f.payment === 'cod' && total > codLimit) e.payment = `COD is available on orders up to ${formatINR(codLimit)}`;
  return e;
}

function Field({ label, name, form, errors, onChange, className = '', ...rest }) {
  return (
    <label className={`field ${className} ${errors[name] ? 'has-error' : ''}`}>
      <span>{label}</span>
      <input name={name} value={form[name]} onChange={onChange} {...rest} />
      {errors[name] && <small className="error">{errors[name]}</small>}
    </label>
  );
}

export default function Checkout() {
  const { user, checking } = useAuth();
  const { cartReady } = useStore();
  if (checking) return <Loading />;
  // Orders belong to an account, so guests sign in first; their cart is merged in on the way.
  if (!user) return <Navigate to="/login?redirect=/checkout" replace />;
  if (!cartReady) return <Loading label="Loading your cart…" />;
  return <CheckoutForm user={user} />;
}

function CheckoutForm({ user }) {
  const { lines, totals, placeOrder } = useStore();
  const { settings } = useSite();
  const navigate = useNavigate();
  const [form, setForm] = useState(() => ({
    name: user.name, phone: user.phone || '', email: user.email,
    address: '', landmark: '', city: '', state: '', pincode: '', payment: 'upi',
    ...savedAddress(),
  }));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [placing, setPlacing] = useState(false);

  // `placing` stays true after success, so emptying the cart doesn't bounce us to /cart mid-navigation.
  if (lines.length === 0 && !placing) return <Navigate to="/cart" replace />;

  const onChange = (e) => {
    const { name, value } = e.target;
    const v = name === 'phone' || name === 'pincode' ? value.replace(/\D/g, '') : value;
    setForm((f) => ({ ...f, [name]: v }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setFormError('');
    const errs = validate(form, totals.total, settings.codLimit);
    setErrors(errs);
    if (Object.keys(errs).length) {
      setTimeout(() => document.querySelector('.has-error input, .has-error select')?.focus());
      return;
    }
    setPlacing(true);
    try {
      // Online payments are simulated by the backend; plug Razorpay/PayU into OrderController@store.
      const order = await placeOrder(form);
      const { address, landmark, city, state, pincode } = form;
      try {
        localStorage.setItem(ADDRESS_KEY, JSON.stringify({ address, landmark, city, state, pincode }));
      } catch {
        /* not essential */
      }
      navigate(`/order/${order.id}?placed=1`, { replace: true });
    } catch (err) {
      setPlacing(false);
      const fieldErrors = Object.fromEntries(Object.entries(err.errors || {}).map(([k, v]) => [k, v[0]]));
      setErrors(fieldErrors);
      setFormError(fieldErrors.cart || fieldErrors.coupon || err.message);
    }
  };

  const fieldProps = { form, errors, onChange };
  const codAllowed = totals.total <= settings.codLimit;

  return (
    <div className="container page">
      <nav className="crumbs"><Link to="/">Home</Link> / <Link to="/cart">Cart</Link> / Checkout</nav>
      <h1 className="page__title">Checkout</h1>

      <form className="checkout-grid" onSubmit={submit} noValidate>
        <div className="checkout-form">
          {formError && <div className="alert alert--error">{formError}</div>}
          <section className="panel">
            <h3>1. Contact</h3>
            <div className="fields">
              <Field label="Full name" name="name" autoComplete="name" {...fieldProps} />
              <Field label="Mobile number" name="phone" inputMode="numeric" maxLength={10} autoComplete="tel" {...fieldProps} />
              <Field label="Email" name="email" type="email" autoComplete="email" className="span-2" {...fieldProps} />
            </div>
          </section>

          <section className="panel">
            <h3>2. Delivery Address</h3>
            <div className="fields">
              <Field label="House no., street, area" name="address" autoComplete="street-address" className="span-2" {...fieldProps} />
              <Field label="Landmark (optional)" name="landmark" className="span-2" {...fieldProps} />
              <Field label="City" name="city" autoComplete="address-level2" {...fieldProps} />
              <label className={`field ${errors.state ? 'has-error' : ''}`}>
                <span>State</span>
                <select name="state" value={form.state} onChange={onChange}>
                  <option value="">Select state</option>
                  {STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
                {errors.state && <small className="error">{errors.state}</small>}
              </label>
              <Field label="Pincode" name="pincode" inputMode="numeric" maxLength={6} autoComplete="postal-code" {...fieldProps} />
            </div>
          </section>

          <section className="panel">
            <h3>3. Payment</h3>
            <div className="payments">
              {PAYMENTS.map((p) => (
                <label key={p.id} className={`radio ${form.payment === p.id ? 'is-active' : ''}`}>
                  <input type="radio" name="payment" value={p.id} checked={form.payment === p.id} onChange={onChange} disabled={p.id === 'cod' && !codAllowed} />
                  {p.label}
                  {p.id === 'cod' && !codAllowed && <span className="small muted"> — up to {formatINR(settings.codLimit)} only</span>}
                </label>
              ))}
            </div>
            {errors.payment && <p className="error small">{errors.payment}</p>}
          </section>
        </div>

        <OrderSummary>
          <div className="summary__items">
            {lines.map((l) => (
              <div key={l.key} className="mini-line">
                <span className="mini-line__img"><ProductArt product={l.product} /><i>{l.qty}</i></span>
                <span className="mini-line__name">{l.product.name}{l.size && ` · Size ${l.size}`}</span>
                <span>{formatINR(l.product.price * l.qty)}</span>
              </div>
            ))}
          </div>
          <button className="btn btn--dark btn--block" disabled={placing}>
            {placing ? 'Placing order…' : `Place Order · ${formatINR(totals.total)}`}
          </button>
          <p className="small muted center">Secure checkout · 7-day returns</p>
        </OrderSummary>
      </form>
    </div>
  );
}
