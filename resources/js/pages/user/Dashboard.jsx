import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/user/Navbar";
import axiosInstance from "../../config/axios";

const Dashboard = () => {
    const navigate = useNavigate();
    const [searchKeyword, setSearchKeyword] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [recentComplaints, setRecentComplaints] = useState([]);
    const [loading, setLoading] = useState(false);
    const [claimLoading, setClaimLoading] = useState(false);
    const [ticketBalance, setTicketBalance] = useState({
        total_tickets: 0,
        daily_tickets: 0,
    });
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        fetchTicketBalance();
        fetchRecentComplaints();
    }, []);

    const fetchTicketBalance = async () => {
        try {
            const response = await axiosInstance.get("/user/tickets/balance");
            setTicketBalance({
                total_tickets: response.data.data?.total_tickets || 0,
                daily_tickets: response.data.data?.daily_tickets || 0,
            });
        } catch (error) {
            console.error("Error fetching ticket balance:", error);
        }
    };

    const fetchRecentComplaints = async () => {
        try {
            const response = await axiosInstance.get(
                "/user/complaints/search",
                {
                    params: { limit: 20 },
                }
            );
            setRecentComplaints(response.data.data || []);
        } catch (error) {
            console.error("Error fetching recent complaints:", error);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();

        if (!searchKeyword.trim()) {
            setSearchResults([]);
            return;
        }

        setLoading(true);
        try {
            const response = await axiosInstance.get(
                "/user/complaints/search",
                {
                    params: {
                        keyword: searchKeyword,
                        limit: 10,
                    },
                }
            );
            setSearchResults(response.data.data || []);
        } catch (error) {
            console.error("Error searching complaints:", error);
            setMessage({ type: "error", text: "Gagal mencari keluhan" });
        }
        setLoading(false);
    };

    const handleClaimTicket = async () => {
        setClaimLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const response = await axiosInstance.post("/user/tickets/claim");
            setMessage({
                type: "success",
                text: response.data.message || "Berhasil claim tiket",
            });
            fetchTicketBalance();
        } catch (error) {
            const errorMsg =
                error.response?.data?.message || "Gagal claim tiket";
            setMessage({ type: "error", text: errorMsg });
        }

        setClaimLoading(false);
    };

    const getStatusBadge = (status) => {
        const badges = {
            waiting: "bg-yellow-100 text-yellow-800",
            on_progress: "bg-blue-100 text-blue-800",
            done: "bg-primary-100 text-primary-800",
        };
        return badges[status] || "bg-gray-100 text-gray-800";
    };

    const getPriorityBadge = (priority) => {
        const badges = {
            low: "bg-gray-100 text-gray-800",
            middle: "bg-orange-100 text-orange-800",
            high: "bg-red-100 text-red-800",
        };
        return badges[priority] || "bg-gray-100 text-gray-800";
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Dashboard
                    </h1>
                    <p className="text-gray-600">
                        Kelola tiket dan keluhan Anda dengan mudah
                    </p>
                </div>

                {message.text && (
                    <div
                        className={`mb-6 p-4 rounded-lg ${
                            message.type === "success"
                                ? "bg-primary-50 border border-primary-200 text-primary-700"
                                : "bg-red-50 border border-red-200 text-red-600"
                        }`}
                    >
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Claim Ticket Section */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-800">
                                    Tiket Anda
                                </h2>
                                <svg
                                    className="w-8 h-8 text-primary-700"
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
                            </div>

                            <div className="space-y-4">
                                <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-4 border border-primary-200">
                                    <p className="text-sm text-gray-600 mb-1">
                                        Total Tiket
                                    </p>
                                    <p className="text-3xl font-bold text-primary-700">
                                        {ticketBalance.total_tickets}
                                    </p>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <p className="text-sm text-gray-600 mb-1">
                                        Tiket Hari Ini
                                    </p>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {ticketBalance.daily_tickets} / 3
                                    </p>
                                </div>

                                <button
                                    onClick={handleClaimTicket}
                                    disabled={
                                        claimLoading ||
                                        ticketBalance.daily_tickets <= 0 ||
                                        ticketBalance.total_tickets >= 15
                                    }
                                    className="w-full bg-gradient-to-r from-primary-700 to-primary-800 hover:from-primary-800 hover:to-primary-900 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {claimLoading
                                        ? "Loading..."
                                        : "Claim Tiket"}
                                </button>

                                {ticketBalance.daily_tickets <= 0 &&
                                    ticketBalance.total_tickets < 15 && (
                                        <p className="text-xs text-center text-gray-500 mt-2">
                                            Limit harian tercapai. Coba lagi
                                            besok.
                                        </p>
                                    )}

                                {ticketBalance.total_tickets >= 15 && (
                                    <p className="text-xs text-center text-gray-500 mt-2">
                                        Batas maksimal tiket tercapai (15
                                        tiket).
                                    </p>
                                )}

                                <div className="border-t border-gray-200 pt-4 mt-4">
                                    <p className="text-xs text-gray-500 text-center">
                                        Maksimal 3 tiket per hari dan 15 tiket
                                        total per akun
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search & History Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">
                                Cari Keluhan
                            </h2>

                            {/* Search Bar */}
                            <form onSubmit={handleSearch} className="mb-6">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={searchKeyword}
                                        onChange={(e) =>
                                            setSearchKeyword(e.target.value)
                                        }
                                        placeholder="Cari berdasarkan ruangan, lab, atau keluhan..."
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-3 bg-primary-700 text-white rounded-lg hover:bg-primary-800 transition duration-200 disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <svg
                                                className="animate-spin h-5 w-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                />
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                />
                                            </svg>
                                        ) : (
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                                />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </form>

                            {/* Search Results */}
                            {searchResults.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                        Hasil Pencarian
                                    </h3>
                                    <div className="space-y-3 max-h-64 overflow-y-auto">
                                        {searchResults.map((complaint) => (
                                            <div
                                                key={complaint.complaint_id}
                                                className="border border-gray-200 rounded-lg p-4 hover:border-primary-500 transition duration-200"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <p className="font-medium text-gray-800">
                                                            {complaint.keluhan}
                                                        </p>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {complaint.lab &&
                                                                `Lab: ${complaint.lab} | `}
                                                            {complaint.ruangan &&
                                                                `Ruangan: ${complaint.ruangan}`}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                                                                complaint.status
                                                            )}`}
                                                        >
                                                            {complaint.status}
                                                        </span>
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(
                                                                complaint.priority
                                                            )}`}
                                                        >
                                                            {complaint.priority}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(
                                                        complaint.created_at
                                                    ).toLocaleDateString(
                                                        "id-ID",
                                                        {
                                                            day: "numeric",
                                                            month: "long",
                                                            year: "numeric",
                                                        }
                                                    )}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recent Complaints History */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                    Riwayat Keluhan (1 Bulan Terakhir)
                                </h3>
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {recentComplaints.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            Belum ada keluhan dalam 1 bulan
                                            terakhir
                                        </div>
                                    ) : (
                                        recentComplaints.map((complaint) => (
                                            <div
                                                key={complaint.complaint_id}
                                                className="border border-gray-200 rounded-lg p-4 hover:border-primary-500 transition duration-200 cursor-pointer"
                                                onClick={() =>
                                                    navigate(
                                                        `/keluhan/${complaint.complaint_id}`
                                                    )
                                                }
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <p className="font-medium text-gray-800">
                                                            {complaint.keluhan}
                                                        </p>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {complaint.lab &&
                                                                `Lab: ${complaint.lab} | `}
                                                            {complaint.ruangan &&
                                                                `Ruangan: ${complaint.ruangan}`}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                                                                complaint.status
                                                            )}`}
                                                        >
                                                            {complaint.status}
                                                        </span>
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(
                                                                complaint.priority
                                                            )}`}
                                                        >
                                                            {complaint.priority}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    Oleh:{" "}
                                                    {complaint.nama_lengkap} -{" "}
                                                    {new Date(
                                                        complaint.created_at
                                                    ).toLocaleDateString(
                                                        "id-ID",
                                                        {
                                                            day: "numeric",
                                                            month: "long",
                                                            year: "numeric",
                                                        }
                                                    )}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                        Aksi Cepat
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => navigate("/keluhan")}
                            className="flex items-center justify-center gap-3 p-4 border-2 border-primary-500 text-primary-700 rounded-lg hover:bg-primary-50 transition duration-200"
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
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                            <span className="font-semibold">
                                Buat Keluhan Baru
                            </span>
                        </button>

                        <button
                            onClick={() => navigate("/keluhan/list")}
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
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                            </svg>
                            <span className="font-semibold">
                                Lihat Keluhan Saya
                            </span>
                        </button>

                        <button
                            onClick={() => navigate("/profile")}
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
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                            </svg>
                            <span className="font-semibold">
                                Profile Settings
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
