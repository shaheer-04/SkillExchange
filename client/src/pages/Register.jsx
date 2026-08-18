import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';
import { INSTITUTIONS } from '../constants';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    institution: '',
    contactInfo: '',
    bio: '',
    skillsToOffer: '',
    skillsToLearn: '',
  });
  const [errors, setErrors] = useState([]);
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);

  const change = (e) => setValues({ ...values, [e.target.name]: e.target.value });

  const validate = () => {
    const found = [];
    if (!values.name.trim()) found.push('Name is required');
    else if (values.name.trim().length < 3) found.push('Name must be at least 3 characters');
    if (!values.email.trim()) found.push('Email is required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
      found.push('Please enter a valid email address');
    if (!values.password) found.push('Password is required');
    else if (values.password.length < 6) found.push('Password must be at least 6 characters');
    if (values.password !== values.confirmPassword) found.push('Passwords do not match');
    if (!values.institution) found.push('Please choose your institution');
    if (!values.contactInfo.trim()) found.push('Contact information is required');
    if (values.bio.length > 250) found.push('Bio cannot exceed 250 characters');
    return found;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const found = validate();
    setErrors(found);
    if (found.length) return;

    setBusy(true);
    try {
      await register({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        institution: values.institution,
        contactInfo: values.contactInfo.trim(),
        bio: values.bio.trim(),
        skillsToOffer: values.skillsToOffer,
        skillsToLearn: values.skillsToLearn,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container page">
      <div className="card auth-card wide">
        <h1>Join SkillExchange</h1>
        <p className="muted">
          Create your free account. You can add your skills now or later from your profile.
        </p>

        <ErrorMessage error={errors.length ? errors : serverError} />

        <form className="form" onSubmit={handleSubmit} noValidate>
          <div className="field-row">
            <div className="field">
              <label htmlFor="name">Name</label>
              <input id="name" name="name" type="text" value={values.name} onChange={change} placeholder="Ahmad Khan" />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" value={values.email} onChange={change} placeholder="ahmad@uetpeshawar.edu.pk" />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" autoComplete="new-password" value={values.password} onChange={change} placeholder="At least 6 characters" />
            </div>
            <div className="field">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" value={values.confirmPassword} onChange={change} placeholder="Repeat your password" />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="institution">Institution</label>
              <select id="institution" name="institution" value={values.institution} onChange={change}>
                <option value="">Select your institution</option>
                {INSTITUTIONS.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="contactInfo">Contact Information</label>
              <input id="contactInfo" name="contactInfo" type="text" value={values.contactInfo} onChange={change} placeholder="WhatsApp: 0300-1234567" />
              <small className="hint">Shown to a student only after you accept their swap.</small>
            </div>
          </div>

          <div className="field">
            <label htmlFor="bio">Short Bio (optional)</label>
            <textarea id="bio" name="bio" rows={3} maxLength={250} value={values.bio} onChange={change} placeholder="Third year CS student who loves backend development." />
            <small className="hint">{values.bio.length}/250 characters.</small>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="skillsToOffer">Skills You Can Offer (optional)</label>
              <input id="skillsToOffer" name="skillsToOffer" type="text" value={values.skillsToOffer} onChange={change} placeholder="Python, Git and GitHub" />
              <small className="hint">Separate skills with commas.</small>
            </div>
            <div className="field">
              <label htmlFor="skillsToLearn">Skills You Want to Learn (optional)</label>
              <input id="skillsToLearn" name="skillsToLearn" type="text" value={values.skillsToLearn} onChange={change} placeholder="Spoken English, Graphic Design" />
              <small className="hint">Separate skills with commas.</small>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Creating your account...' : 'Create Account'}
          </button>
        </form>

        <p className="form-foot">
          Already registered? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}
