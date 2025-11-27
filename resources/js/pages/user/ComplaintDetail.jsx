import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Navbar from "../../Components/user/Navbar";
import Footer from "../../Components/user/Footer";
import axiosInstance from "../../config/axios";

const ComplaintDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchComplaintDetail();
    }, [id]);

    // Real-time status updates
    useEffect(() => {
        if (!user?.user_id || !complaint) return;

        const channel = window.Echo.private(`user.${user.user_id}`);

        channel.listen("ComplaintStatusChanged", (event) => {
            if (event.complaint_id === parseInt(id)) {
                setComplaint((prev) => ({
                    ...prev,
                    status: event.new_status,
                }));
            }
        });

        return () => {
            channel.stopListening("ComplaintStatusChanged");
            window.Echo.leave(`user.${user.user_id}`);
        };
    }, [user?.user_id, complaint, id]);

    const fetchComplaintDetail = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/user/complaints/${id}`);
            setComplaint(response.data.data);
        } catch (error) {
            console.error("Error fetching complaint detail:", error);
            alert("Gagal memuat detail keluhan");
            navigate("/keluhan/list");
        }
        setLoading(false);
    };

    const getStatusBadge = (status) => {
        const badges = {
            waiting: "bg-yellow-100 text-yellow-800 border-yellow-200",
            on_progress: "bg-blue-100 text-blue-800 border-blue-200",
            done: "bg-primary-100 text-primary-800 border-primary-200",
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
                </div>
            </div>
        );
    }

    if (!complaint) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white rounded-xl shadow-md p-8 text-center">
                        <p className="text-gray-600">Keluhan tidak ditemukan</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <button
                        onClick={() => navigate("/keluhan/list")}
                        className="flex items-center text-gray-600 hover:text-primary-700 mb-4"
                    >
                        <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                        Kembali ke Daftar Keluhan
                    </button>

                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Detail Keluhan
                    </h1>
                    <p className="text-gray-600">
                        Informasi lengkap tentang keluhan Anda
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Status & Info Card */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex flex-wrap items-center gap-3 mb-6">
                            <span className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-mono font-semibold rounded-lg">
                                {complaint.ticket_id}
                            </span>
                            <span
                                className={`px-4 py-2 rounded-lg text-sm font-medium border-2 ${getStatusBadge(
                                    complaint.status
                                )}`}
                            >
                                {getStatusText(complaint.status)}
                            </span>
                            <span
                                className={`px-4 py-2 rounded-lg text-sm font-medium border-2 ${getPriorityBadge(
                                    complaint.priority
                                )}`}
                            >
                                Priority: {getPriorityText(complaint.priority)}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Nama Lengkap
                                </label>
                                <p className="text-gray-800 font-medium">
                                    {complaint.nama_lengkap}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    NIM/NIP
                                </label>
                                <p className="text-gray-800 font-medium">
                                    {complaint.nim_nip}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Email
                                </label>
                                <p className="text-gray-800 font-medium">
                                    {complaint.email}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    No Telepon
                                </label>
                                <p className="text-gray-800 font-medium">
                                    {complaint.no_telepon}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Status User
                                </label>
                                <p className="text-gray-800 font-medium capitalize">
                                    {complaint.status_user}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Tanggal Pengajuan
                                </label>
                                <p className="text-gray-800 font-medium">
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
                        </div>
                    </div>

                    {/* Detail Lokasi */}
                    {(complaint.kelas ||
                        complaint.lab ||
                        complaint.ruangan) && (
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">
                                Detail Lokasi
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {complaint.kelas && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Kelas
                                        </label>
                                        <p className="text-gray-800 font-medium">
                                            {complaint.kelas}
                                        </p>
                                    </div>
                                )}
                                {complaint.lab && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Lab
                                        </label>
                                        <p className="text-gray-800 font-medium">
                                            {complaint.lab}
                                        </p>
                                    </div>
                                )}
                                {complaint.ruangan && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Ruangan
                                        </label>
                                        <p className="text-gray-800 font-medium">
                                            {complaint.ruangan}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Keluhan */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            Keluhan
                        </h2>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <p className="text-gray-800 whitespace-pre-wrap">
                                {complaint.keluhan}
                            </p>
                        </div>
                    </div>

                    {/* Response dari Admin */}
                    {complaint.responses && complaint.responses.length > 0 && (
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">
                                Tanggapan Admin
                            </h2>
                            <div className="space-y-4">
                                {complaint.responses.map((response, index) => (
                                    <div
                                        key={index}
                                        className="bg-primary-50 rounded-lg p-4 border border-primary-200"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <svg
                                                className="w-5 h-5 text-primary-700"
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
                                            <span className="font-semibold text-primary-800">
                                                Admin
                                            </span>
                                            <span className="text-xs text-primary-600">
                                                {new Date(
                                                    response.created_at
                                                ).toLocaleDateString("id-ID", {
                                                    day: "numeric",
                                                    month: "long",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </div>
                                        <p className="text-gray-800 whitespace-pre-wrap">
                                            {response.response_text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            {complaint.status === "done" && (
                                <button
                                    onClick={() =>
                                        navigate(
                                            `/feedback/${complaint.complaint_id}`
                                        )
                                    }
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-700 to-primary-800 hover:from-primary-800 hover:to-primary-900 text-white font-semibold rounded-lg transition duration-200 shadow-lg hover:shadow-xl"
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
                                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                        />
                                    </svg>
                                    Beri Rating & Feedback
                                </button>
                            )}
                            <button
                                onClick={() => navigate("/keluhan/list")}
                                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition duration-200"
                            >
                                Kembali ke Daftar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ComplaintDetail;
