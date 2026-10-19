import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container page narrow center">
      <h1 className="page__title">Page not found</h1>
      <p className="muted">The piece you’re looking for may have sold out or moved.</p>
      <Link to="/" className="btn btn--dark">Back to Home</Link>
    </div>
  );
}
