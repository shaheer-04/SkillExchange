import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container page">
      <div className="card center-card">
        <p className="big-code">404</p>
        <h1>Page not found</h1>
        <p className="muted">
          The page you are looking for does not exist. It may have been moved or deleted.
        </p>
        <div className="hero-actions">
          <Link to="/" className="btn btn-primary">
            Go home
          </Link>
          <Link to="/explore" className="btn btn-outline">
            Explore skills
          </Link>
        </div>
      </div>
    </div>
  );
}
