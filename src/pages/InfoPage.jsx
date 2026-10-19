import { Link, useParams } from 'react-router-dom';
import { LoadError, Loading } from '../components/Status';
import useApi from '../hooks/useApi';

export default function InfoPage() {
  const { page } = useParams();
  const { data, error } = useApi(`/pages/${encodeURIComponent(page)}`);
  if (error && !data) return <LoadError error={error} />;
  if (!data) return <Loading />;
  return (
    <div className="container page narrow">
      <nav className="crumbs"><Link to="/">Home</Link> / {data.title}</nav>
      <h1 className="page__title">{data.title}</h1>
      <div className="prose">
        {data.body.map((p, i) => <p key={i}>{p}</p>)}
      </div>
    </div>
  );
}
