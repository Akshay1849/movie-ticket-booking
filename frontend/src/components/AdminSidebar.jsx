import { NavLink } from "react-router-dom";

const links = [
  { to: "/admin/dashboard", label: "Dashboard", icon: "01" },
  { to: "/admin/movies", label: "Movies", icon: "02" },
  { to: "/admin/shows", label: "Shows", icon: "03" },
  { to: "/admin/bookings", label: "Bookings", icon: "04" },
];

export default function AdminSidebar() {
  return <aside className="admin-sidebar"><div className="admin-sidebar-brand"><span className="brand-mark">V</span><div><strong>Backstage</strong><small>Vasundhara Theatre</small></div></div><nav className="admin-nav" aria-label="Admin navigation">{links.map((link) => <NavLink className={({ isActive }) => isActive ? "admin-nav-link active" : "admin-nav-link"} to={link.to} key={link.to}><span>{link.icon}</span>{link.label}</NavLink>)}</nav><div className="sidebar-note"><span>Live room</span><strong>SCREEN 01</strong><small>Operations console</small></div></aside>;
}
