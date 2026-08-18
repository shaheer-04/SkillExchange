/**
 * components/SwapRequestForm.jsx
 * Shown on the listing details page when a logged-in student wants to
 * propose a skill swap.
 */

import { useState } from 'react';
import ErrorMessage from './ErrorMessage';
import { MODES } from '../constants';

export default function SwapRequestForm({ listing, onSubmit, onCancel, serverError = '' }) {
  const [values, setValues] = useState({
    message: '',
    preferredTime: '',
    meetingMode: listing.mode === 'Both' ? '' : listing.mode,
    location: '',
  });
  const [errors, setErrors] = useState([]);
  const [busy, setBusy] = useState(false);

  const change = (e) => setValues({ ...values, [e.target.name]: e.target.value });

  const validate = () => {
    const found = [];
    if (!values.message.trim()) found.push('Message is required');
    else if (values.message.trim().length < 10)
      found.push('Message must be at least 10 characters');
    if (!values.preferredTime.trim()) found.push('Preferred time is required');
    if (!values.meetingMode) found.push('Please choose a meeting mode');
    if (values.meetingMode === 'In-Person' && !values.location.trim())
      found.push('Location is required for an in-person meeting');
    return found;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (found.length) return;

    setBusy(true);
    try {
      await onSubmit({ ...values, listing: listing._id });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="form swap-form" onSubmit={handleSubmit} noValidate>
      <h3>Request a skill swap</h3>
      <p className="muted">
        Tell {listing.user?.name?.split(' ')[0] || 'the student'} what you can offer in return.
      </p>

      <ErrorMessage error={errors.length ? errors : serverError} />

      <div className="field">
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          rows={4}
          value={values.message}
          onChange={change}
          maxLength={500}
          placeholder="Hi, I would like to learn Python from you. I can help you practise conversational English in exchange."
        />
        <small className="hint">{values.message.length}/500 characters (minimum 10).</small>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="preferredTime">Preferred Time</label>
          <input
            id="preferredTime"
            name="preferredTime"
            type="text"
            value={values.preferredTime}
            onChange={change}
            placeholder="Saturday 5 PM"
            maxLength={100}
          />
        </div>

        <div className="field">
          <label htmlFor="meetingMode">Meeting Mode</label>
          <select id="meetingMode" name="meetingMode" value={values.meetingMode} onChange={change}>
            <option value="">Select</option>
            {MODES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="location">
          Location {values.meetingMode === 'In-Person' ? '' : '(optional)'}
        </label>
        <input
          id="location"
          name="location"
          type="text"
          value={values.location}
          onChange={change}
          placeholder="UET Peshawar Library"
          maxLength={120}
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? 'Sending request...' : 'Send Swap Request'}
        </button>
        <button type="button" className="btn btn-outline" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
      </div>
    </form>
  );
}
