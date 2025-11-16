import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/user/Navbar";
import axiosInstance from "../../config/axios";

const FeedbackForm = () => {
    const navigate = useNavigate();
    const { complaintId } = useParams();
    const [complaint, setComplaint] = useState(null);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [feedbackText, setFeedbackText] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchComplaintDetail();
    }, [complaintId]);

    const fetchComplaintDetail = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(
                `/user/complaints/${complaintId}`
            );
            const complaintData = response.data.data;

            if (complaintData.status !== "done") {
                alert(
                    "Feedback hanya dapat diberikan untuk keluhan yang sudah selesai"
                );
                navigate("/keluhan/list");
                return;
            }

            setComplaint(complaintData);
        } catch (error) {
            console.error("Error fetching complaint:", error);
            alert("Gagal memuat data keluhan");
            navigate("/keluhan/list");
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (rating === 0) {
            setError("Rating wajib dipilih");
            return;
        }

        setSubmitting(true);

        try {
            const response = await axiosInstance.post("/user/feedbacks", {
                complaint_id: complaintId,
                rating: rating,
                feedback_text: feedbackText || null,
            });

            alert(response.data.message || "Feedback berhasil dikirim!");
            navigate("/keluhan/list");
        } catch (error) {
            const message =
                error.response?.data?.message || "Gagal mengirim feedback";
            setError(message);
        }

        setSubmitting(false);
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

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <button
                        onClick={() => navigate(`/keluhan/${complaintId}`)}
                        className="flex items-center text-gray-600 hover:text-green-600 mb-4"
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
                        Kembali ke Detail Keluhan
                    </button>

                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Beri Rating & Feedback
                    </h1>
                    <p className="text-gray-600">
                        Bagaimana pengalaman Anda dengan layanan kami?
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-md p-8">
                    {/* Complaint Info */}
                    {complaint && (
                        <div className="mb-8 pb-8 border-b border-gray-200">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <svg
                                        className="w-6 h-6 text-green-600"
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
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                                        Keluhan Telah Selesai
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-2">
                                        {complaint.keluhan}
                                    </p>
                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-mono rounded-full">
                                        {complaint.ticket_id}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Rating Stars */}
                        <div>
                            <label className="block text-lg font-semibold text-gray-800 mb-4 text-center">
                                Berikan Rating{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <div className="flex justify-center items-center gap-2 mb-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() =>
                                            setHoverRating(star)
                                        }
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="transition-transform duration-150 hover:scale-110"
                                    >
                                        <svg
                                            className={`w-12 h-12 sm:w-16 sm:h-16 ${
                                                star <= (hoverRating || rating)
                                                    ? "text-yellow-400 fill-current"
                                                    : "text-gray-300"
                                            }`}
                                            fill={
                                                star <= (hoverRating || rating)
                                                    ? "currentColor"
                                                    : "none"
                                            }
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                            />
                                        </svg>
                                    </button>
                                ))}
                            </div>
                            <div className="text-center">
                                {rating > 0 && (
                                    <p className="text-gray-600 text-sm mt-2">
                                        Anda memberikan rating{" "}
                                        <span className="font-bold text-green-600">
                                            {rating} dari 5 bintang
                                        </span>
                                    </p>
                                )}
                                {rating === 0 && (
                                    <p className="text-gray-500 text-sm mt-2">
                                        Klik bintang untuk memberikan rating
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Feedback Text */}
                        <div>
                            <label
                                htmlFor="feedbackText"
                                className="block text-lg font-semibold text-gray-800 mb-2"
                            >
                                Feedback Anda{" "}
                                <span className="text-gray-500 text-sm font-normal">
                                    (Opsional)
                                </span>
                            </label>
                            <textarea
                                id="feedbackText"
                                value={feedbackText}
                                onChange={(e) =>
                                    setFeedbackText(e.target.value)
                                }
                                rows="6"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Bagikan pengalaman Anda dengan layanan kami... Apa yang berjalan dengan baik? Apa yang bisa ditingkatkan?"
                                disabled={submitting}
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                Feedback Anda akan membantu kami meningkatkan
                                kualitas layanan
                            </p>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() =>
                                    navigate(`/keluhan/${complaintId}`)
                                }
                                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition duration-200"
                                disabled={submitting}
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={submitting || rating === 0}
                                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ backgroundColor: "#439454" }}
                            >
                                {submitting ? "Mengirim..." : "Kirim Feedback"}
                            </button>
                        </div>
                    </form>

                    {/* Info Box */}
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-3">
                            <svg
                                className="w-5 h-5 text-blue-600 mt-0.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <div>
                                <p className="text-sm text-blue-800 font-medium mb-1">
                                    Informasi
                                </p>
                                <p className="text-xs text-blue-700">
                                    Rating dan feedback Anda akan diterima oleh
                                    admin. Admin dapat merespons feedback Anda,
                                    dan Anda akan menerima notifikasi jika ada
                                    tanggapan dari admin.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeedbackForm;
