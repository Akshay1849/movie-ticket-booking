import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function AdminHeader() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return <header className="admin-header"><div><span className="eyebrow">Vasundhara Theatre / Backstage</span><h1>Operations desk</h1></div><div className="admin-user"><div><strong>{user?.email || "Signed-in operator"}</strong><span>{user?.role === "THEATRE_MANAGER" ? "Theatre manager" : "Administrator"}</span></div><span className="admin-user-mark">{user?.email?.slice(0, 1).toUpperCase() || "U"}</span><button className="text-button" type="button" onClick={handleLogout}>Log out</button></div></header>;
}
