import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { useStore } from '../context/StoreContext';
import { discountPct, formatINR } from '../utils/pricing';
import ProductArt from './ProductArt';
import { HeartIcon, StarIcon } from './Icons';

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const { settings } = useSite();
  const wished = isWishlisted(product.id);

  return (
    <article className="card">
      <Link to={`/product/${product.slug}`} className="card__media">
        <ProductArt product={product} />
        {!product.inStock ? <span className="badge badge--soldout">SOLD OUT</span> : settings.b1g1Enabled && <span className="badge">B1G1 FREE</span>}
        {product.tags.includes('new') && <span className="badge badge--new">NEW</span>}
        {product.rating > 0 && <span className="card__rating"><StarIcon /> {product.rating.toFixed(1)}</span>}
      </Link>
      <button
        className={`card__wish ${wished ? 'is-active' : ''}`}
        onClick={() => toggleWishlist(product.id)}
        aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <HeartIcon filled={wished} width={18} height={18} />
      </button>
      <div className="card__body">
        <Link to={`/product/${product.slug}`} className="card__title">{product.name}</Link>
        <p className="card__meta">{product.plating}{product.stones[0] ? ` · ${product.stones[0]}` : ''}</p>
        <div className="price">
          <span className="price__now">{formatINR(product.price)}</span>
          {product.mrp > product.price && (
            <>
              <s className="price__mrp">{formatINR(product.mrp)}</s>
              <span className="price__off">{discountPct(product)}% off</span>
            </>
          )}
        </div>
      </div>
      {!product.inStock ? (
        <button className="btn btn--dark btn--block btn--sm" disabled>Sold Out</button>
      ) : product.sizes ? (
        <Link to={`/product/${product.slug}`} className="btn btn--dark btn--block btn--sm">Choose Size</Link>
      ) : (
        <button className="btn btn--dark btn--block btn--sm" onClick={() => addToCart(product)}>Add To Cart</button>
      )}
    </article>
  );
}
