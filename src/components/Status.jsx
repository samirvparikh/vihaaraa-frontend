import NotFound from '../pages/NotFound';

export function Loading({ label = 'Loading…' }) {
  return (
    <div className="loading" role="status">
      <span className="loading__dot" />
      {label}
    </div>
  );
}

/** Shows a 404 for missing records and a retry prompt for anything else. */
export function LoadError({ error }) {
  if (error?.status === 404) return <NotFound />;
  return (
    <div className="container page narrow">
      <div className="empty">
        <p>{error?.message || 'Something went wrong.'}</p>
        <button className="btn btn--dark" onClick={() => window.location.reload()}>Try again</button>
      </div>
    </div>
  );
}
