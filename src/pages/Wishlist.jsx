import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Loading } from '../components/Status';
import { useStore } from '../context/StoreContext';
import useApi from '../hooks/useApi';

export default function Wishlist() {
  const { wishlist } = useStore();
  const ids = [...wishlist].sort((a, b) => a - b).join(',');
  const { data, loading } = useApi(ids ? `/products?ids=${ids}` : null);
  // Keep the order the pieces were saved in, and drop any that were just un-hearted.
  const byId = new Map((data?.products || []).map((p) => [p.id, p]));
  const items = wishlist.map((id) => byId.get(id)).filter(Boolean);

  return (
    <div className="container page">
      <nav className="crumbs"><Link to="/">Home</Link> / Wishlist</nav>
      <h1 className="page__title">My Wishlist</h1>
      {wishlist.length === 0 ? (
        <div className="empty">
          <p>Tap the heart on any piece to save it here.</p>
          <Link to="/collections/new-launches" className="btn btn--dark">Browse New Launches</Link>
        </div>
      ) : loading && !items.length ? (
        <Loading />
      ) : (
        <div className="grid">{items.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      )}
    </div>
  );
}
