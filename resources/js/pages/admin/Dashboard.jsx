import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/admin/Navbar";
import axiosInstance from "../../config/axios";

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total: 0,
        waiting: 0,
        on_progress: 0,
        done: 0,
    });
    const [recentComplaints, setRecentComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const complaintsResponse = await axiosInstance.get(
                "/admin/complaints"
            );
            const complaints = complaintsResponse.data.data || [];

            const statsData = {
                total: complaints.length,
                waiting: complaints.filter((c) => c.status === "waiting")
                    .length,
                on_progress: complaints.filter(
                    (c) => c.status === "on_progress"
                ).length,
                done: complaints.filter((c) => c.status === "done").length,
            };
            setStats(statsData);

            const recent = complaints.slice(0, 5);
            setRecentComplaints(recent);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        }
        setLoading(false);
    };

    const getStatusBadge = (status) => {
        const badges = {
            waiting: "bg-yellow-100 text-yellow-800 border-yellow-200",
            on_progress: "bg-blue-100 text-blue-800 border-blue-200",
            done: "bg-green-100 text-green-800 border-green-200",
        };
        return badges[status] || "bg-gray-100 text-gray-800 border-gray-200";
    };

    const getPriorityBadge = (priority) => {
        const badges = {
            low: "bg-gray-100 text-gray-800 border-gray-200",
            middle: "bg-orange-100 text-orange-800 border-orange-200",
            high: "bg-red-100 text-red-800 border-red-200",
        };
        return badges[priority] || "bg-gray-100 text-gray-800 border-gray-200";
    };

    const getStatusText = (status) => {
        const statusText = {
            waiting: "Menunggu",
            on_progress: "Sedang Diproses",
            done: "Selesai",
        };
        return statusText[status] || status;
    };

    const getPriorityText = (priority) => {
        const priorityText = {
            low: "Rendah",
            middle: "Sedang",
            high: "Tinggi",
        };
        return priorityText[priority] || priority;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Dashboard Admin
                    </h1>
                    <p className="text-gray-600">
                        Selamat datang di panel administrasi UPT LAB
                    </p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">
                                    Total Keluhan
                                </p>
                                <p className="text-3xl font-bold text-gray-800">
                                    {stats.total}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <svg
                                    className="w-8 h-8 text-blue-600"
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
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">
                                    Menunggu
                                </p>
                                <p className="text-3xl font-bold text-gray-800">
                                    {stats.waiting}
                                </p>
                            </div>
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <svg
                                    className="w-8 h-8 text-yellow-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-400">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">
                                    Sedang Diproses
                                </p>
                                <p className="text-3xl font-bold text-gray-800">
                                    {stats.on_progress}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <svg
                                    className="w-8 h-8 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">
                                    Selesai
                                </p>
                                <p className="text-3xl font-bold text-gray-800">
                                    {stats.done}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <svg
                                    className="w-8 h-8 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                        Aksi Cepat
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => navigate("/admin/kelola-keluhan")}
                            className="flex items-center justify-center gap-3 p-4 border-2 border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition duration-200"
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
                            <span className="font-semibold">
                                Kelola Keluhan
                            </span>
                        </button>

                        <button
                            onClick={() => navigate("/admin/kelola-pengguna")}
                            className="flex items-center justify-center gap-3 p-4 border-2 border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition duration-200"
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
                            <span className="font-semibold">
                                Kelola Pengguna
                            </span>
                        </button>

                        <button
                            onClick={() => navigate("/admin/analisis-layanan")}
                            className="flex items-center justify-center gap-3 p-4 border-2 border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition duration-200"
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
                                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                />
                            </svg>
                            <span className="font-semibold">
                                Lihat Feedback
                            </span>
                        </button>
                    </div>
                </div>

                {/* Recent Complaints */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-800">
                            Keluhan Terbaru
                        </h2>
                        <button
                            onClick={() => navigate("/admin/kelola-keluhan")}
                            className="text-sm text-green-600 hover:text-green-700 font-medium"
                        >
                            Lihat Semua
                        </button>
                    </div>

                    {recentComplaints.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            Belum ada keluhan
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentComplaints.map((complaint) => (
                                <div
                                    key={complaint.complaint_id}
                                    onClick={() =>
                                        navigate("/admin/kelola-keluhan")
                                    }
                                    className="border border-gray-200 rounded-lg p-4 hover:border-green-500 transition duration-200 cursor-pointer"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-mono font-semibold rounded-full">
                                                    {complaint.ticket_id}
                                                </span>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(
                                                        complaint.status
                                                    )}`}
                                                >
                                                    {getStatusText(
                                                        complaint.status
                                                    )}
                                                </span>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityBadge(
                                                        complaint.priority
                                                    )}`}
                                                >
                                                    {getPriorityText(
                                                        complaint.priority
                                                    )}
                                                </span>
                                            </div>
                                            <p className="font-medium text-gray-800 mb-1">
                                                {complaint.keluhan}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Oleh: {complaint.nama_lengkap} (
                                                {complaint.status_user})
                                            </p>
                                            {(complaint.lab ||
                                                complaint.ruangan) && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {complaint.lab &&
                                                        `Lab: ${complaint.lab}`}
                                                    {complaint.lab &&
                                                        complaint.ruangan &&
                                                        " | "}
                                                    {complaint.ruangan &&
                                                        `Ruangan: ${complaint.ruangan}`}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {new Date(
                                            complaint.created_at
                                        ).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
