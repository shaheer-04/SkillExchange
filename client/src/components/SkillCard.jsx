/**
 * components/SkillCard.jsx
 * One skill listing shown on Explore Skills / My Listings.
 */

import { Link } from 'react-router-dom';
import { formatDate } from '../constants';

export default function SkillCard({ listing, actions = null }) {
  const owner = listing.user || {};

  return (
    <article className="card skill-card">
      <div className="badges">
        <span className={`badge ${listing.type === 'Offer' ? 'badge-offer' : 'badge-request'}`}>
          {listing.type}
        </span>
        <span className="badge badge-muted">{listing.category}</span>
        <span className="badge badge-mode">{listing.mode}</span>
        {listing.status === 'Closed' && <span className="badge badge-closed">Closed</span>}
      </div>

      <h3 className="skill-title">
        <Link to={`/listings/${listing._id}`}>{listing.title}</Link>
      </h3>

      <p className="skill-desc">{listing.description}</p>

      <div className="skill-meta">
        <div>
          <span className="meta-name">{owner.name || 'Unknown student'}</span>
          <span className="meta-sub">{owner.institution || ''}</span>
        </div>
        <span className="meta-date">{formatDate(listing.createdAt)}</span>
      </div>

      <div className="skill-actions">
        <Link to={`/listings/${listing._id}`} className="btn btn-sm btn-primary">
          View Details
        </Link>
        {actions}
      </div>
    </article>
  );
}
