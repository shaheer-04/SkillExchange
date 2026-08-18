import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ListingForm from '../components/ListingForm';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { getListing, updateListing } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await getListing(id);
        if (cancelled) return;

        if (!data.user || data.user._id !== user?._id) {
          setLoadError('You can only edit your own listings.');
        } else {
          setListing(data);
        }
      } catch (err) {
        if (!cancelled) setLoadError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, user]);

  const handleSubmit = async (values) => {
    setServerError('');
    try {
      await updateListing(id, {
        title: values.title.trim(),
        description: values.description.trim(),
        category: values.category,
        type: values.type,
        mode: values.mode,
        status: values.status,
      });
      navigate(`/listings/${id}`, { replace: true });
    } catch (err) {
      setServerError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="container page">
        <Loading message="Loading listing..." />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="container page">
        <ErrorMessage error={loadError} />
        <button type="button" className="btn btn-outline" onClick={() => navigate('/my-listings')}>
          Back to My Listings
        </button>
      </div>
    );
  }

  return (
    <div className="container page">
      <div className="card form-card">
        <h1>Edit Listing</h1>
        <p className="muted">Update the details of your skill listing.</p>

        <ListingForm
          initialValues={{
            title: listing.title,
            description: listing.description,
            category: listing.category,
            type: listing.type,
            mode: listing.mode,
            status: listing.status,
          }}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
          busyLabel="Saving..."
          showStatus
          serverError={serverError}
        />
      </div>
    </div>
  );
}
