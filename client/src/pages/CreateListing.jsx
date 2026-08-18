import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ListingForm from '../components/ListingForm';
import { createListing } from '../services/api';

export default function CreateListing() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const handleSubmit = async (values) => {
    setServerError('');
    try {
      const created = await createListing({
        title: values.title.trim(),
        description: values.description.trim(),
        category: values.category,
        type: values.type,
        mode: values.mode,
      });
      navigate(`/listings/${created._id}`, {
        replace: true,
        state: { created: true },
      });
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <div className="container page">
      <div className="card form-card">
        <h1>Create a Skill Listing</h1>
        <p className="muted">
          Offer something you can teach, or request something you want to learn. Be specific so
          other students know what to expect.
        </p>

        <ListingForm
          onSubmit={handleSubmit}
          submitLabel="Create Listing"
          busyLabel="Creating..."
          serverError={serverError}
        />
      </div>
    </div>
  );
}
