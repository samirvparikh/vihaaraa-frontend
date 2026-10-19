import { Link, useNavigate } from 'react-router-dom';
import CartLine from '../components/CartLine';
import OrderSummary from '../components/OrderSummary';
import ProductCard from '../components/ProductCard';
import { useStore } from '../context/StoreContext';
import useApi from '../hooks/useApi';

export default function Cart() {
  const { lines, totals, clearCart } = useStore();
  const navigate = useNavigate();
  const { data } = useApi('/collections/best-sellers');
  const inCart = new Set(lines.map((l) => l.id));
  const suggestions = (data?.products || []).filter((p) => !inCart.has(p.id) && p.inStock).slice(0, 4);

  return (
    <div className="container page">
      <nav className="crumbs"><Link to="/">Home</Link> / Cart</nav>
      <h1 className="page__title">Shopping Cart</h1>

      {lines.length === 0 ? (
        <div className="empty">
          <p>Your cart is empty. Discover kundan, temple and American-diamond pieces made to shine.</p>
          <Link to="/collections/all" className="btn btn--dark">Continue Shopping</Link>
        </div>
      ) : (
        <div className="checkout-grid">
          <div>
            {totals.needsOneMoreForFree && (
              <div className="offer-box">
                <strong>Add 1 more piece to get it FREE!</strong> Buy 1 Get 1 applies site-wide on the lower-priced item.
              </div>
            )}
            <div className="cart-list">
              {lines.map((l) => <CartLine key={l.key} line={l} />)}
            </div>
            <div className="row-between">
              <Link to="/collections/all" className="link-underline">← Continue shopping</Link>
              <button className="link-btn" onClick={clearCart}>Clear cart</button>
            </div>
          </div>
          <OrderSummary>
            <button className="btn btn--dark btn--block" onClick={() => navigate('/checkout')}>Proceed to Checkout</button>
          </OrderSummary>
        </div>
      )}

      {suggestions.length > 0 && (
        <section className="section">
          <h2 className="section__title">Complete Your Look</h2>
          <div className="grid">
            {suggestions.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
