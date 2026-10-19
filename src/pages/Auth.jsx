import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Loading } from '../components/Status';
import { useAuth } from '../context/AuthContext';

// Only same-site paths are honoured so ?redirect= can't send people off-site.
const safeRedirect = (r) => (r && r.startsWith('/') && !r.startsWith('//') ? r : '/account');

function Input({ label, name, form, errors, onChange, ...rest }) {
  return (
    <label className={`field ${errors[name] ? 'has-error' : ''}`}>
      <span>{label}</span>
      <input name={name} value={form[name]} onChange={onChange} {...rest} />
      {errors[name] && <small className="error">{errors[name]}</small>}
    </label>
  );
}

function useAuthForm(initial, action) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const redirect = safeRedirect(params.get('redirect'));

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === 'phone' ? value.replace(/\D/g, '') : value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      await action(form);
      navigate(redirect, { replace: true });
    } catch (err) {
      const fieldErrors = Object.fromEntries(Object.entries(err.errors || {}).map(([k, v]) => [k, v[0]]));
      setErrors(Object.keys(fieldErrors).length ? fieldErrors : { form: err.message });
      setBusy(false);
    }
  };

  return { form, errors, busy, onChange, submit, redirect, query: params.toString() };
}

function AuthShell({ title, sub, children }) {
  const { user, checking } = useAuth();
  const [params] = useSearchParams();
  if (checking) return <Loading />;
  if (user) return <Navigate to={safeRedirect(params.get('redirect'))} replace />;
  return (
    <div className="container page auth">
      <div className="panel auth__card">
        <h1 className="page__title">{title}</h1>
        <p className="muted">{sub}</p>
        {children}
      </div>
    </div>
  );
}

export function Login() {
  const { login } = useAuth();
  const f = useAuthForm({ email: '', password: '' }, (v) => login(v.email, v.password));
  const p = { form: f.form, errors: f.errors, onChange: f.onChange };
  return (
    <AuthShell title="Sign In" sub="Sign in to check out, track orders and keep your wishlist on every device.">
      <form onSubmit={f.submit} noValidate className="auth__form">
        {f.errors.form && <div className="alert alert--error">{f.errors.form}</div>}
        <Input label="Email" name="email" type="email" autoComplete="email" required {...p} />
        <Input label="Password" name="password" type="password" autoComplete="current-password" required {...p} />
        <button className="btn btn--dark btn--block" disabled={f.busy}>{f.busy ? 'Signing in…' : 'Sign In'}</button>
      </form>
      <p className="center small">New to Vihaaraa? <Link to={`/register${f.query ? `?${f.query}` : ''}`} className="link-underline">Create an account</Link></p>
    </AuthShell>
  );
}

export function Register() {
  const { register } = useAuth();
  const f = useAuthForm({ name: '', email: '', phone: '', password: '', password_confirmation: '' }, register);
  const p = { form: f.form, errors: f.errors, onChange: f.onChange };
  return (
    <AuthShell title="Create Account" sub="Your cart and wishlist come with you.">
      <form onSubmit={f.submit} noValidate className="auth__form">
        {f.errors.form && <div className="alert alert--error">{f.errors.form}</div>}
        <Input label="Full name" name="name" autoComplete="name" required {...p} />
        <Input label="Email" name="email" type="email" autoComplete="email" required {...p} />
        <Input label="Mobile number (optional)" name="phone" inputMode="numeric" maxLength={10} autoComplete="tel" {...p} />
        <Input label="Password (min. 8 characters)" name="password" type="password" autoComplete="new-password" required {...p} />
        <Input label="Confirm password" name="password_confirmation" type="password" autoComplete="new-password" required {...p} />
        <button className="btn btn--dark btn--block" disabled={f.busy}>{f.busy ? 'Creating account…' : 'Create Account'}</button>
      </form>
      <p className="center small">Already have an account? <Link to={`/login${f.query ? `?${f.query}` : ''}`} className="link-underline">Sign in</Link></p>
    </AuthShell>
  );
}
