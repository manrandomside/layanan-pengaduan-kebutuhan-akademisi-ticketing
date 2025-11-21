import React, { useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../config/axios";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        if (!email) {
            setError("Email wajib diisi");
            setLoading(false);
            return;
        }

        try {
            const response = await axiosInstance.post("/auth/forgot-password", {
                email,
            });

            setSuccess(
                response.data.message ||
                    "Link reset password telah dikirim ke email Anda"
            );
            setEmail("");
        } catch (err) {
            const message =
                err.response?.data?.message ||
                "Gagal mengirim link reset password";
            setError(message);
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-primary-50 px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <div className="inline-block p-3 bg-primary-100 rounded-full mb-4">
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
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            Lupa Password
                        </h1>
                        <p className="text-gray-600">
                            Masukkan email Anda untuk menerima link reset
                            password
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
                            <p className="text-primary-700 text-sm">
                                {success}
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError("");
                                    setSuccess("");
                                }}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-200"
                                placeholder="contoh@email.com"
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-primary-700 to-primary-800 hover:from-primary-800 hover:to-primary-900 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading
                                ? "Mengirim..."
                                : "Kirim Link Reset Password"}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-600">
                        <Link
                            to="/login"
                            className="text-primary-700 hover:text-primary-800 font-semibold"
                        >
                            Kembali ke Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
