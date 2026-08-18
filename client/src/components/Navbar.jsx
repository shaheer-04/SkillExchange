/**
 * components/Navbar.jsx
 * Responsive navigation. On narrow screens the links collapse into a
 * button-toggled menu.
 */

import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const close = () => setOpen(false);

  const handleLogout = () => {
    logout();
    close();
    navigate('/login');
  };

  const linkClass = ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link');

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand" onClick={close}>
          <span className="brand-mark">SE</span>
          <span className="brand-text">SkillExchange</span>
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={open ? 'nav-links open' : 'nav-links'}>
          <NavLink to="/" className={linkClass} onClick={close} end>
            Home
          </NavLink>
          <NavLink to="/explore" className={linkClass} onClick={close}>
            Explore Skills
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" className={linkClass} onClick={close}>
                Dashboard
              </NavLink>
              <NavLink to="/create-listing" className={linkClass} onClick={close}>
                Create Listing
              </NavLink>
              <NavLink to="/my-listings" className={linkClass} onClick={close}>
                My Listings
              </NavLink>
              <NavLink to="/swaps" className={linkClass} onClick={close}>
                Swap Requests
              </NavLink>
              <NavLink to="/profile" className={linkClass} onClick={close}>
                Profile
              </NavLink>
              <button type="button" className="btn btn-sm btn-outline nav-btn" onClick={handleLogout}>
                Logout{user ? ` (${user.name.split(' ')[0]})` : ''}
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass} onClick={close}>
                Login
              </NavLink>
              <Link to="/register" className="btn btn-sm btn-primary nav-btn" onClick={close}>
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
