import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Navbar from "../../Components/user/Navbar";
import Footer from "../../Components/user/Footer";
import axiosInstance from "../../config/axios";

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
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
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const panduanLink =
        "https://docs.google.com/document/d/YOUR_DOCUMENT_ID/edit";

    useEffect(() => {
        fetchTicketBalance();
        fetchRecentComplaints();
    }, []);

    // Subscribe to public channel for new complaints and hide/unhide events
    useEffect(() => {
        const channel = window.Echo.channel("admin-channel");

        // Listen for new complaint submissions
        channel.listen(".ComplaintSubmitted", (event) => {
            const newComplaint = {
                complaint_id: event.complaint_id,
                ticket_id: event.ticket_id,
                nama_lengkap: event.nama_lengkap,
                nim_nip: event.nim_nip,
                priority: event.priority,
                keluhan: event.keluhan,
                status: event.status || "waiting",
                status_user: event.status_user || "mahasiswa",
                kelas: event.kelas || null,
                lab: event.lab || null,
                ruangan: event.ruangan || null,
                is_hidden: event.is_hidden || "visible",
                created_at: event.created_at,
            };

            // Only add if not hidden
            if (newComplaint.is_hidden === "visible") {
                setRecentComplaints((prev) => {
                    const updated = [newComplaint, ...prev];
                    return updated.sort(
                        (a, b) =>
                            new Date(b.created_at) - new Date(a.created_at)
                    );
                });
            }
        });

        // Listen for complaint hide/unhide actions
        channel.listen(".ComplaintHidden", (event) => {
            if (event.is_hidden === "hidden") {
                // Remove from list when hidden
                setRecentComplaints((prev) =>
                    prev.filter((c) => c.complaint_id !== event.complaint_id)
                );
            } else if (event.is_hidden === "visible") {
                // Refresh list when unhidden
                fetchRecentComplaints();
            }
        });

        // Listen for status changes from admin channel (for all complaints in history)
        channel.listen(".ComplaintStatusChanged", (event) => {
            console.log(
                "ComplaintStatusChanged received in Dashboard (admin-channel):",
                event
            );
            setRecentComplaints((prev) =>
                prev.map((complaint) =>
                    complaint.complaint_id === event.complaint_id
                        ? { ...complaint, status: event.new_status }
                        : complaint
                )
            );
        });

        return () => {
            channel.stopListening(".ComplaintSubmitted");
            channel.stopListening(".ComplaintHidden");
            channel.stopListening(".ComplaintStatusChanged");
            window.Echo.leave("admin-channel");
        };
    }, []);

    // Subscribe to private channel for user-specific status updates
    useEffect(() => {
        if (!user?.user_id) return;

        const privateChannel = window.Echo.private(`user.${user.user_id}`);

        // Listen for status changes on user's own complaints
        privateChannel.listen(".ComplaintStatusChanged", (event) => {
            console.log(
                "ComplaintStatusChanged received in Dashboard (private):",
                event
            );
            setRecentComplaints((prev) =>
                prev.map((complaint) =>
                    complaint.complaint_id === event.complaint_id
                        ? { ...complaint, status: event.new_status }
                        : complaint
                )
            );
        });

        return () => {
            privateChannel.stopListening(".ComplaintStatusChanged");
            window.Echo.leave(`user.${user.user_id}`);
        };
    }, [user?.user_id]);

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
                    params: { limit: 1000 },
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
                    params: { keyword: searchKeyword, limit: 10 },
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

            if (response.data.data?.total_tickets !== undefined) {
                updateUser({
                    total_tickets: response.data.data.total_tickets,
                    daily_tickets: response.data.data.daily_tickets,
                });
            }
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

    // Konversi status ke bahasa Indonesia
    const getStatusText = (status) => {
        const statusText = {
            waiting: "Menunggu",
            on_progress: "Sedang Diproses",
            done: "Selesai",
        };
        return statusText[status] || status;
    };

    // Konversi priority ke bahasa Indonesia
    const getPriorityText = (priority) => {
        const priorityText = {
            low: "Rendah",
            middle: "Sedang",
            high: "Tinggi",
        };
        return priorityText[priority] || priority;
    };

    const totalPages = Math.ceil(recentComplaints.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentComplaints = recentComplaints.slice(
        indexOfFirstItem,
        indexOfLastItem
    );

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;
        const pageNumbers = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(
            1,
            currentPage - Math.floor(maxVisiblePages / 2)
        );
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return (
            <div className="flex items-center justify-center gap-2 mt-4">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                >
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
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                </button>
                {startPage > 1 && (
                    <>
                        <button
                            onClick={() => handlePageChange(1)}
                            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition duration-200"
                        >
                            1
                        </button>
                        {startPage > 2 && (
                            <span className="px-2 text-gray-400">...</span>
                        )}
                    </>
                )}
                {pageNumbers.map((number) => (
                    <button
                        key={number}
                        onClick={() => handlePageChange(number)}
                        className={`px-4 py-2 rounded-lg border transition duration-200 ${
                            currentPage === number
                                ? "bg-primary-700 text-white border-primary-700"
                                : "border-gray-300 text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                        {number}
                    </button>
                ))}
                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && (
                            <span className="px-2 text-gray-400">...</span>
                        )}
                        <button
                            onClick={() => handlePageChange(totalPages)}
                            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition duration-200"
                        >
                            {totalPages}
                        </button>
                    </>
                )}
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                >
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
                            d="M9 5l7 7-7 7"
                        />
                    </svg>
                </button>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                    <div className="lg:col-span-1 flex flex-col gap-6">
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
                        <div className="bg-white rounded-xl shadow-md p-6 flex-1 flex flex-col">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">
                                Aksi Cepat
                            </h2>
                            <div className="space-y-3 flex-1 flex flex-col justify-center">
                                <button
                                    onClick={() => navigate("/keluhan")}
                                    className="w-full flex items-center justify-center gap-3 p-3 border-2 border-primary-500 text-primary-700 rounded-lg hover:bg-primary-50 transition duration-200"
                                >
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
                                            d="M12 4v16m8-8H4"
                                        />
                                    </svg>
                                    <span className="font-semibold">
                                        Buat Keluhan Baru
                                    </span>
                                </button>
                                <button
                                    onClick={() => navigate("/keluhan/list")}
                                    className="w-full flex items-center justify-center gap-3 p-3 border-2 border-primary-500 text-primary-700 rounded-lg hover:bg-primary-50 transition duration-200"
                                >
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
                                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                        />
                                    </svg>
                                    <span className="font-semibold">
                                        Lihat Keluhan Saya
                                    </span>
                                </button>
                                <button
                                    onClick={() => navigate("/profile")}
                                    className="w-full flex items-center justify-center gap-3 p-3 border-2 border-primary-500 text-primary-700 rounded-lg hover:bg-primary-50 transition duration-200"
                                >
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
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        />
                                    </svg>
                                    <span className="font-semibold">
                                        Profile Settings
                                    </span>
                                </button>
                                <div className="border-t border-gray-200 my-2"></div>
                                <a
                                    href="https://drive.google.com/file/d/1sAhWXN7TXrp-pbPkhCEziD5c93hTUkVR/view?usp=sharing"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center justify-center gap-3 p-3 border-2 border-primary-500 text-primary-700 rounded-lg hover:bg-primary-50 transition duration-200"
                                >
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
                                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                        />
                                    </svg>
                                    <span className="font-semibold">
                                        Panduan Penggunaan
                                    </span>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-md p-6 h-full flex flex-col">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">
                                Cari Keluhan
                            </h2>
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
                                                            {getStatusText(
                                                                complaint.status
                                                            )}
                                                        </span>
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(
                                                                complaint.priority
                                                            )}`}
                                                        >
                                                            {getPriorityText(
                                                                complaint.priority
                                                            )}
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
                            <div className="flex-1 flex flex-col">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                    Riwayat Keluhan
                                </h3>
                                <div className="space-y-3 flex-1">
                                    {currentComplaints.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            Belum ada keluhan yang diajukan
                                        </div>
                                    ) : (
                                        currentComplaints.map((complaint) => (
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
                                                            {getStatusText(
                                                                complaint.status
                                                            )}
                                                        </span>
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(
                                                                complaint.priority
                                                            )}`}
                                                        >
                                                            {getPriorityText(
                                                                complaint.priority
                                                            )}
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
                                {renderPagination()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Dashboard;
