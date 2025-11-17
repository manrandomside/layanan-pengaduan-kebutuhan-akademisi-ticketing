import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/admin/Navbar";
import axiosInstance from "../../config/axios";

const AnalisisLayanan = () => {
    const navigate = useNavigate();
    const [feedbacks, setFeedbacks] = useState([]);
    const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
    const [ratingFilter, setRatingFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [replyLoading, setReplyLoading] = useState(false);

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    useEffect(() => {
        filterFeedbacks();
    }, [ratingFilter, feedbacks]);

    const fetchFeedbacks = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get("/admin/feedbacks");
            setFeedbacks(response.data.data || []);
        } catch (error) {
            console.error("Error fetching feedbacks:", error);
        }
        setLoading(false);
    };

    const filterFeedbacks = () => {
        let filtered = feedbacks;

        if (ratingFilter !== "all") {
            filtered = filtered.filter(
                (f) => f.rating === parseInt(ratingFilter)
            );
        }

        setFilteredFeedbacks(filtered);
    };

    const handleReplyFeedback = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) {
            alert("Response tidak boleh kosong");
            return;
        }

        setReplyLoading(true);

        try {
            const response = await axiosInstance.post(
                `/admin/feedbacks/${selectedFeedback.feedback_id}/reply`,
                {
                    response_text: replyText,
                }
            );

            setMessage({
                type: "success",
                text:
                    response.data.message ||
                    "Response berhasil dikirim ke user",
            });
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
            setShowReplyModal(false);
            setReplyText("");
            setSelectedFeedback(null);
            fetchFeedbacks();
        } catch (error) {
            const errorMsg =
                error.response?.data?.message || "Gagal mengirim response";
            setMessage({ type: "error", text: errorMsg });
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        }

        setReplyLoading(false);
    };

    const openReplyModal = (feedback) => {
        setSelectedFeedback(feedback);
        setReplyText("");
        setShowReplyModal(true);
    };

    const closeReplyModal = () => {
        setShowReplyModal(false);
        setReplyText("");
        setSelectedFeedback(null);
    };

    const renderStars = (rating) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                        key={star}
                        className={`w-5 h-5 ${
                            star <= rating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                        }`}
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
                ))}
            </div>
        );
    };

    const getRatingBadgeColor = (rating) => {
        if (rating >= 4) return "bg-green-100 text-green-700 border-green-200";
        if (rating === 3)
            return "bg-yellow-100 text-yellow-700 border-yellow-200";
        return "bg-red-100 text-red-700 border-red-200";
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
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
                        Analisis Layanan
                    </h1>
                    <p className="text-gray-600">
                        Lihat dan tanggapi feedback dari pengguna
                    </p>
                </div>

                {/* Success/Error Message */}
                {message.text && (
                    <div
                        className={`mb-6 p-4 rounded-lg border ${
                            message.type === "success"
                                ? "bg-green-50 border-green-200 text-green-700"
                                : "bg-red-50 border-red-200 text-red-700"
                        }`}
                    >
                        {message.text}
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Filter Rating
                            </label>
                            <select
                                value={ratingFilter}
                                onChange={(e) =>
                                    setRatingFilter(e.target.value)
                                }
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="all">Semua Rating</option>
                                <option value="5">5 Bintang</option>
                                <option value="4">4 Bintang</option>
                                <option value="3">3 Bintang</option>
                                <option value="2">2 Bintang</option>
                                <option value="1">1 Bintang</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="px-4 py-2 bg-gray-100 rounded-lg">
                                <span className="text-sm text-gray-600">
                                    Total Feedback:{" "}
                                    <span className="font-bold text-gray-800">
                                        {filteredFeedbacks.length}
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feedbacks List */}
                {filteredFeedbacks.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                        <svg
                            className="mx-auto h-16 w-16 text-gray-400 mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                            />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-800 mb-2">
                            Belum ada feedback
                        </h3>
                        <p className="text-gray-600">
                            Feedback dari pengguna akan muncul di sini
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredFeedbacks.map((feedback) => (
                            <div
                                key={feedback.feedback_id}
                                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition duration-200"
                            >
                                {/* Feedback Header */}
                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 pb-4 border-b border-gray-200">
                                    <div className="flex items-start gap-4 mb-4 md:mb-0">
                                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-white font-bold text-lg">
                                                {feedback.user?.nama_lengkap
                                                    ?.charAt(0)
                                                    .toUpperCase() || "U"}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800">
                                                {feedback.user?.nama_lengkap ||
                                                    "User"}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                                <span className="text-sm text-gray-600">
                                                    {feedback.user?.nim_nip ||
                                                        "-"}
                                                </span>
                                                <span className="text-gray-400">
                                                    •
                                                </span>
                                                <span className="text-sm text-gray-600 capitalize">
                                                    {feedback.user?.status ||
                                                        "-"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-start md:items-end gap-2">
                                        {renderStars(feedback.rating)}
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getRatingBadgeColor(
                                                feedback.rating
                                            )}`}
                                        >
                                            Rating: {feedback.rating}/5
                                        </span>
                                    </div>
                                </div>

                                {/* Related Complaint Info */}
                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <div className="flex items-start gap-2 mb-2">
                                        <svg
                                            className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0"
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
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-700 mb-1">
                                                Terkait Keluhan:{" "}
                                                <span className="font-mono text-green-600">
                                                    {feedback.complaint
                                                        ?.ticket_id || "-"}
                                                </span>
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {feedback.complaint?.keluhan ||
                                                    "-"}
                                            </p>
                                            <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-600">
                                                {feedback.complaint?.kelas && (
                                                    <span>
                                                        Kelas:{" "}
                                                        {
                                                            feedback.complaint
                                                                .kelas
                                                        }
                                                    </span>
                                                )}
                                                {feedback.complaint?.lab && (
                                                    <>
                                                        <span>•</span>
                                                        <span>
                                                            Lab:{" "}
                                                            {
                                                                feedback
                                                                    .complaint
                                                                    .lab
                                                            }
                                                        </span>
                                                    </>
                                                )}
                                                {feedback.complaint
                                                    ?.ruangan && (
                                                    <>
                                                        <span>•</span>
                                                        <span>
                                                            Ruangan:{" "}
                                                            {
                                                                feedback
                                                                    .complaint
                                                                    .ruangan
                                                            }
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Feedback Text */}
                                {feedback.feedback_text && (
                                    <div className="mb-4">
                                        <p className="text-sm font-medium text-gray-700 mb-2">
                                            Feedback dari User:
                                        </p>
                                        <p className="text-gray-700 bg-blue-50 p-4 rounded-lg border border-blue-100">
                                            "{feedback.feedback_text}"
                                        </p>
                                    </div>
                                )}

                                {/* Responses */}
                                {feedback.responses &&
                                    feedback.responses.length > 0 && (
                                        <div className="mb-4">
                                            <p className="text-sm font-medium text-gray-700 mb-3">
                                                Tanggapan Admin:
                                            </p>
                                            <div className="space-y-3">
                                                {feedback.responses.map(
                                                    (response) => (
                                                        <div
                                                            key={
                                                                response.response_id
                                                            }
                                                            className="bg-green-50 p-4 rounded-lg border border-green-200"
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                                    <svg
                                                                        className="w-4 h-4 text-white"
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
                                                                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                                                        />
                                                                    </svg>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-gray-800">
                                                                        {
                                                                            response.response_text
                                                                        }
                                                                    </p>
                                                                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                                                                        <span className="font-medium">
                                                                            {response
                                                                                .admin
                                                                                ?.nama ||
                                                                                "Admin"}
                                                                        </span>
                                                                        <span>
                                                                            •
                                                                        </span>
                                                                        <span>
                                                                            {formatDate(
                                                                                response.created_at
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}

                                {/* Action Buttons */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                    <p className="text-xs text-gray-500">
                                        Dikirim pada{" "}
                                        {formatDate(feedback.created_at)}
                                    </p>
                                    <button
                                        onClick={() => openReplyModal(feedback)}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 text-sm font-medium flex items-center gap-2"
                                        style={{ backgroundColor: "#439454" }}
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
                                                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                            />
                                        </svg>
                                        Balas Feedback
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Reply Modal */}
            {showReplyModal && selectedFeedback && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-800">
                                    Balas Feedback
                                </h2>
                                <button
                                    onClick={closeReplyModal}
                                    className="text-gray-400 hover:text-gray-600"
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
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleReplyFeedback} className="p-6">
                            {/* Feedback Info */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                                        <span className="text-white font-bold">
                                            {selectedFeedback.user?.nama_lengkap
                                                ?.charAt(0)
                                                .toUpperCase() || "U"}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">
                                            {selectedFeedback.user
                                                ?.nama_lengkap || "User"}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            {renderStars(
                                                selectedFeedback.rating
                                            )}
                                            <span className="text-sm text-gray-600">
                                                ({selectedFeedback.rating}/5)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {selectedFeedback.feedback_text && (
                                    <p className="text-sm text-gray-700 bg-white p-3 rounded border border-gray-200">
                                        "{selectedFeedback.feedback_text}"
                                    </p>
                                )}
                            </div>

                            {/* Reply Text */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tanggapan Anda
                                </label>
                                <textarea
                                    value={replyText}
                                    onChange={(e) =>
                                        setReplyText(e.target.value)
                                    }
                                    rows="6"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Tulis tanggapan Anda untuk feedback ini..."
                                    disabled={replyLoading}
                                    required
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={closeReplyModal}
                                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition duration-200"
                                    disabled={replyLoading}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={replyLoading || !replyText.trim()}
                                    className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: "#439454" }}
                                >
                                    {replyLoading
                                        ? "Mengirim..."
                                        : "Kirim Tanggapan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalisisLayanan;
