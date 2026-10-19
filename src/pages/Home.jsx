import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductArt, { BACKDROPS } from '../components/ProductArt';
import ProductCard from '../components/ProductCard';
import { ChevronLeft, ChevronRight } from '../components/Icons';
import { Loading } from '../components/Status';
import useApi from '../hooks/useApi';
import { formatINR } from '../utils/pricing';

// Every block on this page is managed from the admin panel (Image Slider and Home Sections).

/** Uploaded photo if there is one, otherwise the product illustration. */
function Visual({ image, product, alt, ...artProps }) {
  if (image) return <img src={image} alt={alt || ''} className="product-art product-art--photo" loading="lazy" />;
  if (product) return <ProductArt product={product} {...artProps} />;
  return <span className="product-art product-art--blank" />;
}

function Hero({ slides }) {
  const [i, setI] = useState(0);
  const n = slides.length;
  useEffect(() => {
    if (n < 2) return undefined;
    const t = setInterval(() => setI((x) => (x + 1) % n), 6000);
    return () => clearInterval(t);
  }, [n, i]);
  if (!n) return null;

  return (
    <section className="hero" aria-roledescription="carousel">
      {slides.map((s, idx) => {
        const [c1, c2] = BACKDROPS[s.theme] || BACKDROPS.maroon;
        return (
          <div
            key={s.id}
            className={`hero__slide hero__slide--${s.theme} ${s.image ? 'hero__slide--photo' : ''} ${idx === i ? 'is-active' : ''}`}
            style={{ background: `linear-gradient(120deg, ${c1}, ${c2})` }}
            aria-hidden={idx !== i}
          >
            {s.image ? (
              <picture className="hero__photo">
                {s.mobileImage && <source media="(max-width: 700px)" srcSet={s.mobileImage} />}
                <img src={s.image} alt={s.title} />
              </picture>
            ) : (
              s.product && <div className="hero__art"><ProductArt product={s.product} bg={s.theme} fit="contain" bare /></div>
            )}
            <div className="hero__copy">
              {s.eyebrow && <span className="hero__eyebrow">{s.eyebrow}</span>}
              <h1 className="hero__title">{s.title}</h1>
              {s.sub && <p>{s.sub}</p>}
              <Link to={s.to} className="btn btn--ghost" tabIndex={idx === i ? 0 : -1}>{s.cta}</Link>
            </div>
          </div>
        );
      })}
      {n > 1 && (
        <>
          <button className="hero__nav hero__nav--prev" onClick={() => setI((i - 1 + n) % n)} aria-label="Previous slide"><ChevronLeft /></button>
          <button className="hero__nav hero__nav--next" onClick={() => setI((i + 1) % n)} aria-label="Next slide"><ChevronRight /></button>
          <div className="hero__dots">
            {slides.map((s, idx) => (
              <button key={s.id} className={idx === i ? 'is-active' : ''} onClick={() => setI(idx)} aria-label={`Go to slide ${idx + 1}`} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function CategoryCircles({ items }) {
  if (!items.length) return null;
  return (
    <section className="circles container">
      {items.map((c) => (
        <Link key={c.id} to={c.to} className="circle">
          <span className="circle__img"><Visual image={c.image} product={c.product} alt={c.label} bg="blush" /></span>
          <span className="circle__label">{c.label}</span>
        </Link>
      ))}
    </section>
  );
}

function Handpicked({ title, items }) {
  if (!items.length) return null;
  return (
    <section className="section container">
      <h2 className="section__title">{title}</h2>
      <div className="tiles">
        {items.map((t) => {
          const dark = t.bg !== 'beige';
          return (
            <Link key={t.id} to={t.to} className="tile">
              <div className={`tile__media ${dark ? 'is-dark' : ''}`}>
                <Visual image={t.image} product={t.product} alt={t.label} bg={t.bg} variant={1} />
                {(t.line1 || t.line2) && (
                  <div className="tile__copy">
                    <span className={t.italicFirst ? 'script' : ''}>{t.line1}</span>
                    <span className={t.italicFirst ? '' : 'script'}>{t.line2}</span>
                  </div>
                )}
              </div>
              <span className="tile__label">{t.label}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function BestSellers({ title, products }) {
  if (!products.length) return null;
  return (
    <section className="section container">
      <h2 className="section__title">{title}</h2>
      <div className="grid">
        {products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
      <div className="center"><Link to="/collections/best-sellers" className="btn btn--dark">View All</Link></div>
    </section>
  );
}

function MaterialGuide() {
  const cols = [
    { title: 'Base Metals', items: ['Brass', 'Copper', 'Alloy', '925 Sterling Silver'], text: 'A sturdy, lightweight core that holds its shape and takes plating beautifully.' },
    { title: 'Platings', items: ['18K / 22K / 24K Gold', 'Rhodium', 'Silver', 'Rose Gold', 'Oxidised'], text: 'Micron finishes that give the look of precious metal — nickel and lead free.' },
    { title: 'Simulated Stones', items: ['American Diamond', 'Cubic Zirconia', 'Kundan & Polki', 'Faux Pearl', 'Glass'], text: 'Hand-set stones with fine-jewellery sparkle at a fraction of the price.' },
  ];
  return (
    <section className="guide">
      <div className="container">
        <h2 className="section__title">What Your Jewellery Is Made Of</h2>
        <div className="guide__grid">
          {cols.map((c) => (
            <div key={c.title} className="guide__col">
              <h3>{c.title}</h3>
              <p className="muted">{c.text}</p>
              <ul>{c.items.map((i) => <li key={i}>{i}</li>)}</ul>
            </div>
          ))}
        </div>
        <div className="center"><Link to="/pages/care" className="link-underline">Read the jewellery care guide →</Link></div>
      </div>
    </section>
  );
}

function ShopTheLook({ title, items }) {
  if (!items.length) return null;
  return (
    <section className="section container">
      <h2 className="section__title">{title}</h2>
      <div className="looks">
        {items.map(({ id, image, product: p }) => (
          <Link key={id} to={`/product/${p.slug}`} className="look">
            <div className="look__media"><Visual image={image} product={p} alt={p.name} variant={2} /></div>
            <div className="look__info">
              <span className="look__thumb"><ProductArt product={p} /></span>
              <p>{p.name}</p>
              <strong>{formatINR(p.price)}</strong>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const { data, error } = useApi('/home');
  if (!data) {
    return error ? (
      <div className="container page"><div className="empty"><p>{error.message}</p></div></div>
    ) : (
      <Loading />
    );
  }

  return (
    <>
      <Hero slides={data.slides} />
      <CategoryCircles items={data.circles} />
      <Handpicked title={data.handpicked.title} items={data.handpicked.items} />
      <BestSellers title={data.bestsellers.title} products={data.bestsellers.products} />
      <MaterialGuide />
      <ShopTheLook title={data.look.title} items={data.look.items} />
    </>
  );
}
