import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyListings, deleteListing } from '../services/api';
import SkillCard from '../components/SkillCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function MyListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getMyListings();
      setListings(data.listings);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (listing) => {
    // eslint-disable-next-line no-alert
    if (!window.confirm(`Delete "${listing.title}"? This cannot be undone.`)) return;

    setDeletingId(listing._id);
    setError('');
    try {
      await deleteListing(listing._id);
      setListings((prev) => prev.filter((l) => l._id !== listing._id));
      setNotice('Listing deleted.');
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container page">
      <header className="page-head row">
        <div>
          <h1>My Listings</h1>
          <p className="muted">Everything you have posted, including closed listings.</p>
        </div>
        <Link to="/create-listing" className="btn btn-primary">
          Create Listing
        </Link>
      </header>

      {notice && <div className="alert alert-success">{notice}</div>}
      {error && <ErrorMessage error={error} onRetry={load} />}

      {loading ? (
        <Loading message="Loading your listings..." />
      ) : listings.length === 0 ? (
        <div className="empty">
          <h3>You have not created any skill listings yet.</h3>
          <p className="muted">Create your first listing and let other students find you.</p>
          <Link to="/create-listing" className="btn btn-primary">
            Create your first listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-3">
          {listings.map((listing) => (
            <SkillCard
              key={listing._id}
              listing={listing}
              actions={
                <>
                  <Link to={`/edit-listing/${listing._id}`} className="btn btn-sm btn-outline">
                    Edit
                  </Link>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    disabled={deletingId === listing._id}
                    onClick={() => handleDelete(listing)}
                  >
                    {deletingId === listing._id ? 'Deleting...' : 'Delete'}
                  </button>
                </>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
