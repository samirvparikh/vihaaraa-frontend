import { useSearchParams } from 'react-router-dom';
import { Loading } from '../components/Status';
import useApi from '../hooks/useApi';
import { ProductListing } from './Collection';

export default function Search() {
  const [params] = useSearchParams();
  const q = (params.get('q') || '').trim();
  const { data, error } = useApi(q ? `/products?q=${encodeURIComponent(q)}` : null);
  if (q && !data && !error) return <Loading />;
  const results = data?.products || [];
  return (
    <ProductListing
      key={q}
      title={`Search: “${q}”`}
      crumbs="Search"
      blurb={error ? error.message : results.length ? null : 'Try “kundan”, “jhumka”, “American diamond” or “rose gold”.'}
      products={results}
    />
  );
}
