import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import api from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [state, setState] = useState({ loading: false, error: "" });
  const destination = location.state?.from?.pathname || "/";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setState({ loading: true, error: "" });
    try {
      const { data } = await api.post("/auth/login", form);
      login(data.token, data.user);
      navigate(destination, { replace: true });
    } catch (error) {
      setState({ loading: false, error: error.response?.data?.message || "We could not sign you in. Check your details." });
    }
  };

  return <AuthLayout title="Welcome back" subtitle="Your next great night starts here.">
    <form className="auth-form" onSubmit={handleSubmit}>
      {state.error && <div className="form-error" role="alert">{state.error}</div>}
      <label>Email address<input type="email" autoComplete="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
      <label>Password<input type="password" autoComplete="current-password" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>
      <button className="button button-wide" type="submit" disabled={state.loading}>{state.loading ? "Signing in..." : "Sign in"}</button>
      <p className="form-footnote">New here? <Link to="/register">Create an account</Link></p>
    </form>
  </AuthLayout>;
}

export function AuthLayout({ title, subtitle, children }) {
  return <main className="auth-page"><div className="auth-panel"><span className="eyebrow">Member access</span><h1>{title}</h1><p>{subtitle}</p>{children}</div><div className="auth-aside"><span>V</span><p>Make room for<br /><em>something memorable.</em></p></div></main>;
}
