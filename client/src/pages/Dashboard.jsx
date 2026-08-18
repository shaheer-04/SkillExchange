import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyListings, getSwapRequests } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { formatDate } from '../constants';

export default function Dashboard() {
  const { user } = useAuth();

  const [listings, setListings] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [listingData, swapData] = await Promise.all([getMyListings(), getSwapRequests()]);
      setListings(listingData.listings);
      setIncoming(swapData.incoming);
      setOutgoing(swapData.outgoing);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="container page">
        <Loading message="Loading your dashboard..." />
      </div>
    );
  }

  const activeCount = listings.filter((l) => l.status === 'Active').length;
  const acceptedCount = [...incoming, ...outgoing].filter((r) => r.status === 'Accepted').length;
  const pendingIncoming = incoming.filter((r) => r.status === 'Pending').length;

  const stats = [
    { label: 'My Listings', value: listings.length, to: '/my-listings' },
    { label: 'Active Listings', value: activeCount, to: '/my-listings' },
    { label: 'Incoming Requests', value: incoming.length, to: '/swaps' },
    { label: 'Outgoing Requests', value: outgoing.length, to: '/swaps' },
    { label: 'Accepted Swaps', value: acceptedCount, to: '/swaps' },
  ];

  const recentSwaps = [...incoming, ...outgoing]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  return (
    <div className="container page">
      <header className="page-head">
        <h1>Welcome, {user?.name}</h1>
        <p className="muted">
          {pendingIncoming > 0
            ? `You have ${pendingIncoming} pending request${pendingIncoming === 1 ? '' : 's'} waiting for your answer.`
            : 'Here is a summary of your skill exchange activity.'}
        </p>
      </header>

      {error && <ErrorMessage error={error} onRetry={load} />}

      <div className="grid grid-5 stats">
        {stats.map((s) => (
          <Link to={s.to} className="card stat-card" key={s.label}>
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </Link>
        ))}
      </div>

      <section>
        <h2 className="section-title">Quick actions</h2>
        <div className="quick-actions">
          <Link to="/explore" className="btn btn-primary">
            Explore Skills
          </Link>
          <Link to="/create-listing" className="btn btn-accent">
            Create Listing
          </Link>
          <Link to="/my-listings" className="btn btn-outline">
            My Listings
          </Link>
          <Link to="/swaps" className="btn btn-outline">
            Swap Requests
          </Link>
          <Link to="/profile" className="btn btn-outline">
            Edit Profile
          </Link>
        </div>
      </section>

      <div className="dash-columns">
        <section className="card">
          <h2>Recent Listings</h2>
          {listings.length === 0 ? (
            <div className="empty small">
              <p>You have not created any listings yet.</p>
              <Link to="/create-listing" className="btn btn-sm btn-primary">
                Create your first listing
              </Link>
            </div>
          ) : (
            <ul className="mini-list">
              {listings.slice(0, 4).map((l) => (
                <li key={l._id}>
                  <Link to={`/listings/${l._id}`}>{l.title}</Link>
                  <span className="mini-meta">
                    <span className={`badge ${l.type === 'Offer' ? 'badge-offer' : 'badge-request'}`}>
                      {l.type}
                    </span>
                    <span className="meta-date">{formatDate(l.createdAt)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <h2>Recent Swap Requests</h2>
          {recentSwaps.length === 0 ? (
            <div className="empty small">
              <p>No swap requests yet.</p>
              <Link to="/explore" className="btn btn-sm btn-primary">
                Find a skill to learn
              </Link>
            </div>
          ) : (
            <ul className="mini-list">
              {recentSwaps.map((r) => {
                const isIncoming = incoming.some((i) => i._id === r._id);
                const other = isIncoming ? r.sender : r.receiver;
                return (
                  <li key={r._id}>
                    <Link to="/swaps">
                      {isIncoming ? 'From' : 'To'} {other?.name || 'a student'}
                    </Link>
                    <span className="mini-meta">
                      <span
                        className={`badge ${
                          r.status === 'Pending'
                            ? 'badge-pending'
                            : r.status === 'Accepted'
                            ? 'badge-accepted'
                            : 'badge-rejected'
                        }`}
                      >
                        {r.status}
                      </span>
                      <span className="meta-date">{formatDate(r.createdAt)}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
