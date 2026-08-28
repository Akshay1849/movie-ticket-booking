import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { AuthLayout } from "./LoginPage";

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [state, setState] = useState({ loading: false, error: "" });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setState({ loading: true, error: "" });
    try {
      const { data } = await api.post("/auth/register", form);
      if (data.token) {
        login(data.token, data.user);
        navigate("/", { replace: true });
      } else {
        navigate("/login", { replace: true, state: { registered: true } });
      }
    } catch (error) {
      setState({ loading: false, error: error.response?.data?.message || "We could not create your account." });
    }
  };

  return <AuthLayout title="Join the audience" subtitle="Save your seat for the stories ahead.">
    <form className="auth-form" onSubmit={handleSubmit}>
      {state.error && <div className="form-error" role="alert">{state.error}</div>}
      <label>Email address<input type="email" autoComplete="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
      <label>Password <small>8 characters minimum</small><input type="password" autoComplete="new-password" minLength="8" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>
      <button className="button button-wide" type="submit" disabled={state.loading}>{state.loading ? "Creating account..." : "Create account"}</button>
      <p className="form-footnote">Already a member? <Link to="/login">Sign in</Link></p>
    </form>
  </AuthLayout>;
}
