import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/admin/Navbar";
import Footer from "../../Components/admin/Footer";
import axiosInstance from "../../config/axios";

const BantuanUser = () => {
    const navigate = useNavigate();

    // Data state
    const [requests, setRequests] = useState([]);
    const [statistics, setStatistics] = useState({
        total: 0,
        pending: 0,
        processing: 0,
        completed: 0,
        rejected: 0,
    });

    // Filter state
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");

    // Loading state
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Message state
    const [message, setMessage] = useState({ type: "", text: "" });

    // Modal state
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showApproveSuccessModal, setShowApproveSuccessModal] =
        useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [generatedPassword, setGeneratedPassword] = useState(null);
    const [approvedData, setApprovedData] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [paginationMeta, setPaginationMeta] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
    });

    // Fetch requests dari API
    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page: currentPage };
            if (statusFilter !== "all") params.status = statusFilter;
            if (typeFilter !== "all") params.type = typeFilter;

            const response = await axiosInstance.get(
                "/admin/assistance-requests",
                { params }
            );
            setRequests(response.data.data);
            setPaginationMeta(response.data.meta);
        } catch (error) {
            console.error("Error fetching requests:", error);
            setMessage({ type: "error", text: "Gagal memuat data request" });
        }
        setLoading(false);
    }, [currentPage, statusFilter, typeFilter]);

    // Fetch statistics
    const fetchStatistics = async () => {
        try {
            const response = await axiosInstance.get(
                "/admin/assistance-requests/statistics"
            );
            setStatistics(response.data.data);
        } catch (error) {
            console.error("Error fetching statistics:", error);
        }
    };

    useEffect(() => {
        fetchRequests();
        fetchStatistics();
    }, [fetchRequests]);

    // Real-time listener untuk request baru
    useEffect(() => {
        const channel = window.Echo.channel("admin-channel");

        channel.listen(".AssistanceRequestSubmitted", (event) => {
            console.log("New assistance request:", event);
            fetchRequests();
            fetchStatistics();
        });

        return () => {
            channel.stopListening(".AssistanceRequestSubmitted");
        };
    }, [fetchRequests]);

    // Handle process - ubah status ke processing
    const handleProcess = async (id) => {
        setActionLoading(true);
        try {
            await axiosInstance.put(`/admin/assistance-requests/${id}/process`);
            setMessage({ type: "success", text: "Request sedang diproses" });
            fetchRequests();
            fetchStatistics();
            setShowDetailModal(false);
        } catch (error) {
            const errorMsg =
                error.response?.data?.message || "Gagal memproses request";
            setMessage({ type: "error", text: errorMsg });
        }
        setActionLoading(false);
    };

    // Handle reset password - generate password baru
    const handleResetPassword = async (id) => {
        setActionLoading(true);
        try {
            const response = await axiosInstance.put(
                `/admin/assistance-requests/${id}/reset-password`
            );
            setGeneratedPassword(response.data.data);
            setShowDetailModal(false);
            setShowPasswordModal(true);
            fetchRequests();
            fetchStatistics();
        } catch (error) {
            const errorMsg =
                error.response?.data?.message || "Gagal reset password";
            setMessage({ type: "error", text: errorMsg });
        }
        setActionLoading(false);
    };

    // Handle approve - setujui perubahan email/phone
    const handleApprove = async (id) => {
        setActionLoading(true);
        try {
            const response = await axiosInstance.put(
                `/admin/assistance-requests/${id}/approve`
            );

            // Simpan data untuk ditampilkan di modal sukses
            setApprovedData({
                type: selectedRequest.type,
                user_name: selectedRequest.nama_lengkap,
                user_phone: selectedRequest.user?.no_telepon || "-",
                user_email: selectedRequest.email_registered,
                old_value:
                    selectedRequest.type === "email_change"
                        ? selectedRequest.email_registered
                        : selectedRequest.user?.no_telepon,
                new_value: selectedRequest.new_value,
            });

            setShowDetailModal(false);
            setShowApproveSuccessModal(true);
            fetchRequests();
            fetchStatistics();
        } catch (error) {
            const errorMsg =
                error.response?.data?.message || "Gagal menyetujui request";
            setMessage({ type: "error", text: errorMsg });
        }
        setActionLoading(false);
    };

    // Handle reject - tolak request
    const handleReject = async () => {
        if (!rejectReason.trim()) {
            setMessage({ type: "error", text: "Alasan penolakan wajib diisi" });
            return;
        }

        setActionLoading(true);
        try {
            await axiosInstance.put(
                `/admin/assistance-requests/${selectedRequest.id}/reject`,
                {
                    admin_notes: rejectReason,
                }
            );
            setMessage({ type: "success", text: "Request berhasil ditolak" });
            fetchRequests();
            fetchStatistics();
            setShowRejectModal(false);
            setShowDetailModal(false);
            setRejectReason("");
        } catch (error) {
            const errorMsg =
                error.response?.data?.message || "Gagal menolak request";
            setMessage({ type: "error", text: errorMsg });
        }
        setActionLoading(false);
    };

    // Handle complete - tandai selesai
    const handleComplete = async (id) => {
        setActionLoading(true);
        try {
            await axiosInstance.put(
                `/admin/assistance-requests/${id}/complete`
            );
            setMessage({ type: "success", text: "Request ditandai selesai" });
            fetchRequests();
            fetchStatistics();
            setShowDetailModal(false);
        } catch (error) {
            const errorMsg =
                error.response?.data?.message || "Gagal menyelesaikan request";
            setMessage({ type: "error", text: errorMsg });
        }
        setActionLoading(false);
    };

    // Copy to clipboard
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setMessage({ type: "success", text: "Berhasil disalin" });
    };

    // Get type label
    const getTypeLabel = (type) => {
        const labels = {
            password_reset: "Reset Password",
            email_change: "Ganti Email",
            phone_change: "Ganti No Telepon",
        };
        return labels[type] || type;
    };

    // Get type badge color
    const getTypeBadgeColor = (type) => {
        const colors = {
            password_reset:
                "bg-primary-50 text-primary-700 border border-primary-200",
            email_change: "bg-blue-50 text-blue-600 border border-blue-200",
            phone_change:
                "bg-emerald-50 text-emerald-600 border border-emerald-200",
        };
        return (
            colors[type] || "bg-gray-50 text-gray-600 border border-gray-200"
        );
    };

    // Get status badge color
    const getStatusBadgeColor = (status) => {
        const colors = {
            pending: "bg-amber-50 text-amber-600 border border-amber-200",
            processing: "bg-blue-50 text-blue-600 border border-blue-200",
            completed:
                "bg-emerald-50 text-emerald-600 border border-emerald-200",
            rejected: "bg-rose-50 text-rose-600 border border-rose-200",
        };
        return (
            colors[status] || "bg-gray-50 text-gray-600 border border-gray-200"
        );
    };

    // Get status label
    const getStatusLabel = (status) => {
        const labels = {
            pending: "Menunggu",
            processing: "Diproses",
            completed: "Selesai",
            rejected: "Ditolak",
        };
        return labels[status] || status;
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Clear message after 5 seconds
    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => {
                setMessage({ type: "", text: "" });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            {/* Main Content */}
            <main className="flex-grow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            Bantuan User
                        </h1>
                        <p className="text-gray-600">
                            Kelola request bantuan dari user (reset password,
                            ganti email, ganti no telepon)
                        </p>
                    </div>

                    {/* Message Alert */}
                    {message.text && (
                        <div
                            className={`mb-6 p-4 rounded-lg ${
                                message.type === "success"
                                    ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                                    : "bg-rose-50 border border-rose-200 text-rose-600"
                            }`}
                        >
                            {message.text}
                        </div>
                    )}

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                        {/* Total */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 border-l-4 border-l-primary-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">
                                        Total
                                    </p>
                                    <p className="text-3xl font-bold text-gray-800 mt-1">
                                        {statistics.total}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
                                    <svg
                                        className="w-6 h-6 text-primary-600"
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

                        {/* Menunggu */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 border-l-4 border-l-amber-400">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-amber-600">
                                        Menunggu
                                    </p>
                                    <p className="text-3xl font-bold text-gray-800 mt-1">
                                        {statistics.pending}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center">
                                    <svg
                                        className="w-6 h-6 text-amber-500"
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

                        {/* Diproses */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 border-l-4 border-l-blue-400">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-600">
                                        Diproses
                                    </p>
                                    <p className="text-3xl font-bold text-gray-800 mt-1">
                                        {statistics.processing}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                                    <svg
                                        className="w-6 h-6 text-blue-500"
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

                        {/* Selesai */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 border-l-4 border-l-emerald-400">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-emerald-600">
                                        Selesai
                                    </p>
                                    <p className="text-3xl font-bold text-gray-800 mt-1">
                                        {statistics.completed}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
                                    <svg
                                        className="w-6 h-6 text-emerald-500"
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

                        {/* Ditolak */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 border-l-4 border-l-rose-400">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-rose-600">
                                        Ditolak
                                    </p>
                                    <p className="text-3xl font-bold text-gray-800 mt-1">
                                        {statistics.rejected}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center">
                                    <svg
                                        className="w-6 h-6 text-rose-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                        <h3 className="text-sm font-semibold text-gray-700 mb-4">
                            Filter
                        </h3>
                        <div className="flex flex-wrap gap-4">
                            <div className="min-w-[180px]">
                                <label className="block text-xs font-medium text-gray-500 mb-2">
                                    Status
                                </label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-sm"
                                >
                                    <option value="all">Semua Status</option>
                                    <option value="pending">Menunggu</option>
                                    <option value="processing">Diproses</option>
                                    <option value="completed">Selesai</option>
                                    <option value="rejected">Ditolak</option>
                                </select>
                            </div>
                            <div className="min-w-[180px]">
                                <label className="block text-xs font-medium text-gray-500 mb-2">
                                    Tipe Request
                                </label>
                                <select
                                    value={typeFilter}
                                    onChange={(e) => {
                                        setTypeFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-sm"
                                >
                                    <option value="all">Semua Tipe</option>
                                    <option value="password_reset">
                                        Reset Password
                                    </option>
                                    <option value="email_change">
                                        Ganti Email
                                    </option>
                                    <option value="phone_change">
                                        Ganti No Telepon
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Request List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center text-gray-500">
                                <svg
                                    className="animate-spin h-10 w-10 mx-auto mb-4 text-primary-600"
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
                                <p className="text-gray-600">Memuat data...</p>
                            </div>
                        ) : requests.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg
                                        className="w-10 h-10 text-gray-300"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                        />
                                    </svg>
                                </div>
                                <p className="text-gray-600 font-medium">
                                    Tidak ada request
                                </p>
                                <p className="text-gray-400 text-sm mt-1">
                                    Belum ada request bantuan dari user
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-100">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                User
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Tipe
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Detail
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Tanggal
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {requests.map((request) => (
                                            <tr
                                                key={request.id}
                                                className="hover:bg-gray-50 transition duration-150"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-800">
                                                            {
                                                                request.nama_lengkap
                                                            }
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-0.5">
                                                            {request.nim_nip}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-3 py-1 text-xs font-medium rounded-full ${getTypeBadgeColor(
                                                            request.type
                                                        )}`}
                                                    >
                                                        {getTypeLabel(
                                                            request.type
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-gray-700">
                                                        {
                                                            request.email_registered
                                                        }
                                                    </p>
                                                    {request.new_value && (
                                                        <p className="text-xs text-primary-600 mt-0.5 flex items-center">
                                                            <svg
                                                                className="w-3 h-3 mr-1"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                                                                />
                                                            </svg>
                                                            {request.new_value}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(
                                                            request.status
                                                        )}`}
                                                    >
                                                        {getStatusLabel(
                                                            request.status
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(
                                                        request.created_at
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedRequest(
                                                                request
                                                            );
                                                            setShowDetailModal(
                                                                true
                                                            );
                                                        }}
                                                        className="inline-flex items-center px-3 py-1.5 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition duration-200 text-sm font-medium"
                                                    >
                                                        <svg
                                                            className="w-4 h-4 mr-1"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                            />
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                            />
                                                        </svg>
                                                        Detail
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        {paginationMeta.last_page > 1 && (
                            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                                <p className="text-sm text-gray-600">
                                    Halaman{" "}
                                    <span className="font-medium">
                                        {paginationMeta.current_page}
                                    </span>{" "}
                                    dari{" "}
                                    <span className="font-medium">
                                        {paginationMeta.last_page}
                                    </span>
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() =>
                                            setCurrentPage((prev) =>
                                                Math.max(prev - 1, 1)
                                            )
                                        }
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-white transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Sebelumnya
                                    </button>
                                    <button
                                        onClick={() =>
                                            setCurrentPage((prev) =>
                                                Math.min(
                                                    prev + 1,
                                                    paginationMeta.last_page
                                                )
                                            )
                                        }
                                        disabled={
                                            currentPage ===
                                            paginationMeta.last_page
                                        }
                                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-white transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Selanjutnya
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <Footer />

            {/* Detail Modal */}
            {showDetailModal && selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">
                                        Detail Request
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        ID: #{selectedRequest.id}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition duration-200"
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
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>

                            {/* Request Info */}
                            <div className="space-y-4 mb-6">
                                <div className="flex gap-2">
                                    <span
                                        className={`px-3 py-1 text-xs font-medium rounded-full ${getTypeBadgeColor(
                                            selectedRequest.type
                                        )}`}
                                    >
                                        {getTypeLabel(selectedRequest.type)}
                                    </span>
                                    <span
                                        className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(
                                            selectedRequest.status
                                        )}`}
                                    >
                                        {getStatusLabel(selectedRequest.status)}
                                    </span>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-5 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                Nama Lengkap
                                            </p>
                                            <p className="font-semibold text-gray-800 mt-1">
                                                {selectedRequest.nama_lengkap}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                NIM/NIP
                                            </p>
                                            <p className="font-semibold text-gray-800 mt-1">
                                                {selectedRequest.nim_nip}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Email Terdaftar
                                        </p>
                                        <p className="font-semibold text-gray-800 mt-1">
                                            {selectedRequest.email_registered}
                                        </p>
                                    </div>
                                    {selectedRequest.user && (
                                        <div>
                                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                No Telepon Terdaftar
                                            </p>
                                            <p className="font-semibold text-gray-800 mt-1">
                                                {
                                                    selectedRequest.user
                                                        .no_telepon
                                                }
                                            </p>
                                        </div>
                                    )}
                                    {selectedRequest.new_value && (
                                        <div className="bg-primary-50 rounded-lg p-3 border border-primary-100">
                                            <p className="text-xs font-medium text-primary-600 uppercase tracking-wider">
                                                {selectedRequest.type ===
                                                "email_change"
                                                    ? "Email Baru"
                                                    : "No Telepon Baru"}
                                            </p>
                                            <p className="font-semibold text-primary-700 mt-1">
                                                {selectedRequest.new_value}
                                            </p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Tanggal Request
                                        </p>
                                        <p className="font-semibold text-gray-800 mt-1">
                                            {formatDate(
                                                selectedRequest.created_at
                                            )}
                                        </p>
                                    </div>
                                    {selectedRequest.admin_notes && (
                                        <div className="bg-rose-50 rounded-lg p-3 border border-rose-100">
                                            <p className="text-xs font-medium text-rose-600 uppercase tracking-wider">
                                                Catatan Admin
                                            </p>
                                            <p className="font-medium text-rose-700 mt-1">
                                                {selectedRequest.admin_notes}
                                            </p>
                                        </div>
                                    )}
                                    {selectedRequest.processed_by_admin && (
                                        <div>
                                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                Diproses Oleh
                                            </p>
                                            <p className="font-semibold text-gray-800 mt-1">
                                                {
                                                    selectedRequest
                                                        .processed_by_admin.nama
                                                }
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {selectedRequest.status === "pending" && (
                                <div className="space-y-3">
                                    <button
                                        onClick={() =>
                                            handleProcess(selectedRequest.id)
                                        }
                                        disabled={actionLoading}
                                        className="w-full py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition duration-200 disabled:opacity-50 font-semibold"
                                    >
                                        {actionLoading
                                            ? "Loading..."
                                            : "Mulai Proses"}
                                    </button>
                                    <button
                                        onClick={() => setShowRejectModal(true)}
                                        disabled={actionLoading}
                                        className="w-full py-3 border-2 border-rose-400 text-rose-500 rounded-xl hover:bg-rose-50 transition duration-200 disabled:opacity-50 font-semibold"
                                    >
                                        Tolak Request
                                    </button>
                                </div>
                            )}

                            {selectedRequest.status === "processing" && (
                                <div className="space-y-3">
                                    {selectedRequest.type ===
                                    "password_reset" ? (
                                        <button
                                            onClick={() =>
                                                handleResetPassword(
                                                    selectedRequest.id
                                                )
                                            }
                                            disabled={actionLoading}
                                            className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition duration-200 disabled:opacity-50 font-semibold"
                                        >
                                            {actionLoading
                                                ? "Loading..."
                                                : "Reset Password & Generate Baru"}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() =>
                                                handleApprove(
                                                    selectedRequest.id
                                                )
                                            }
                                            disabled={actionLoading}
                                            className="w-full py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition duration-200 disabled:opacity-50 font-semibold"
                                        >
                                            {actionLoading
                                                ? "Loading..."
                                                : "Setujui Perubahan"}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setShowRejectModal(true)}
                                        disabled={actionLoading}
                                        className="w-full py-3 border-2 border-rose-400 text-rose-500 rounded-xl hover:bg-rose-50 transition duration-200 disabled:opacity-50 font-semibold"
                                    >
                                        Tolak Request
                                    </button>
                                </div>
                            )}

                            {(selectedRequest.status === "completed" ||
                                selectedRequest.status === "rejected") && (
                                <div className="text-center py-4 bg-gray-50 rounded-xl">
                                    <p className="text-gray-500 font-medium">
                                        Request sudah{" "}
                                        {getStatusLabel(
                                            selectedRequest.status
                                        ).toLowerCase()}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center mb-4">
                                <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center mr-3">
                                    <svg
                                        className="w-5 h-5 text-rose-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">
                                    Tolak Request
                                </h3>
                            </div>
                            <p className="text-gray-600 mb-4">
                                Masukkan alasan penolakan:
                            </p>
                            <textarea
                                value={rejectReason}
                                onChange={(e) =>
                                    setRejectReason(e.target.value)
                                }
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                rows={4}
                                placeholder="Alasan penolakan..."
                            />
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => {
                                        setShowRejectModal(false);
                                        setRejectReason("");
                                    }}
                                    className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition duration-200 font-semibold"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={
                                        actionLoading || !rejectReason.trim()
                                    }
                                    className="flex-1 py-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition duration-200 disabled:opacity-50 font-semibold"
                                >
                                    {actionLoading ? "Loading..." : "Tolak"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Password Generated Modal */}
            {showPasswordModal && generatedPassword && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                        <div className="p-6">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg
                                        className="w-8 h-8 text-emerald-500"
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
                                <h3 className="text-xl font-bold text-gray-800">
                                    Password Berhasil Direset
                                </h3>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                <p className="text-sm text-gray-500 mb-2 font-medium">
                                    Password Baru:
                                </p>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 bg-white px-4 py-3 rounded-lg border border-gray-200 font-mono text-lg text-center font-bold text-primary-700">
                                        {generatedPassword.new_password}
                                    </code>
                                    <button
                                        onClick={() =>
                                            copyToClipboard(
                                                generatedPassword.new_password
                                            )
                                        }
                                        className="p-3 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition duration-200"
                                        title="Salin Password"
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
                                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                                <div className="flex items-start">
                                    <svg
                                        className="w-5 h-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                        />
                                    </svg>
                                    <p className="text-sm text-amber-700">
                                        <strong>Penting:</strong> Kirim password
                                        ini ke user melalui WhatsApp ke nomor:{" "}
                                        <strong>
                                            {generatedPassword.user_phone}
                                        </strong>
                                    </p>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Nama:</span>{" "}
                                    {generatedPassword.user_name}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    <span className="font-medium">Email:</span>{" "}
                                    {generatedPassword.user_email}
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    setShowPasswordModal(false);
                                    setGeneratedPassword(null);
                                }}
                                className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition duration-200 font-semibold"
                            >
                                Selesai
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Approve Success Modal - untuk ganti email/phone */}
            {showApproveSuccessModal && approvedData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                        <div className="p-6">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg
                                        className="w-8 h-8 text-emerald-500"
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
                                <h3 className="text-xl font-bold text-gray-800">
                                    {approvedData.type === "email_change"
                                        ? "Email Berhasil Diubah"
                                        : "No Telepon Berhasil Diubah"}
                                </h3>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">
                                        {approvedData.type === "email_change"
                                            ? "Email Lama:"
                                            : "No Telepon Lama:"}
                                    </p>
                                    <p className="text-sm text-gray-600 line-through">
                                        {approvedData.old_value}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">
                                        {approvedData.type === "email_change"
                                            ? "Email Baru:"
                                            : "No Telepon Baru:"}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-semibold text-primary-700">
                                            {approvedData.new_value}
                                        </p>
                                        <button
                                            onClick={() =>
                                                copyToClipboard(
                                                    approvedData.new_value
                                                )
                                            }
                                            className="p-1.5 bg-primary-50 text-primary-600 rounded hover:bg-primary-100 transition duration-200"
                                            title="Salin"
                                        >
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                                <div className="flex items-start">
                                    <svg
                                        className="w-5 h-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                        />
                                    </svg>
                                    <p className="text-sm text-amber-700">
                                        <strong>Penting:</strong> Informasikan
                                        perubahan ini ke user melalui WhatsApp
                                        ke nomor:{" "}
                                        <strong>
                                            {approvedData.user_phone}
                                        </strong>
                                    </p>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Nama:</span>{" "}
                                    {approvedData.user_name}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    <span className="font-medium">Email:</span>{" "}
                                    {approvedData.type === "email_change"
                                        ? approvedData.new_value
                                        : approvedData.user_email}
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    setShowApproveSuccessModal(false);
                                    setApprovedData(null);
                                }}
                                className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition duration-200 font-semibold"
                            >
                                Selesai
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BantuanUser;
