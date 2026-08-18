import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getListing, deleteListing, sendSwapRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SwapRequestForm from '../components/SwapRequestForm';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { formatDate } from '../constants';

export default function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [swapError, setSwapError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setListing(await getListing(id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const isOwner = !!(user && listing && listing.user && listing.user._id === user._id);

  const handleSwap = async (payload) => {
    setSwapError('');
    try {
      await sendSwapRequest(payload);
      setShowForm(false);
      setSuccess('Your swap request has been sent. You can follow it under Swap Requests.');
    } catch (err) {
      setSwapError(err.message);
    }
  };

  const handleDelete = async () => {
    // eslint-disable-next-line no-alert
    if (!window.confirm('Delete this listing? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await deleteListing(id);
      navigate('/my-listings', { replace: true });
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container page">
        <Loading message="Loading listing..." />
      </div>
    );
  }

  if (error && !listing) {
    return (
      <div className="container page">
        <ErrorMessage error={error} onRetry={load} />
        <Link to="/explore" className="btn btn-outline">
          Back to Explore Skills
        </Link>
      </div>
    );
  }

  const owner = listing.user || {};

  return (
    <div className="container page">
      <Link to="/explore" className="back-link">
        &larr; Back to Explore Skills
      </Link>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <ErrorMessage error={error} />}

      <div className="details-layout">
        <article className="card">
          <div className="badges">
            <span className={`badge ${listing.type === 'Offer' ? 'badge-offer' : 'badge-request'}`}>
              {listing.type}
            </span>
            <span className="badge badge-muted">{listing.category}</span>
            <span className="badge badge-mode">{listing.mode}</span>
            <span className={`badge ${listing.status === 'Active' ? 'badge-accepted' : 'badge-closed'}`}>
              {listing.status}
            </span>
          </div>

          <h1>{listing.title}</h1>
          <p className="meta-sub">Posted {formatDate(listing.createdAt)}</p>

          <p className="details-desc">{listing.description}</p>

          {isOwner && (
            <div className="form-actions">
              <Link to={`/edit-listing/${listing._id}`} className="btn btn-primary">
                Edit Listing
              </Link>
              <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete Listing'}
              </button>
            </div>
          )}

          {!isOwner && listing.status === 'Active' && (
            <div className="form-actions">
              {isAuthenticated ? (
                !showForm && (
                  <button type="button" className="btn btn-accent" onClick={() => setShowForm(true)}>
                    Request Skill Swap
                  </button>
                )
              ) : (
                <Link to="/login" state={{ from: `/listings/${listing._id}` }} className="btn btn-accent">
                  Login to request a swap
                </Link>
              )}
            </div>
          )}

          {!isOwner && listing.status !== 'Active' && (
            <p className="muted">This listing is closed and is not accepting swap requests.</p>
          )}

          {showForm && (
            <SwapRequestForm
              listing={listing}
              serverError={swapError}
              onSubmit={handleSwap}
              onCancel={() => {
                setShowForm(false);
                setSwapError('');
              }}
            />
          )}
        </article>

        <aside className="card owner-card">
          <h2>About the student</h2>
          <p className="owner-name">{owner.name}</p>
          <p className="meta-sub">{owner.institution}</p>

          {owner.bio && <p className="owner-bio">{owner.bio}</p>}

          <h3>Skills offered</h3>
          {owner.skillsToOffer && owner.skillsToOffer.length ? (
            <div className="chips">
              {owner.skillsToOffer.map((s) => (
                <span className="chip" key={s}>
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <p className="muted">Not listed yet.</p>
          )}

          <h3>Skills wanted</h3>
          {owner.skillsToLearn && owner.skillsToLearn.length ? (
            <div className="chips">
              {owner.skillsToLearn.map((s) => (
                <span className="chip" key={s}>
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <p className="muted">Not listed yet.</p>
          )}

          <h3>Contact</h3>
          {isOwner ? (
            <p className="muted">
              This is your own listing. Your contact details are only shown to a student after
              you accept their swap request.
            </p>
          ) : (
            <p className="muted">Contact details are shared once a swap request is accepted.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
