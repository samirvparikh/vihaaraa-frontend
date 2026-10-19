import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { api } from '../api';
import { Loading } from '../components/Status';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import useApi from '../hooks/useApi';
import { formatINR } from '../utils/pricing';

function Orders() {
  const { data, error } = useApi('/orders', { cacheable: false });
  if (error) return <p className="error">{error.message}</p>;
  if (!data) return <Loading label="Loading orders…" />;
  if (!data.orders.length) {
    return (
      <div className="empty">
        <p>You haven’t placed any orders yet.</p>
        <Link to="/collections/best-sellers" className="btn btn--dark">Shop Best Sellers</Link>
      </div>
    );
  }
  return data.orders.map((o) => (
    <Link key={o.id} to={`/order/${o.id}`} className="panel order-row">
      <div>
        <strong>#{o.id}</strong>
        <p className="small muted">
          {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {o.totals.itemCount} items
        </p>
      </div>
      <div className="order-row__right">
        <strong>{formatINR(o.totals.total)}</strong>
        <p className={`small status status--${o.statusKey}`}>{o.status}</p>
      </div>
    </Link>
  ));
}

function Field({ label, name, form, errors, onChange, ...rest }) {
  return (
    <label className={`field ${errors[name] ? 'has-error' : ''}`}>
      <span>{label}</span>
      <input name={name} value={form[name]} onChange={onChange} {...rest} />
      {errors[name] && <small className="error">{errors[name]}</small>}
    </label>
  );
}

/** Small form helper: submits `send(form)` and maps Laravel validation errors onto fields. */
function useForm(initial, send, onDone) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === 'phone' ? value.replace(/\D/g, '') : value }));
  };
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      const d = await send(form);
      onDone?.(d, setForm);
    } catch (err) {
      setErrors(Object.fromEntries(Object.entries(err.errors || {}).map(([k, v]) => [k, v[0]])));
      if (!err.errors) onDone?.({ message: err.message });
    } finally {
      setBusy(false);
    }
  };
  return { props: { form, errors, onChange }, submit, busy };
}

function Profile({ user }) {
  const { updateProfile } = useAuth();
  const { showToast } = useStore();
  const profile = useForm({ name: user.name, email: user.email, phone: user.phone || '' }, updateProfile, (d) => d.message && showToast(d.message));
  const blank = { current_password: '', password: '', password_confirmation: '' };
  const pass = useForm(blank, (f) => api('/me/password', { method: 'PUT', body: f }), (d, setForm) => {
    if (d.message) showToast(d.message);
    setForm?.(blank);
  });

  return (
    <div className="account__forms">
      <form className="panel" onSubmit={profile.submit} noValidate>
        <h3>Profile</h3>
        <Field label="Full name" name="name" autoComplete="name" {...profile.props} />
        <Field label="Email" name="email" type="email" autoComplete="email" {...profile.props} />
        <Field label="Mobile number" name="phone" inputMode="numeric" maxLength={10} {...profile.props} />
        <button className="btn btn--dark" disabled={profile.busy}>Save</button>
      </form>
      <form className="panel" onSubmit={pass.submit} noValidate>
        <h3>Change password</h3>
        <Field label="Current password" name="current_password" type="password" autoComplete="current-password" {...pass.props} />
        <Field label="New password" name="password" type="password" autoComplete="new-password" {...pass.props} />
        <Field label="Confirm new password" name="password_confirmation" type="password" autoComplete="new-password" {...pass.props} />
        <button className="btn btn--outline" disabled={pass.busy}>Update password</button>
      </form>
    </div>
  );
}

export default function Account() {
  const { user, checking, logout } = useAuth();
  const [tab, setTab] = useState('orders');
  if (checking) return <Loading />;
  if (!user) return <Navigate to="/login?redirect=/account" replace />;

  return (
    <div className="container page narrow">
      <nav className="crumbs"><Link to="/">Home</Link> / My Account</nav>
      <div className="row-between">
        <h1 className="page__title">Hi, {user.name.split(' ')[0]}</h1>
        <button className="link-btn" onClick={logout}>Sign out</button>
      </div>
      <div className="account__tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'orders'} className={tab === 'orders' ? 'is-active' : ''} onClick={() => setTab('orders')}>My Orders</button>
        <button role="tab" aria-selected={tab === 'profile'} className={tab === 'profile' ? 'is-active' : ''} onClick={() => setTab('profile')}>Profile & Password</button>
      </div>
      {tab === 'orders' ? <Orders /> : <Profile user={user} />}
    </div>
  );
}
