import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import axiosInstance from "../../config/axios";

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [showNotificationDropdown, setShowNotificationDropdown] =
        useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);

    const profileDropdownRef = useRef(null);
    const notificationDropdownRef = useRef(null);

    useEffect(() => {
        fetchNotifications();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                profileDropdownRef.current &&
                !profileDropdownRef.current.contains(event.target)
            ) {
                setShowProfileDropdown(false);
            }
            if (
                notificationDropdownRef.current &&
                !notificationDropdownRef.current.contains(event.target)
            ) {
                setShowNotificationDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await axiosInstance.get("/admin/notifications");
            setNotifications(response.data.data || []);

            const unreadResponse = await axiosInstance.get(
                "/admin/notifications/unread-count"
            );
            setUnreadCount(unreadResponse.data.unread_count || 0);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate("/admin/login");
    };

    const handleNotificationClick = async (notificationId) => {
        try {
            await axiosInstance.put(
                `/admin/notifications/${notificationId}/read`
            );
            fetchNotifications();
            setShowNotificationDropdown(false);
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const isActivePath = (path) => {
        return location.pathname === path;
    };

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link
                            to="/admin/dashboard"
                            className="flex items-center"
                        >
                            <img
                                src="/images/logo_UPT.png"
                                alt="Logo UPT"
                                className="w-32 h-32 object-contain"
                            />
                            <span className="ml-3 text-xl font-bold text-gray-800 hidden sm:block">
                                Admin Panel Ticketing System
                            </span>
                        </Link>
                    </div>

                    {/* Menu Center */}
                    <div className="hidden md:flex items-center space-x-2">
                        <Link
                            to="/admin/kelola-keluhan"
                            className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                                isActivePath("/admin/kelola-keluhan")
                                    ? "bg-primary-50 text-primary-700"
                                    : "text-gray-600 hover:text-primary-700 hover:bg-primary-50"
                            }`}
                        >
                            Kelola Keluhan
                        </Link>
                        <Link
                            to="/admin/kelola-pengguna"
                            className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                                isActivePath("/admin/kelola-pengguna")
                                    ? "bg-primary-50 text-primary-700"
                                    : "text-gray-600 hover:text-primary-700 hover:bg-primary-50"
                            }`}
                        >
                            Kelola Pengguna
                        </Link>
                        <Link
                            to="/admin/analisis-layanan"
                            className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                                isActivePath("/admin/analisis-layanan")
                                    ? "bg-primary-50 text-primary-700"
                                    : "text-gray-600 hover:text-primary-700 hover:bg-primary-50"
                            }`}
                        >
                            Analisis Layanan
                        </Link>
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center space-x-4">
                        {/* Notification */}
                        <div className="relative" ref={notificationDropdownRef}>
                            <button
                                onClick={() =>
                                    setShowNotificationDropdown(
                                        !showNotificationDropdown
                                    )
                                }
                                className="relative p-2 text-gray-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition duration-200"
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                    />
                                </svg>
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Notification Dropdown */}
                            {showNotificationDropdown && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 max-h-96 overflow-y-auto">
                                    <div className="px-4 py-2 border-b border-gray-200">
                                        <h3 className="font-semibold text-gray-800">
                                            Notifikasi
                                        </h3>
                                    </div>
                                    {notifications.length === 0 ? (
                                        <div className="px-4 py-6 text-center text-gray-500 text-sm">
                                            Tidak ada notifikasi
                                        </div>
                                    ) : (
                                        notifications.map((notif) => (
                                            <button
                                                key={notif.notification_id}
                                                onClick={() =>
                                                    handleNotificationClick(
                                                        notif.notification_id
                                                    )
                                                }
                                                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition duration-200 border-b border-gray-100 ${
                                                    notif.is_read === "unread"
                                                        ? "bg-primary-50"
                                                        : ""
                                                }`}
                                            >
                                                <p className="text-sm font-medium text-gray-800">
                                                    {notif.title}
                                                </p>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    {notif.message}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {new Date(
                                                        notif.created_at
                                                    ).toLocaleDateString(
                                                        "id-ID"
                                                    )}
                                                </p>
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Profile Dropdown */}
                        <div className="relative" ref={profileDropdownRef}>
                            <button
                                onClick={() =>
                                    setShowProfileDropdown(!showProfileDropdown)
                                }
                                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary-50 transition duration-200"
                            >
                                <div className="w-8 h-8 bg-gradient-to-br from-primary-700 to-primary-800 rounded-full flex items-center justify-center">
                                    <svg
                                        className="w-5 h-5 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                        />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-gray-700 hidden md:block">
                                    {user?.nama || "Admin"}
                                </span>
                                <svg
                                    className="w-4 h-4 text-gray-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </button>

                            {/* Profile Dropdown Menu */}
                            {showProfileDropdown && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                                    <Link
                                        to="/admin/profile"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition duration-200"
                                        onClick={() =>
                                            setShowProfileDropdown(false)
                                        }
                                    >
                                        Settings
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition duration-200"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden px-4 py-2 border-t border-gray-200">
                <div className="flex justify-around">
                    <Link
                        to="/admin/dashboard"
                        className={`flex flex-col items-center py-2 px-3 rounded-lg ${
                            isActivePath("/admin/dashboard")
                                ? "text-primary-700 bg-primary-50"
                                : "text-gray-600"
                        }`}
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                            />
                        </svg>
                        <span className="text-xs mt-1">Dashboard</span>
                    </Link>
                    <Link
                        to="/admin/kelola-keluhan"
                        className={`flex flex-col items-center py-2 px-3 rounded-lg ${
                            isActivePath("/admin/kelola-keluhan")
                                ? "text-primary-700 bg-primary-50"
                                : "text-gray-600"
                        }`}
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        <span className="text-xs mt-1">Keluhan</span>
                    </Link>
                    <Link
                        to="/admin/kelola-pengguna"
                        className={`flex flex-col items-center py-2 px-3 rounded-lg ${
                            isActivePath("/admin/kelola-pengguna")
                                ? "text-primary-700 bg-primary-50"
                                : "text-gray-600"
                        }`}
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                        </svg>
                        <span className="text-xs mt-1">Pengguna</span>
                    </Link>
                    <Link
                        to="/admin/analisis-layanan"
                        className={`flex flex-col items-center py-2 px-3 rounded-lg ${
                            isActivePath("/admin/analisis-layanan")
                                ? "text-primary-700 bg-primary-50"
                                : "text-gray-600"
                        }`}
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                        </svg>
                        <span className="text-xs mt-1">Analisis</span>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
