import { Outlet } from "react-router-dom";

import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import "../admin.css";

export default function AdminLayout() {
  return <div className="admin-app"><AdminSidebar /><div className="admin-main"><AdminHeader /><div className="admin-content"><Outlet /></div></div></div>;
}
