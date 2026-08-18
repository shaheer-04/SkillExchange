import { useEffect, useState } from 'react';
import { getProfile, updateProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { INSTITUTIONS, formatDate } from '../constants';

export default function Profile() {
  const { updateUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [values, setValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [errors, setErrors] = useState([]);
  const [serverError, setServerError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await getProfile();
        if (cancelled) return;
        setProfile(data);
        setValues({
          name: data.name,
          institution: data.institution,
          contactInfo: data.contactInfo,
          bio: data.bio || '',
          skillsToOffer: (data.skillsToOffer || []).join(', '),
          skillsToLearn: (data.skillsToLearn || []).join(', '),
        });
      } catch (err) {
        if (!cancelled) setLoadError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const change = (e) => setValues({ ...values, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setNotice('');

    const found = [];
    if (!values.name.trim()) found.push('Name is required');
    else if (values.name.trim().length < 3) found.push('Name must be at least 3 characters');
    if (!values.institution) found.push('Please choose your institution');
    if (!values.contactInfo.trim()) found.push('Contact information is required');
    if (values.bio.length > 250) found.push('Bio cannot exceed 250 characters');
    setErrors(found);
    if (found.length) return;

    setBusy(true);
    try {
      const updated = await updateProfile({
        name: values.name.trim(),
        institution: values.institution,
        contactInfo: values.contactInfo.trim(),
        bio: values.bio.trim(),
        skillsToOffer: values.skillsToOffer,
        skillsToLearn: values.skillsToLearn,
      });
      setProfile(updated);
      updateUser(updated);
      setNotice('Profile updated successfully.');
    } catch (err) {
      setServerError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="container page">
        <Loading message="Loading profile..." />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="container page">
        <ErrorMessage error={loadError} />
      </div>
    );
  }

  return (
    <div className="container page">
      <header className="page-head">
        <h1>My Profile</h1>
        <p className="muted">
          Member since {formatDate(profile.createdAt)} &middot; {profile.email}
        </p>
      </header>

      {notice && <div className="alert alert-success">{notice}</div>}

      <div className="card form-card">
        <ErrorMessage error={errors.length ? errors : serverError} />

        <form className="form" onSubmit={handleSubmit} noValidate>
          <div className="field-row">
            <div className="field">
              <label htmlFor="name">Name</label>
              <input id="name" name="name" type="text" value={values.name} onChange={change} />
            </div>

            <div className="field">
              <label htmlFor="institution">Institution</label>
              <select id="institution" name="institution" value={values.institution} onChange={change}>
                {INSTITUTIONS.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="contactInfo">Contact Information</label>
            <input
              id="contactInfo"
              name="contactInfo"
              type="text"
              value={values.contactInfo}
              onChange={change}
              placeholder="WhatsApp: 0300-1234567"
            />
            <small className="hint">
              Only shared with a student after you accept their swap request.
            </small>
          </div>

          <div className="field">
            <label htmlFor="bio">Bio</label>
            <textarea id="bio" name="bio" rows={3} maxLength={250} value={values.bio} onChange={change} />
            <small className="hint">{values.bio.length}/250 characters.</small>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="skillsToOffer">Skills To Offer</label>
              <input
                id="skillsToOffer"
                name="skillsToOffer"
                type="text"
                value={values.skillsToOffer}
                onChange={change}
                placeholder="Python, Git and GitHub"
              />
              <small className="hint">Separate skills with commas.</small>
            </div>

            <div className="field">
              <label htmlFor="skillsToLearn">Skills To Learn</label>
              <input
                id="skillsToLearn"
                name="skillsToLearn"
                type="text"
                value={values.skillsToLearn}
                onChange={change}
                placeholder="Spoken English, Graphic Design"
              />
              <small className="hint">Separate skills with commas.</small>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div className="card">
        <h2>Current skills</h2>
        <h3>Offering</h3>
        {profile.skillsToOffer?.length ? (
          <div className="chips">
            {profile.skillsToOffer.map((s) => (
              <span className="chip" key={s}>
                {s}
              </span>
            ))}
          </div>
        ) : (
          <p className="muted">You have not added any skills to offer yet.</p>
        )}

        <h3>Want to learn</h3>
        {profile.skillsToLearn?.length ? (
          <div className="chips">
            {profile.skillsToLearn.map((s) => (
              <span className="chip" key={s}>
                {s}
              </span>
            ))}
          </div>
        ) : (
          <p className="muted">You have not added any skills to learn yet.</p>
        )}
      </div>
    </div>
  );
}
