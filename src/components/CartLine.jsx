import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { formatINR } from '../utils/pricing';
import ProductArt from './ProductArt';
import QtyStepper from './QtyStepper';
import { TrashIcon } from './Icons';

export default function CartLine({ line, onNavigate, compact }) {
  const { updateQty, removeFromCart, maxQtyFor } = useStore();
  const { product, qty, size, key } = line;
  return (
    <div className={`cart-line ${compact ? 'cart-line--compact' : ''}`}>
      <Link to={`/product/${product.slug}`} className="cart-line__img" onClick={onNavigate}>
        <ProductArt product={product} />
      </Link>
      <div className="cart-line__info">
        <Link to={`/product/${product.slug}`} onClick={onNavigate} className="cart-line__name">{product.name}</Link>
        <p className="muted small">
          {product.plating} · {product.baseMetal}
          {size && <> · Size {size}</>}
        </p>
        <div className="cart-line__row">
          <QtyStepper value={qty} max={maxQtyFor(product)} onChange={(q) => updateQty(key, q)} />
          <button className="link-btn" onClick={() => removeFromCart(key)} aria-label={`Remove ${product.name}`}>
            <TrashIcon />
          </button>
        </div>
        {product.stock > 0 && product.stock <= 5 && <p className="small error">Only {product.stock} left</p>}
      </div>
      <div className="cart-line__price">
        <span>{formatINR(product.price * qty)}</span>
        <s className="muted small">{formatINR(product.mrp * qty)}</s>
      </div>
    </div>
  );
}
