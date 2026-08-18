import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  {
    title: 'Learn From Students',
    text: 'Pick up a new skill from someone at your own level, in your own city, who explains it the way students actually talk.',
  },
  {
    title: 'Share What You Know',
    text: 'You already know something worth teaching. Turn it into a skill other students can learn from you.',
  },
  {
    title: 'No Money Required',
    text: 'Nothing is bought or sold here. You trade what you know for what you want to learn.',
  },
  {
    title: 'Connect Across Peshawar',
    text: 'Meet students from UET, University of Peshawar, Islamia College and IMSciences - online or on campus.',
  },
];

const categories = [
  'Web Development',
  'Programming',
  'Graphic Design',
  'Freelancing',
  'Languages',
  'Mobile Development',
];

const steps = [
  'Offer a skill you know.',
  'Find a skill you want.',
  'Send a swap request.',
  'Meet online or in person.',
  'Learn together.',
];

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <h1>Exchange Skills. Build Connections.</h1>
          <p className="hero-sub">
            SkillExchange is a peer-to-peer skill bartering platform for students and young adults
            in Peshawar. Offer a skill you already know, find one you want to learn, and swap
            directly with another student. No money changes hands - only knowledge.
          </p>
          <div className="hero-actions">
            <Link to="/explore" className="btn btn-primary btn-lg">
              Explore Skills
            </Link>
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-accent btn-lg">
                Go to Dashboard
              </Link>
            ) : (
              <Link to="/register" className="btn btn-accent btn-lg">
                Join SkillExchange
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="container page">
        <h2 className="section-title">Why SkillExchange</h2>
        <div className="grid grid-4">
          {features.map((f) => (
            <div className="card feature-card" key={f.title}>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="band">
        <div className="container">
          <h2 className="section-title">How it works</h2>
          <ol className="steps">
            {steps.map((step, i) => (
              <li key={step}>
                <span className="step-number">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container page">
        <h2 className="section-title">Popular categories</h2>
        <div className="chips">
          {categories.map((c) => (
            <span className="chip" key={c}>
              {c}
            </span>
          ))}
        </div>

        <div className="cta">
          <h2>Ready to swap your first skill?</h2>
          <p className="muted">
            Create a free account, add what you can teach and what you want to learn, and start
            finding matches today.
          </p>
          <div className="hero-actions">
            {isAuthenticated ? (
              <Link to="/create-listing" className="btn btn-primary btn-lg">
                Create a Listing
              </Link>
            ) : (
              <Link to="/register" className="btn btn-primary btn-lg">
                Join SkillExchange
              </Link>
            )}
            <Link to="/explore" className="btn btn-outline btn-lg">
              Browse Listings
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
