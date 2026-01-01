import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../config/axios";

const ForgotPassword = () => {
    const navigate = useNavigate();

    // Step: 1 = input email, 2 = verify token, 3 = reset password
    const [step, setStep] = useState(1);

    // Form data
    const [email, setEmail] = useState("");
    const [token, setToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // UI states
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Step 1: Send token to email
    const handleSendToken = async (e) => {
        e.preventDefault();
        setMessage({ type: "", text: "" });

        if (!email) {
            setMessage({ type: "error", text: "Email wajib diisi" });
            return;
        }

        setLoading(true);

        try {
            const response = await axiosInstance.post("/auth/forgot-password", {
                email,
            });
            setMessage({
                type: "success",
                text:
                    response.data.message ||
                    "Token reset password telah dikirim ke email Anda",
            });
            setStep(2);
        } catch (err) {
            const errorMsg =
                err.response?.data?.message || "Gagal mengirim token";
            setMessage({ type: "error", text: errorMsg });
        }

        setLoading(false);
    };

    // Step 2: Verify token
    const handleVerifyToken = async (e) => {
        e.preventDefault();
        setMessage({ type: "", text: "" });

        if (!token) {
            setMessage({ type: "error", text: "Token wajib diisi" });
            return;
        }

        if (token.length !== 6) {
            setMessage({ type: "error", text: "Token harus 6 digit" });
            return;
        }

        setLoading(true);

        try {
            const response = await axiosInstance.post(
                "/auth/forgot-password/verify-token",
                {
                    email,
                    token,
                }
            );
            setMessage({
                type: "success",
                text: response.data.message || "Token berhasil diverifikasi",
            });
            setStep(3);
        } catch (err) {
            const errorMsg =
                err.response?.data?.message ||
                "Token tidak valid atau sudah kadaluarsa";
            setMessage({ type: "error", text: errorMsg });
        }

        setLoading(false);
    };

    // Step 3: Reset password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setMessage({ type: "", text: "" });

        if (!newPassword || !confirmPassword) {
            setMessage({ type: "error", text: "Password wajib diisi" });
            return;
        }

        if (newPassword.length < 6) {
            setMessage({ type: "error", text: "Password minimal 6 karakter" });
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage({
                type: "error",
                text: "Konfirmasi password tidak cocok",
            });
            return;
        }

        setLoading(true);

        try {
            const response = await axiosInstance.post(
                "/auth/forgot-password/reset-password",
                {
                    email,
                    token,
                    new_password: newPassword,
                    new_password_confirmation: confirmPassword,
                }
            );
            setMessage({
                type: "success",
                text: response.data.message || "Password berhasil direset",
            });

            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err) {
            const errorMsg =
                err.response?.data?.message || "Gagal mereset password";
            setMessage({ type: "error", text: errorMsg });
        }

        setLoading(false);
    };

    // Resend token
    const handleResendToken = async () => {
        setMessage({ type: "", text: "" });
        setLoading(true);

        try {
            const response = await axiosInstance.post("/auth/forgot-password", {
                email,
            });
            setMessage({
                type: "success",
                text: "Token baru telah dikirim ke email Anda",
            });
            setToken("");
        } catch (err) {
            const errorMsg =
                err.response?.data?.message || "Gagal mengirim ulang token";
            setMessage({ type: "error", text: errorMsg });
        }

        setLoading(false);
    };

    // Get step title and description
    const getStepInfo = () => {
        switch (step) {
            case 1:
                return {
                    title: "Lupa Password",
                    description:
                        "Masukkan email Anda untuk menerima token reset password",
                };
            case 2:
                return {
                    title: "Verifikasi Token",
                    description: `Masukkan token 6 digit yang dikirim ke ${email}`,
                };
            case 3:
                return {
                    title: "Buat Password Baru",
                    description: "Masukkan password baru Anda",
                };
            default:
                return { title: "", description: "" };
        }
    };

    const stepInfo = getStepInfo();

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-white to-primary-50 px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-block p-3 bg-primary-100 rounded-full mb-4">
                            {step === 1 && (
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
                            )}
                            {step === 2 && (
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
                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                    />
                                </svg>
                            )}
                            {step === 3 && (
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
                                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                                    />
                                </svg>
                            )}
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            {stepInfo.title}
                        </h1>
                        <p className="text-gray-600">{stepInfo.description}</p>

                        {/* Step indicator */}
                        <div className="flex justify-center items-center gap-2 mt-4">
                            {[1, 2, 3].map((s) => (
                                <div
                                    key={s}
                                    className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                                        s === step
                                            ? "bg-primary-700 w-6"
                                            : s < step
                                            ? "bg-primary-400"
                                            : "bg-gray-300"
                                    }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Message Alert */}
                    {message.text && (
                        <div
                            className={`mb-6 p-4 rounded-lg ${
                                message.type === "success"
                                    ? "bg-green-50 border border-green-200"
                                    : "bg-red-50 border border-red-200"
                            }`}
                        >
                            <p
                                className={`text-sm ${
                                    message.type === "success"
                                        ? "text-green-700"
                                        : "text-red-600"
                                }`}
                            >
                                {message.text}
                            </p>
                        </div>
                    )}

                    {/* Step 1: Input Email */}
                    {step === 1 && (
                        <form onSubmit={handleSendToken} className="space-y-6">
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
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setMessage({ type: "", text: "" });
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
                                {loading ? "Mengirim..." : "Kirim Token"}
                            </button>
                        </form>
                    )}

                    {/* Step 2: Verify Token */}
                    {step === 2 && (
                        <form
                            onSubmit={handleVerifyToken}
                            className="space-y-6"
                        >
                            <div>
                                <label
                                    htmlFor="token"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Token Verifikasi
                                </label>
                                <input
                                    type="text"
                                    id="token"
                                    value={token}
                                    onChange={(e) => {
                                        const value = e.target.value
                                            .replace(/\D/g, "")
                                            .slice(0, 6);
                                        setToken(value);
                                        setMessage({ type: "", text: "" });
                                    }}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-200 text-center text-2xl tracking-widest font-mono"
                                    placeholder="000000"
                                    maxLength={6}
                                    disabled={loading}
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Masukkan 6 digit token yang dikirim ke email
                                    Anda
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || token.length !== 6}
                                className="w-full bg-gradient-to-r from-primary-700 to-primary-800 hover:from-primary-800 hover:to-primary-900 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading
                                    ? "Memverifikasi..."
                                    : "Verifikasi Token"}
                            </button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={handleResendToken}
                                    disabled={loading}
                                    className="text-sm text-primary-700 hover:text-primary-800 font-medium disabled:opacity-50"
                                >
                                    Kirim Ulang Token
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Step 3: Reset Password */}
                    {step === 3 && (
                        <form
                            onSubmit={handleResetPassword}
                            className="space-y-6"
                        >
                            <div>
                                <label
                                    htmlFor="newPassword"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Password Baru
                                </label>
                                <div className="relative">
                                    <input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        id="newPassword"
                                        value={newPassword}
                                        onChange={(e) => {
                                            setNewPassword(e.target.value);
                                            setMessage({ type: "", text: "" });
                                        }}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-200"
                                        placeholder="Minimal 6 karakter"
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? (
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
                                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
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
                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Konfirmasi Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        id="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value);
                                            setMessage({ type: "", text: "" });
                                        }}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-200"
                                        placeholder="Ulangi password baru"
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword
                                            )
                                        }
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showConfirmPassword ? (
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
                                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
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
                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-primary-700 to-primary-800 hover:from-primary-800 hover:to-primary-900 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Menyimpan..." : "Reset Password"}
                            </button>
                        </form>
                    )}

                    {/* Back to Login Link */}
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
