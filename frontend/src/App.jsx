import { Navigate, Route, Routes } from "react-router-dom";

import AdminLayout from "./components/AdminLayout";
import AdminRoute from "./components/AdminRoute";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import HomePage from "./pages/HomePage";
import BookingPage from "./pages/BookingPage";
import BookingSuccessPage from "./pages/BookingSuccessPage";
import BookingDetailsPage from "./pages/BookingDetailsPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminMoviesPage from "./pages/admin/AdminMoviesPage";
import AdminShowsPage from "./pages/admin/AdminShowsPage";
import AdminBookingsPage from "./pages/admin/AdminBookingsPage";
import LoginPage from "./pages/LoginPage";
import MovieDetailsPage from "./pages/MovieDetailsPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import RegisterPage from "./pages/RegisterPage";
import AboutPage from "./pages/AboutPage";

export default function App() {
  const { isAuthenticated } = useAuth();

  return <div className="app-shell"><Navbar /><Routes><Route path="/" element={<HomePage />} /><Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} /><Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />} /><Route path="/movies/:id" element={<MovieDetailsPage />} /><Route element={<ProtectedRoute />}><Route path="/booking/:showId" element={<BookingPage />} /><Route path="/booking-success/:id" element={<BookingSuccessPage />} /><Route path="/my-bookings" element={<MyBookingsPage />} /><Route path="/my-bookings/:id" element={<BookingDetailsPage />} /></Route><Route element={<AdminRoute />}><Route element={<AdminLayout />}><Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} /><Route path="/admin/dashboard" element={<AdminDashboardPage />} /><Route path="/admin/movies" element={<AdminMoviesPage />} /><Route path="/admin/shows" element={<AdminShowsPage />} /><Route path="/admin/bookings" element={<AdminBookingsPage />} /></Route></Route><Route path="*" element={<Navigate to="/" replace />} /> <Route path="/about" element={<AboutPage />} /> </Routes><footer className="site-footer"><span>Vasundhara Theatre 70MM</span><span>Stories in every frame</span></footer></div>;
}
