import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSwapRequests, updateSwapRequest } from '../services/api';
import SwapRequestCard from '../components/SwapRequestCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function SwapRequests() {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getSwapRequests();
      setIncoming(data.incoming);
      setOutgoing(data.outgoing);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const respond = async (id, status) => {
    setBusyId(id);
    setError('');
    setNotice('');
    try {
      const updated = await updateSwapRequest(id, status);
      setIncoming((prev) => prev.map((r) => (r._id === id ? updated : r)));
      setNotice(`Request ${status.toLowerCase()}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="container page">
        <Loading message="Loading swap requests..." />
      </div>
    );
  }

  return (
    <div className="container page">
      <header className="page-head">
        <h1>Swap Requests</h1>
        <p className="muted">Requests other students sent you, and the ones you sent them.</p>
      </header>

      {notice && <div className="alert alert-success">{notice}</div>}
      {error && <ErrorMessage error={error} onRetry={load} />}

      <section className="swap-section">
        <h2 className="section-title">
          Incoming Requests <span className="count-pill">{incoming.length}</span>
        </h2>

        {incoming.length === 0 ? (
          <div className="empty">
            <h3>You have no incoming requests.</h3>
            <p className="muted">
              When another student asks to swap skills with you, it will appear here.
            </p>
            <Link to="/create-listing" className="btn btn-outline">
              Create a listing
            </Link>
          </div>
        ) : (
          <div className="grid grid-2">
            {incoming.map((r) => (
              <SwapRequestCard
                key={r._id}
                request={r}
                direction="incoming"
                onRespond={respond}
                busyId={busyId}
              />
            ))}
          </div>
        )}
      </section>

      <section className="swap-section">
        <h2 className="section-title">
          Outgoing Requests <span className="count-pill">{outgoing.length}</span>
        </h2>

        {outgoing.length === 0 ? (
          <div className="empty">
            <h3>No swap requests yet.</h3>
            <p className="muted">Find a skill you want to learn and send your first request.</p>
            <Link to="/explore" className="btn btn-outline">
              Explore skills
            </Link>
          </div>
        ) : (
          <div className="grid grid-2">
            {outgoing.map((r) => (
              <SwapRequestCard key={r._id} request={r} direction="outgoing" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
