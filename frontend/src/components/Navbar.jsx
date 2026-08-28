import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isManagement =
    user?.role === "ADMIN" || user?.role === "THEATRE_MANAGER";

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate("/");
  };

  const closeMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="site-header">
      <div className="nav-shell">
        <Link
          className="brand"
          to="/"
          onClick={closeMenu}
          aria-label="Vasundhara Theatre home"
        >
          <span className="brand-mark">V</span>
          <span>
            Vasundhara <strong>Theatre</strong>
          </span>
        </Link>

        <button
          type="button"
          className="mobile-nav-toggle"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>

        <nav
          className={`main-nav ${mobileMenuOpen ? "nav-open" : ""}`}
          aria-label="Main navigation"
        >
          <NavLink to="/" end onClick={closeMenu}>
            Discover
          </NavLink>

          <NavLink to="/about" onClick={closeMenu}>
            About
          </NavLink>

          {isAuthenticated && (
            <NavLink to="/my-bookings" onClick={closeMenu}>
              My bookings
            </NavLink>
          )}

          {isManagement && (
            <NavLink to="/admin/dashboard" onClick={closeMenu}>
              Admin dashboard
            </NavLink>
          )}
        </nav>

        <div className={`nav-account ${mobileMenuOpen ? "nav-open" : ""}`}>
          {isAuthenticated ? (
            <>
              <div
                className="user-profile-summary"
                title={user?.email || "Signed in user"}
              >
                <span className="user-badge">
                  {user?.email?.slice(0, 1).toUpperCase() || "U"}
                </span>

                <span className="user-email-label">{user?.email}</span>
              </div>

              <button
                className="text-button logout-btn"
                type="button"
                onClick={handleLogout}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                className="text-button"
                to="/login"
                onClick={closeMenu}
              >
                Log in
              </Link>

              <Link
                className="button button-small"
                to="/register"
                onClick={closeMenu}
              >
                Join now
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}