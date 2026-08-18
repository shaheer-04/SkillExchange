/**
 * components/SwapRequestCard.jsx
 * One swap request. Accept / Reject buttons only appear for incoming
 * requests that are still pending.
 */

import { Link } from 'react-router-dom';
import { formatDate } from '../constants';

const statusClass = {
  Pending: 'badge-pending',
  Accepted: 'badge-accepted',
  Rejected: 'badge-rejected',
};

export default function SwapRequestCard({ request, direction, onRespond, busyId }) {
  const other = direction === 'incoming' ? request.sender : request.receiver;
  const label = direction === 'incoming' ? 'From' : 'To';
  const busy = busyId === request._id;

  return (
    <article className="card swap-card">
      <div className="swap-head">
        <div>
          <span className="meta-sub">{label}</span>
          <h3 className="swap-person">{other?.name || 'Unknown student'}</h3>
          <span className="meta-sub">{other?.institution}</span>
        </div>
        <span className={`badge ${statusClass[request.status]}`}>{request.status}</span>
      </div>

      <p className="swap-listing">
        Listing:{' '}
        {request.listing ? (
          <Link to={`/listings/${request.listing._id}`}>{request.listing.title}</Link>
        ) : (
          <span className="muted">This listing was removed</span>
        )}
      </p>

      <p className="swap-message">&ldquo;{request.message}&rdquo;</p>

      <dl className="swap-details">
        <div>
          <dt>Preferred time</dt>
          <dd>{request.preferredTime}</dd>
        </div>
        <div>
          <dt>Meeting mode</dt>
          <dd>{request.meetingMode}</dd>
        </div>
        <div>
          <dt>Location</dt>
          <dd>{request.location || '—'}</dd>
        </div>
        <div>
          <dt>Sent</dt>
          <dd>{formatDate(request.createdAt)}</dd>
        </div>
      </dl>

      {request.status === 'Accepted' && other?.contactInfo && (
        <p className="contact-note">
          Swap accepted. Contact: <strong>{other.contactInfo}</strong>
        </p>
      )}

      {direction === 'incoming' && request.status === 'Pending' && (
        <div className="swap-actions">
          <button
            type="button"
            className="btn btn-sm btn-primary"
            disabled={busy}
            onClick={() => onRespond(request._id, 'Accepted')}
          >
            {busy ? 'Saving...' : 'Accept'}
          </button>
          <button
            type="button"
            className="btn btn-sm btn-danger"
            disabled={busy}
            onClick={() => onRespond(request._id, 'Rejected')}
          >
            {busy ? 'Saving...' : 'Reject'}
          </button>
        </div>
      )}
    </article>
  );
}
