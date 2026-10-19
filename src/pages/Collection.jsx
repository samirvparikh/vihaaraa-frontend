import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { CloseIcon, FilterIcon } from '../components/Icons';
import { LoadError, Loading } from '../components/Status';
import useApi from '../hooks/useApi';

const PRICE_BUCKETS = [
  { id: 'u800', label: 'Under ₹800', test: (p) => p.price < 800 },
  { id: '800-1200', label: '₹800 – ₹1,200', test: (p) => p.price >= 800 && p.price <= 1200 },
  { id: '1200-2000', label: '₹1,200 – ₹2,000', test: (p) => p.price > 1200 && p.price <= 2000 },
  { id: 'o2000', label: 'Above ₹2,000', test: (p) => p.price > 2000 },
];

const SORTS = {
  featured: { label: 'Featured', fn: (a, b) => (b.tags.includes('bestseller') ? 1 : 0) - (a.tags.includes('bestseller') ? 1 : 0) },
  'price-asc': { label: 'Price: Low to High', fn: (a, b) => a.price - b.price },
  'price-desc': { label: 'Price: High to Low', fn: (a, b) => b.price - a.price },
  rating: { label: 'Top Rated', fn: (a, b) => b.rating - a.rating },
  discount: { label: 'Biggest Discount', fn: (a, b) => (b.mrp - b.price) / b.mrp - (a.mrp - a.price) / a.mrp },
};

const EMPTY = { category: [], plating: [], baseMetal: [], stone: [], price: [] };

const toggle = (list, v) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
const platingGroup = (p) => p.plating.replace(/ Plated$/, '').replace(/\d+K /, '');

export function ProductListing({ title, blurb, products, crumbs }) {
  const [filters, setFilters] = useState(EMPTY);
  const [sort, setSort] = useState('featured');
  const [panelOpen, setPanelOpen] = useState(false);

  const facets = useMemo(() => {
    const uniq = (arr) => [...new Set(arr)].sort();
    return {
      category: uniq(products.map((p) => p.category).filter(Boolean)).map((v) => ({ v, label: products.find((p) => p.category === v).categoryName })),
      plating: uniq(products.map(platingGroup)).map((v) => ({ v, label: v })),
      baseMetal: uniq(products.map((p) => p.baseMetal)).map((v) => ({ v, label: v })),
      stone: uniq(products.flatMap((p) => p.stones)).map((v) => ({ v, label: v })),
      price: PRICE_BUCKETS.map((b) => ({ v: b.id, label: b.label })),
    };
  }, [products]);

  const visible = useMemo(() => {
    const f = filters;
    return products
      .filter((p) => !f.category.length || f.category.includes(p.category))
      .filter((p) => !f.plating.length || f.plating.includes(platingGroup(p)))
      .filter((p) => !f.baseMetal.length || f.baseMetal.includes(p.baseMetal))
      .filter((p) => !f.stone.length || p.stones.some((s) => f.stone.includes(s)))
      .filter((p) => !f.price.length || PRICE_BUCKETS.some((b) => f.price.includes(b.id) && b.test(p)))
      .sort(SORTS[sort].fn);
  }, [products, filters, sort]);

  const activeCount = Object.values(filters).reduce((s, a) => s + a.length, 0);
  const groups = [
    ['category', 'Category'],
    ['plating', 'Plating'],
    ['baseMetal', 'Base Metal'],
    ['stone', 'Stones'],
    ['price', 'Price'],
  ];

  return (
    <div className="container listing">
      <nav className="crumbs"><Link to="/">Home</Link> / {crumbs || title}</nav>
      <header className="listing__head">
        <h1>{title}</h1>
        {blurb && <p className="muted">{blurb}</p>}
      </header>

      <div className="listing__bar">
        <button className="btn btn--outline btn--sm show-md" onClick={() => setPanelOpen(true)}>
          <FilterIcon width={16} height={16} /> Filters {activeCount > 0 && `(${activeCount})`}
        </button>
        <span className="muted">{visible.length} products</span>
        <label className="sort">
          Sort by
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            {Object.entries(SORTS).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
          </select>
        </label>
      </div>

      <div className="listing__body">
        <aside className={`filters ${panelOpen ? 'is-open' : ''}`}>
          <div className="filters__head">
            <strong>Filters</strong>
            {activeCount > 0 && <button className="link-btn" onClick={() => setFilters(EMPTY)}>Clear all</button>}
            <button className="icon-btn show-md" onClick={() => setPanelOpen(false)} aria-label="Close filters"><CloseIcon /></button>
          </div>
          {groups.map(([key, label]) =>
            facets[key].length > 1 ? (
              <fieldset key={key} className="filters__group">
                <legend>{label}</legend>
                {facets[key].map(({ v, label: l }) => (
                  <label key={v} className="check">
                    <input
                      type="checkbox"
                      checked={filters[key].includes(v)}
                      onChange={() => setFilters((f) => ({ ...f, [key]: toggle(f[key], v) }))}
                    />
                    {l}
                  </label>
                ))}
              </fieldset>
            ) : null
          )}
          <button className="btn btn--dark btn--block show-md" onClick={() => setPanelOpen(false)}>
            Show {visible.length} products
          </button>
        </aside>

        <div className="listing__grid">
          {visible.length === 0 ? (
            <div className="empty">
              <p>No pieces match these filters.</p>
              <button className="btn btn--outline" onClick={() => setFilters(EMPTY)}>Clear filters</button>
            </div>
          ) : (
            <div className="grid grid--3">
              {visible.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Collection() {
  const { handle } = useParams();
  const { data, error } = useApi(`/collections/${encodeURIComponent(handle)}`);
  if (error && !data) return <LoadError error={error} />;
  if (!data) return <Loading />;
  return <ProductListing key={handle} title={data.collection.title} blurb={data.collection.blurb} products={data.products} />;
}
