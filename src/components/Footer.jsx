import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import { useStore } from '../context/StoreContext';
import { formatINR } from '../utils/pricing';
import { BagIcon, GridIcon, HeartIcon, HomeIcon, MailIcon, ReturnIcon, ShieldIcon, TruckIcon, UserIcon } from './Icons';

function Promises() {
  const { settings } = useSite();
  const items = [
    { icon: <TruckIcon />, title: 'Free Shipping', text: `On orders above ${formatINR(settings.freeShippingMin)}` },
    { icon: <ReturnIcon />, title: '7-Day Returns', text: 'Easy exchange & refunds' },
    { icon: <ShieldIcon />, title: 'Skin Friendly', text: 'Nickel & lead-free plating' },
    { icon: <BagIcon />, title: 'Cash on Delivery', text: 'Pay when it arrives' },
  ];
  return (
    <section className="promises container">
      {items.map((i) => (
        <div key={i.title} className="promise">
          {i.icon}
          <div>
            <strong>{i.title}</strong>
            <span>{i.text}</span>
          </div>
        </div>
      ))}
    </section>
  );
}

const SOCIALS = [
  ['instagram', 'Instagram', 'IG'],
  ['facebook', 'Facebook', 'FB'],
  ['youtube', 'YouTube', 'YT'],
  ['pinterest', 'Pinterest', 'PI'],
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const { showToast, cartCount, setCartOpen } = useStore();
  const { settings, footerPages } = useSite();
  const { user } = useAuth();
  const whatsapp = settings.contactWhatsapp.replace(/\D/g, '');

  const subscribe = async (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return showToast('Please enter a valid email');
    setSending(true);
    try {
      const d = await api('/newsletter', { method: 'POST', body: { email } });
      setEmail('');
      showToast(d.message);
    } catch (err) {
      showToast(err.field('email') || err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Promises />
      <footer className="footer">
        <div className="footer__grid container">
          <div>
            <h5>Care</h5>
            <Link to="/account">Track Your Order</Link>
            {footerPages.map((p) => <Link key={p.slug} to={`/pages/${p.slug}`}>{p.title}</Link>)}
          </div>
          <div>
            <h5>Contact Us</h5>
            <p>{settings.contactHours}</p>
            <p><a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer"><u>WhatsApp: {settings.contactWhatsapp}</u></a></p>
            <p>Email: {settings.contactEmail}</p>
          </div>
          <div>
            <h5>Sign Up and Save</h5>
            <p>Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>
            <form className="subscribe" onSubmit={subscribe}>
              <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email" />
              <button aria-label="Subscribe" disabled={sending}><MailIcon width={18} height={18} /></button>
            </form>
            <div className="socials">
              {SOCIALS.map(([key, label, short]) => (
                <a key={key} href={settings.social?.[key] || '#'} aria-label={label} target="_blank" rel="noreferrer">{short}</a>
              ))}
            </div>
          </div>
        </div>
        <p className="footer__legal container">
          Vihaaraa offers imitation (fashion) jewellery — base metals such as brass, copper and alloy plated with gold, silver or rhodium, set with
          simulated stones like American diamonds, cubic zirconia, kundan and glass.
          <br />© {new Date().getFullYear()} Vihaaraa. All rights reserved.
        </p>
      </footer>

      <nav className="bottom-nav" aria-label="Quick navigation">
        <NavLink to="/" end><HomeIcon width={18} height={18} />Home</NavLink>
        <NavLink to="/collections/all"><GridIcon width={18} height={18} />Shop</NavLink>
        <NavLink to="/collections/ethnic" className="bottom-nav__pill">Festive Edit</NavLink>
        <NavLink to="/wishlist"><HeartIcon width={18} height={18} />Wishlist</NavLink>
        <button onClick={() => setCartOpen(true)}>
          <span className="bottom-nav__cart"><BagIcon width={18} height={18} />{cartCount > 0 && <i>{cartCount}</i>}</span>
          Cart
        </button>
        <NavLink to={user ? '/account' : '/login'} className="sr-only"><UserIcon />Account</NavLink>
      </nav>
    </>
  );
}
