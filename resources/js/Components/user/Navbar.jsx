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
    const [totalTickets, setTotalTickets] = useState(user?.total_tickets || 0);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);

    const profileDropdownRef = useRef(null);
    const notificationDropdownRef = useRef(null);

    useEffect(() => {
        fetchNotifications();
    }, []);

    useEffect(() => {
        if (user?.total_tickets !== undefined) {
            setTotalTickets(user.total_tickets);
        }
    }, [user?.total_tickets]);

    // Subscribe to real-time events
    useEffect(() => {
        if (!user?.user_id) return;

        const channel = window.Echo.private(`user.${user.user_id}`);

        // Listen for complaint status changes
        channel.listen(".ComplaintStatusChanged", (event) => {
            const statusMap = {
                waiting: "Menunggu",
                on_progress: "Sedang Diproses",
                done: "Selesai",
            };

            const newNotification = {
                notification_id: `status_${event.complaint_id}_${Date.now()}`,
                type: "status_changed",
                title: "Status Keluhan Berubah",
                message: `Status keluhan [${event.ticket_id}] berubah dari ${
                    statusMap[event.old_status] || event.old_status
                } menjadi ${statusMap[event.new_status] || event.new_status}`,
                related_complaint_id: event.complaint_id,
                is_read: "unread",
                created_at: new Date().toISOString(),
            };

            setNotifications((prev) => [newNotification, ...prev]);
            setUnreadCount((prev) => prev + 1);
        });

        // Listen for feedback replies
        channel.listen(".FeedbackReplied", (event) => {
            const newNotification = {
                notification_id: `feedback_${event.response_id}_${Date.now()}`,
                type: "feedback_replied",
                title: "Admin Menanggapi Feedback Anda",
                message: `Admin ${event.admin_name} telah menanggapi feedback Anda pada keluhan [${event.ticket_id}]`,
                related_complaint_id: event.complaint_id,
                is_read: "unread",
                created_at: event.created_at,
            };

            setNotifications((prev) => [newNotification, ...prev]);
            setUnreadCount((prev) => prev + 1);
        });

        return () => {
            channel.stopListening(".ComplaintStatusChanged");
            channel.stopListening(".FeedbackReplied");
            window.Echo.leave(`user.${user.user_id}`);
        };
    }, [user?.user_id]);

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
            const response = await axiosInstance.get("/user/notifications");
            setNotifications(response.data.data || []);

            const unreadResponse = await axiosInstance.get(
                "/user/notifications/unread-count"
            );
            setUnreadCount(unreadResponse.data.data?.unread_count || 0);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const handleLogout = async () => {
        await logout();
        window.location.href = "/";
    };

    const handleNotificationClick = async (notificationId) => {
        try {
            await axiosInstance.put(
                `/user/notifications/${notificationId}/read`
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
                        <Link to="/dashboard" className="flex items-center">
                            <img
                                src="/images/logo_UPT.png"
                                alt="Logo UPT"
                                className="w-32 h-32 object-contain"
                            />
                            <span className="ml-3 text-xl font-bold text-gray-800 hidden sm:block">
                                Ticketing System
                            </span>
                        </Link>
                    </div>

                    {/* Menu Center */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            to="/dashboard"
                            className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                                isActivePath("/dashboard")
                                    ? "bg-primary-50 text-primary-700"
                                    : "text-gray-600 hover:text-primary-700 hover:bg-primary-50"
                            }`}
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/keluhan"
                            className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                                isActivePath("/keluhan") ||
                                isActivePath("/keluhan/list")
                                    ? "bg-primary-50 text-primary-700"
                                    : "text-gray-600 hover:text-primary-700 hover:bg-primary-50"
                            }`}
                        >
                            Keluhan
                        </Link>
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center space-x-4">
                        {/* Total Tickets */}
                        <div className="hidden sm:flex items-center px-4 py-2 bg-primary-50 rounded-lg">
                            <svg
                                className="w-5 h-5 text-primary-700 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                                />
                            </svg>
                            <span className="text-sm font-semibold text-primary-700">
                                {totalTickets} Tiket
                            </span>
                        </div>

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
                                    <span className="text-white font-semibold text-sm">
                                        {user?.nama_lengkap
                                            ?.charAt(0)
                                            .toUpperCase() || "U"}
                                    </span>
                                </div>
                                <span className="text-sm font-medium text-gray-700 hidden md:block">
                                    {user?.nama_lengkap || "User"}
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
                                        to="/profile"
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
                        to="/dashboard"
                        className={`flex flex-col items-center py-2 px-4 rounded-lg ${
                            isActivePath("/dashboard")
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
                        to="/keluhan"
                        className={`flex flex-col items-center py-2 px-4 rounded-lg ${
                            isActivePath("/keluhan")
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
                    <div className="flex flex-col items-center py-2 px-4">
                        <div className="flex items-center justify-center w-6 h-6 bg-primary-100 rounded-full">
                            <span className="text-xs font-bold text-primary-700">
                                {totalTickets}
                            </span>
                        </div>
                        <span className="text-xs mt-1 text-gray-600">
                            Tiket
                        </span>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
