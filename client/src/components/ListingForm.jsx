/**
 * components/ListingForm.jsx
 * Shared by Create Listing and Edit Listing.
 * Validates on the client; the backend validates again on the server.
 */

import { useState } from 'react';
import ErrorMessage from './ErrorMessage';
import { CATEGORIES, LISTING_TYPES, MODES, LISTING_STATUS } from '../constants';

const EMPTY = {
  title: '',
  description: '',
  category: '',
  type: '',
  mode: '',
  status: 'Active',
};

export default function ListingForm({
  initialValues = EMPTY,
  onSubmit,
  submitLabel = 'Create Listing',
  busyLabel = 'Saving...',
  showStatus = false,
  serverError = '',
}) {
  const [values, setValues] = useState({ ...EMPTY, ...initialValues });
  const [errors, setErrors] = useState([]);
  const [busy, setBusy] = useState(false);

  const change = (e) => setValues({ ...values, [e.target.name]: e.target.value });

  const validate = () => {
    const found = [];
    if (!values.title.trim()) found.push('Title is required');
    else if (values.title.trim().length < 5) found.push('Title must be at least 5 characters');
    if (!values.description.trim()) found.push('Description is required');
    else if (values.description.trim().length < 20)
      found.push('Description must be at least 20 characters');
    if (!values.category) found.push('Please choose a category');
    if (!values.type) found.push('Please choose Offer or Request');
    if (!values.mode) found.push('Please choose a mode');
    return found;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (found.length) return;

    setBusy(true);
    try {
      await onSubmit(values);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <ErrorMessage error={errors.length ? errors : serverError} />

      <div className="field">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          value={values.title}
          onChange={change}
          placeholder="e.g. Learn Python from absolute basics"
          maxLength={100}
        />
        <small className="hint">At least 5 characters.</small>
      </div>

      <div className="field">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          rows={5}
          value={values.description}
          onChange={change}
          placeholder="What exactly will you teach or what do you want to learn? Mention your level and how much time you can give."
          maxLength={1000}
        />
        <small className="hint">{values.description.length}/1000 characters (minimum 20).</small>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="category">Category</label>
          <select id="category" name="category" value={values.category} onChange={change}>
            <option value="">Select a category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="type">Type</label>
          <select id="type" name="type" value={values.type} onChange={change}>
            <option value="">Offer or Request</option>
            {LISTING_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <small className="hint">
            Offer = you can teach it. Request = you want to learn it.
          </small>
        </div>

        <div className="field">
          <label htmlFor="mode">Mode</label>
          <select id="mode" name="mode" value={values.mode} onChange={change}>
            <option value="">How will you meet?</option>
            {MODES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {showStatus && (
        <div className="field">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" value={values.status} onChange={change}>
            {LISTING_STATUS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <small className="hint">Closed listings are hidden from Explore Skills.</small>
        </div>
      )}

      <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
        {busy ? busyLabel : submitLabel}
      </button>
    </form>
  );
}
