import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

// Landing Page
import LandingPage from "./pages/LandingPage";

// Auth Pages
import LoginUser from "./pages/auth/LoginUser";
import LoginAdmin from "./pages/auth/LoginAdmin";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

// User Pages
import UserDashboard from "./pages/user/Dashboard";
import ComplaintForm from "./pages/user/ComplaintForm";
import ComplaintList from "./pages/user/ComplaintList";
import ComplaintDetail from "./pages/user/ComplaintDetail";
import FeedbackForm from "./pages/user/FeedbackForm";
import ProfileSettings from "./pages/user/ProfileSettings";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import KelolaKeluhan from "./pages/admin/KelolaKeluhan";
import KelolaPengguna from "./pages/admin/KelolaPengguna";
import BantuanUser from "./pages/admin/BantuanUser";
import AnalisisLayanan from "./pages/admin/AnalisisLayanan";
import AdminProfileSettings from "./pages/admin/ProfileSettings";

// Protected Route Component untuk User
const ProtectedUserRoute = ({ children }) => {
    const { isAuthenticated, role, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated || role !== "user") {
        return <Navigate to="/login" replace />;
    }

    return children;
};

// Protected Route Component untuk Admin
const ProtectedAdminRoute = ({ children }) => {
    const { isAuthenticated, role, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated || role !== "admin") {
        return <Navigate to="/admin/login" replace />;
    }

    return children;
};

// Public Route Component (tidak boleh diakses jika sudah login)
const PublicRoute = ({ children }) => {
    const { isAuthenticated, role, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    if (isAuthenticated) {
        if (role === "user") {
            return <Navigate to="/dashboard" replace />;
        } else if (role === "admin") {
            return <Navigate to="/admin/dashboard" replace />;
        }
    }

    return children;
};

const Router = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Landing Page */}
                <Route path="/" element={<LandingPage />} />

                {/* Public Routes - Auth */}
                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <LoginUser />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/admin/login"
                    element={
                        <PublicRoute>
                            <LoginAdmin />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/register"
                    element={
                        <PublicRoute>
                            <Register />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/forgot-password"
                    element={
                        <PublicRoute>
                            <ForgotPassword />
                        </PublicRoute>
                    }
                />

                {/* User Protected Routes */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedUserRoute>
                            <UserDashboard />
                        </ProtectedUserRoute>
                    }
                />
                <Route
                    path="/keluhan"
                    element={
                        <ProtectedUserRoute>
                            <ComplaintForm />
                        </ProtectedUserRoute>
                    }
                />
                <Route
                    path="/keluhan/list"
                    element={
                        <ProtectedUserRoute>
                            <ComplaintList />
                        </ProtectedUserRoute>
                    }
                />
                <Route
                    path="/keluhan/:id"
                    element={
                        <ProtectedUserRoute>
                            <ComplaintDetail />
                        </ProtectedUserRoute>
                    }
                />
                <Route
                    path="/feedback/:complaintId"
                    element={
                        <ProtectedUserRoute>
                            <FeedbackForm />
                        </ProtectedUserRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <ProtectedUserRoute>
                            <ProfileSettings />
                        </ProtectedUserRoute>
                    }
                />

                {/* Admin Protected Routes */}
                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedAdminRoute>
                            <AdminDashboard />
                        </ProtectedAdminRoute>
                    }
                />
                <Route
                    path="/admin/kelola-keluhan"
                    element={
                        <ProtectedAdminRoute>
                            <KelolaKeluhan />
                        </ProtectedAdminRoute>
                    }
                />
                <Route
                    path="/admin/kelola-pengguna"
                    element={
                        <ProtectedAdminRoute>
                            <KelolaPengguna />
                        </ProtectedAdminRoute>
                    }
                />
                <Route
                    path="/admin/bantuan-user"
                    element={
                        <ProtectedAdminRoute>
                            <BantuanUser />
                        </ProtectedAdminRoute>
                    }
                />
                <Route
                    path="/admin/analisis-layanan"
                    element={
                        <ProtectedAdminRoute>
                            <AnalisisLayanan />
                        </ProtectedAdminRoute>
                    }
                />
                <Route
                    path="/admin/profile"
                    element={
                        <ProtectedAdminRoute>
                            <AdminProfileSettings />
                        </ProtectedAdminRoute>
                    }
                />

                {/* 404 Route */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default Router;
