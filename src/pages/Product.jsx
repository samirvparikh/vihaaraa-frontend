import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ProductArt from '../components/ProductArt';
import ProductCard from '../components/ProductCard';
import QtyStepper from '../components/QtyStepper';
import { HeartIcon, ReturnIcon, ShieldIcon, StarIcon, TruckIcon } from '../components/Icons';
import { LoadError, Loading } from '../components/Status';
import { useSite } from '../context/SiteContext';
import { useStore } from '../context/StoreContext';
import useApi from '../hooks/useApi';
import { discountPct, formatINR } from '../utils/pricing';

function Accordion({ title, children, defaultOpen }) {
  return (
    <details className="accordion" open={defaultOpen}>
      <summary>{title}</summary>
      <div className="accordion__body">{children}</div>
    </details>
  );
}

function PincodeCheck({ codLimit }) {
  const [pin, setPin] = useState('');
  const [msg, setMsg] = useState('');
  const check = (e) => {
    e.preventDefault();
    if (!/^[1-9]\d{5}$/.test(pin)) return setMsg('Please enter a valid 6-digit pincode.');
    const d = new Date();
    d.setDate(d.getDate() + (pin.startsWith('4') || pin.startsWith('5') ? 3 : 5));
    setMsg(`Delivery by ${d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} · COD available up to ${formatINR(codLimit)}`);
  };
  return (
    <form className="pincode" onSubmit={check}>
      <input inputMode="numeric" maxLength={6} placeholder="Enter pincode" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} aria-label="Pincode" />
      <button className="link-btn">Check</button>
      {msg && <p className="small muted">{msg}</p>}
    </form>
  );
}

export default function Product() {
  const { slug } = useParams();
  // Not cached: price and stock should be fresh whenever the page opens.
  const { data, error } = useApi(`/products/${encodeURIComponent(slug)}`, { cacheable: false });
  if (error && !data) return <LoadError error={error} />;
  if (!data || data.product.slug !== slug) return <Loading />;
  return <ProductView key={data.product.id} product={data.product} related={data.related} />;
}

