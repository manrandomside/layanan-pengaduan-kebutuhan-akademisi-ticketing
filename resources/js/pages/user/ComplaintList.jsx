import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Navbar from "../../Components/user/Navbar";
import Footer from "../../Components/user/Footer";
import axiosInstance from "../../config/axios";

const ComplaintList = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [complaints, setComplaints] = useState([]);
    const [filteredComplaints, setFilteredComplaints] = useState([]);
    const [statusFilter, setStatusFilter] = useState("all");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchComplaints();
    }, []);

    // Subscribe to real-time status updates and hide/unhide events
    useEffect(() => {
        if (!user?.user_id) return;

        const channel = window.Echo.private(`user.${user.user_id}`);

        // Listen for status changes
        channel.listen(".ComplaintStatusChanged", (event) => {
            console.log("ComplaintStatusChanged received:", event);

            setComplaints((prev) =>
                prev.map((complaint) =>
                    complaint.complaint_id === event.complaint_id
                        ? { ...complaint, status: event.new_status }
                        : complaint
                )
            );
        });

        // Listen for hide/unhide actions
        channel.listen(".ComplaintHidden", (event) => {
            console.log("ComplaintHidden received in ComplaintList:", event);

            setComplaints((prev) =>
                prev.map((complaint) =>
                    complaint.complaint_id === event.complaint_id
                        ? { ...complaint, is_hidden: event.is_hidden }
                        : complaint
                )
            );
        });

        return () => {
            channel.stopListening(".ComplaintStatusChanged");
            channel.stopListening(".ComplaintHidden");
            window.Echo.leave(`user.${user.user_id}`);
        };
    }, [user?.user_id]);

    useEffect(() => {
        filterComplaints();
    }, [statusFilter, complaints]);

    const fetchComplaints = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(
                "/user/complaints/my-complaints"
            );
            setComplaints(response.data.data || []);
        } catch (error) {
            console.error("Error fetching complaints:", error);
        }
        setLoading(false);
    };

    const filterComplaints = () => {
        if (statusFilter === "all") {
            setFilteredComplaints(complaints);
        } else {
            const filtered = complaints.filter(
                (complaint) => complaint.status === statusFilter
            );
            setFilteredComplaints(filtered);
        }
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

    const getStatusCount = (status) => {
        if (status === "all") return complaints.length;
        return complaints.filter((c) => c.status === status).length;
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <button
                        onClick={() => navigate("/dashboard")}
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
                        Kembali ke Dashboard
                    </button>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                Keluhan Saya
                            </h1>
                            <p className="text-gray-600">
                                Daftar semua keluhan yang telah Anda ajukan
                            </p>
                        </div>
                        <button
                            onClick={() => navigate("/keluhan")}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-700 to-primary-800 hover:from-primary-800 hover:to-primary-900 text-white font-semibold rounded-lg transition duration-200 shadow-lg hover:shadow-xl"
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
                            Buat Keluhan Baru
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-2 mb-6">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setStatusFilter("all")}
                            className={`flex-1 sm:flex-none px-6 py-3 rounded-lg font-medium transition duration-200 ${
                                statusFilter === "all"
                                    ? "bg-primary-700 text-white shadow-lg"
                                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            Semua ({getStatusCount("all")})
                        </button>
                        <button
                            onClick={() => setStatusFilter("waiting")}
                            className={`flex-1 sm:flex-none px-6 py-3 rounded-lg font-medium transition duration-200 ${
                                statusFilter === "waiting"
                                    ? "bg-yellow-500 text-white shadow-lg"
                                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            Menunggu ({getStatusCount("waiting")})
                        </button>
                        <button
                            onClick={() => setStatusFilter("on_progress")}
                            className={`flex-1 sm:flex-none px-6 py-3 rounded-lg font-medium transition duration-200 ${
                                statusFilter === "on_progress"
                                    ? "bg-blue-500 text-white shadow-lg"
                                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            Diproses ({getStatusCount("on_progress")})
                        </button>
                        <button
                            onClick={() => setStatusFilter("done")}
                            className={`flex-1 sm:flex-none px-6 py-3 rounded-lg font-medium transition duration-200 ${
                                statusFilter === "done"
                                    ? "bg-primary-600 text-white shadow-lg"
                                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            Selesai ({getStatusCount("done")})
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
                    </div>
                ) : filteredComplaints.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                        <svg
                            className="w-16 h-16 text-gray-400 mx-auto mb-4"
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
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            Tidak ada keluhan
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {statusFilter === "all"
                                ? "Anda belum mengajukan keluhan apapun"
                                : `Tidak ada keluhan dengan status ${getStatusText(
                                      statusFilter
                                  ).toLowerCase()}`}
                        </p>
                        <button
                            onClick={() => navigate("/keluhan")}
                            className="px-6 py-3 bg-primary-700 text-white rounded-lg hover:bg-primary-800 transition duration-200"
                        >
                            Buat Keluhan Pertama
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredComplaints.map((complaint) => (
                            <div
                                key={complaint.complaint_id}
                                onClick={() =>
                                    navigate(
                                        `/keluhan/${complaint.complaint_id}`
                                    )
                                }
                                className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition duration-200 cursor-pointer border-2 border-transparent hover:border-primary-500"
                            >
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-3">
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
                                                Priority:{" "}
                                                {getPriorityText(
                                                    complaint.priority
                                                )}
                                            </span>
                                            {complaint.is_hidden ===
                                                "hidden" && (
                                                <span className="px-3 py-1 rounded-full text-xs font-medium border bg-yellow-100 text-yellow-700 border-yellow-300 flex items-center gap-1">
                                                    <svg
                                                        className="w-3 h-3"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                                        />
                                                    </svg>
                                                    Disembunyikan oleh Admin
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                            {complaint.keluhan}
                                        </h3>

                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                                            {complaint.kelas && (
                                                <div className="flex items-center gap-1">
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
                                                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                                        />
                                                    </svg>
                                                    <span>
                                                        Kelas: {complaint.kelas}
                                                    </span>
                                                </div>
                                            )}
                                            {complaint.lab && (
                                                <div className="flex items-center gap-1">
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
                                                            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                                                        />
                                                    </svg>
                                                    <span>
                                                        Lab: {complaint.lab}
                                                    </span>
                                                </div>
                                            )}
                                            {complaint.ruangan && (
                                                <div className="flex items-center gap-1">
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
                                                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                                        />
                                                    </svg>
                                                    <span>
                                                        Ruangan:{" "}
                                                        {complaint.ruangan}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-xs text-gray-500">
                                            Diajukan:{" "}
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

                                    <div className="flex flex-col gap-2">
                                        {complaint.status === "done" && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(
                                                        `/feedback/${complaint.complaint_id}`
                                                    );
                                                }}
                                                className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition duration-200 text-sm font-medium"
                                            >
                                                Beri Feedback
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(
                                                    `/keluhan/${complaint.complaint_id}`
                                                );
                                            }}
                                            className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200 text-sm font-medium"
                                        >
                                            Lihat Detail
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default ComplaintList;