function ProductView({ product, related }) {
  const { addToCart, toggleWishlist, isWishlisted, maxQtyFor } = useStore();
  const { settings, collectionTitle } = useSite();
  const navigate = useNavigate();
  const [view, setView] = useState(0);
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState(null);
  const [sizeError, setSizeError] = useState(false);
  const wished = isWishlisted(product.id);
  const mainCollection = product.collections.find((c) => collectionTitle(c));
  // With photos, one thumbnail per photo; otherwise three illustration angles.
  const views = product.gallery ? product.gallery.map((_, i) => i) : [0, 1, 2];
  const soldOut = !product.inStock;

  const add = async (buyNow) => {
    if (product.sizes && !size) {
      setSizeError(true);
      return;
    }
    const ok = await addToCart(product, qty, { size, openDrawer: !buyNow });
    if (ok && buyNow) navigate('/checkout');
  };

  const specs = [
    ['Base Metal', product.baseMetal],
    ['Plating', product.plating],
    ['Stones', product.stones.length ? product.stones.join(', ') : 'None'],
    ['Category', product.categoryName],
    ['In the box', product.includes],
    ['Approx. weight', product.weight],
    ['SKU', product.sku],
  ].filter(([, v]) => v);

  return (
    <div className="container pdp">
      <nav className="crumbs">
        <Link to="/">Home</Link> / {product.category && <><Link to={`/collections/${product.category}`}>{product.categoryName}</Link> / </>}{product.name}
      </nav>

      <div className="pdp__grid">
        <div className="gallery">
          <div className="gallery__main">
            <ProductArt product={product} variant={view} />
            {soldOut ? <span className="badge badge--soldout">SOLD OUT</span> : settings.b1g1Enabled && <span className="badge">B1G1 FREE</span>}
          </div>
          {views.length > 1 && (
            <div className="gallery__thumbs">
              {views.map((v) => (
                <button key={v} className={v === view ? 'is-active' : ''} onClick={() => setView(v)} aria-label={`View ${v + 1}`}>
                  <ProductArt product={product} variant={v} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pdp__info">
          {mainCollection && <Link to={`/collections/${mainCollection}`} className="eyebrow">{collectionTitle(mainCollection)}</Link>}
          <h1>{product.name}</h1>
          {product.rating > 0 && (
            <div className="pdp__rating">
              <span className="pill"><StarIcon /> {product.rating.toFixed(1)}</span>
              <span className="muted small">{product.reviews} reviews</span>
            </div>
          )}
          <div className="price price--lg">
            <span className="price__now">{formatINR(product.price)}</span>
            {product.mrp > product.price && (
              <>
                <s className="price__mrp">MRP {formatINR(product.mrp)}</s>
                <span className="price__off">{discountPct(product)}% off</span>
              </>
            )}
          </div>
          <p className="muted small">Inclusive of all taxes</p>
          {soldOut ? (
            <p className="error"><strong>Sold out</strong> — save it to your wishlist and check back soon.</p>
          ) : product.stock <= 5 ? (
            <p className="error small">Hurry, only {product.stock} left in stock.</p>
          ) : null}
          {settings.b1g1Enabled && (
            <div className="offer-box">
              <strong>Buy 1 Get 1 Free</strong> — add any 2 pieces; the lower-priced one is free.
            </div>
          )}

          {product.sizes && (
            <div className="sizes">
              <p className="label">Size {sizeError && <span className="error">— please select a size</span>}</p>
              <div className="sizes__list">
                {product.sizes.map((s) => (
                  <button key={s} className={size === s ? 'is-active' : ''} onClick={() => { setSize(s); setSizeError(false); }}>{s}</button>
                ))}
              </div>
            </div>
          )}

          <div className="pdp__actions">
            <QtyStepper value={qty} onChange={setQty} min={1} max={maxQtyFor(product)} />
            <button className="btn btn--dark btn--grow" onClick={() => add(false)} disabled={soldOut}>{soldOut ? 'Sold Out' : 'Add To Cart'}</button>
            <button className={`icon-btn icon-btn--box ${wished ? 'is-active' : ''}`} onClick={() => toggleWishlist(product.id)} aria-label="Wishlist">
              <HeartIcon filled={wished} />
            </button>
          </div>
          <button className="btn btn--outline btn--block" onClick={() => add(true)} disabled={soldOut}>Buy It Now</button>

          <PincodeCheck codLimit={settings.codLimit} />

          <ul className="assurances">
            <li><TruckIcon /> Free shipping above {formatINR(settings.freeShippingMin)}</li>
            <li><ReturnIcon /> 7-day easy returns</li>
            <li><ShieldIcon /> Nickel & lead free</li>
          </ul>

          {product.description && (
            <Accordion title="Description" defaultOpen>
              <p>{product.description}</p>
            </Accordion>
          )}
          <Accordion title="Material & Specifications" defaultOpen>
            <table className="specs">
              <tbody>
                {specs.map(([k, v]) => <tr key={k}><th>{k}</th><td>{v}</td></tr>)}
              </tbody>
            </table>
          </Accordion>
          <Accordion title="Care Instructions">
            <ul className="bullets">
              <li>Keep away from water, perfume, sanitiser and sweat to protect the plating.</li>
              <li>Wipe with a soft dry cloth after wearing.</li>
              <li>Store in the Vihaaraa zip pouch, separately from other pieces.</li>
            </ul>
          </Accordion>
          <Accordion title="Shipping & Returns">
            <p>Dispatched in 24–48 hours. Free shipping above {formatINR(settings.freeShippingMin)}. Returns or exchange within 7 days of delivery.</p>
          </Accordion>
        </div>
      </div>

      {related.length > 0 && (
        <section className="section">
          <h2 className="section__title">You May Also Like</h2>
          <div className="grid">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
