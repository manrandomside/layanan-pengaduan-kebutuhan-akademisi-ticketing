import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../config/axios";

const ForgotPassword = () => {
    const navigate = useNavigate();

    // Step: 0 = pilih metode, 1 = input email, 2 = verify token, 3 = reset password
    // Step: admin-form = form request admin, admin-success = sukses request admin
    const [step, setStep] = useState(0);
    const [method, setMethod] = useState(""); // "email" or "admin"

    // Form data for email method
    const [email, setEmail] = useState("");
    const [token, setToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Form data for admin method
    const [adminFormData, setAdminFormData] = useState({
        email: "",
        nama_lengkap: "",
        nim_nip: "",
    });

    // UI states
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Handle method selection
    const handleSelectMethod = (selectedMethod) => {
        setMethod(selectedMethod);
        setMessage({ type: "", text: "" });
        if (selectedMethod === "email") {
            setStep(1);
        } else {
            setStep("admin-form");
        }
    };

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

            // Check if it's a mail server error
            if (err.response?.data?.error_type === "transport_error") {
                setMessage({
                    type: "error",
                    text: "Server email tidak dapat dihubungi. Silakan gunakan metode 'Minta Bantuan Admin'.",
                });
            } else {
                setMessage({ type: "error", text: errorMsg });
            }
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

    // Handle admin form submission
    const handleAdminRequest = async (e) => {
        e.preventDefault();
        setMessage({ type: "", text: "" });

        if (
            !adminFormData.email ||
            !adminFormData.nama_lengkap ||
            !adminFormData.nim_nip
        ) {
            setMessage({ type: "error", text: "Semua field wajib diisi" });
            return;
        }

        setLoading(true);

        try {
            const response = await axiosInstance.post(
                "/auth/forgot-password/request-admin",
                adminFormData
            );
            setMessage({
                type: "success",
                text: response.data.message || "Request berhasil dikirim",
            });
            setStep("admin-success");
        } catch (err) {
            const errorMsg =
                err.response?.data?.message || "Gagal mengirim request";
            setMessage({ type: "error", text: errorMsg });
        }

        setLoading(false);
    };

    // Handle admin form input change
    const handleAdminFormChange = (e) => {
        const { name, value } = e.target;
        setAdminFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setMessage({ type: "", text: "" });
    };

    // Reset to method selection
    const handleBackToMethodSelection = () => {
        setStep(0);
        setMethod("");
        setMessage({ type: "", text: "" });
        setEmail("");
        setToken("");
        setNewPassword("");
        setConfirmPassword("");
        setAdminFormData({ email: "", nama_lengkap: "", nim_nip: "" });
    };

    // Get step title and description
    const getStepInfo = () => {
        switch (step) {
            case 0:
                return {
                    title: "Lupa Password",
                    description: "Pilih metode untuk reset password Anda",
                };
            case 1:
                return {
                    title: "Reset via Email",
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
            case "admin-form":
                return {
                    title: "Minta Bantuan Admin",
                    description:
                        "Isi data berikut untuk verifikasi identitas Anda",
                };
            case "admin-success":
                return {
                    title: "Request Terkirim",
                    description: "Request Anda sedang diproses oleh admin",
                };
            default:
                return { title: "", description: "" };
        }
    };

    // Get step indicator for email method
    const getEmailStepIndicator = () => {
        if (method !== "email") return null;
        const emailSteps = [1, 2, 3];
        return (
            <div className="flex justify-center items-center gap-2 mt-4">
                {emailSteps.map((s) => (
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
        );
    };

    // Get icon based on step
    const getStepIcon = () => {
        switch (step) {
            case 0:
                return (
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
                            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                );
            case 1:
                return (
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
                );
            case 2:
                return (
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
                );
            case 3:
                return (
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
                );
            case "admin-form":
                return (
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
                            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                        />
                    </svg>
                );
            case "admin-success":
                return (
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
                );
            default:
                return null;
        }
    };

    const stepInfo = getStepInfo();

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-white to-primary-50 px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div
                            className={`inline-block p-3 rounded-full mb-4 ${
                                step === "admin-success"
                                    ? "bg-green-100"
                                    : "bg-primary-100"
                            }`}
                        >
                            {getStepIcon()}
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            {stepInfo.title}
                        </h1>
                        <p className="text-gray-600">{stepInfo.description}</p>

                        {/* Step indicator for email method */}
                        {getEmailStepIndicator()}
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

                    {/* Step 0: Method Selection */}
                    {step === 0 && (
                        <div className="space-y-4">
                            <button
                                onClick={() => handleSelectMethod("email")}
                                className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition duration-200 text-left group"
                            >
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4 group-hover:bg-primary-200 transition duration-200">
                                        <svg
                                            className="w-6 h-6 text-primary-700"
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
                                    <div>
                                        <h3 className="font-semibold text-gray-800">
                                            Via Token Email
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Terima token 6 digit melalui email
                                        </p>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => handleSelectMethod("admin")}
                                className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition duration-200 text-left group"
                            >
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4 group-hover:bg-primary-200 transition duration-200">
                                        <svg
                                            className="w-6 h-6 text-primary-700"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800">
                                            Minta Bantuan Admin
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Admin akan reset password via
                                            WhatsApp
                                        </p>
                                    </div>
                                </div>
                            </button>
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

                            <button
                                type="button"
                                onClick={handleBackToMethodSelection}
                                className="w-full text-sm text-gray-600 hover:text-primary-700 font-medium"
                            >
                                Kembali pilih metode
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

                    {/* Admin Form: Request to Admin */}
                    {step === "admin-form" && (
                        <form
                            onSubmit={handleAdminRequest}
                            className="space-y-6"
                        >
                            <div>
                                <label
                                    htmlFor="admin-email"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Email Terdaftar
                                </label>
                                <input
                                    type="email"
                                    id="admin-email"
                                    name="email"
                                    value={adminFormData.email}
                                    onChange={handleAdminFormChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-200"
                                    placeholder="Email yang terdaftar di akun"
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="admin-nama"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Nama Lengkap
                                </label>
                                <input
                                    type="text"
                                    id="admin-nama"
                                    name="nama_lengkap"
                                    value={adminFormData.nama_lengkap}
                                    onChange={handleAdminFormChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-200"
                                    placeholder="Nama lengkap sesuai akun"
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="admin-nim"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    NIM/NIP
                                </label>
                                <input
                                    type="text"
                                    id="admin-nim"
                                    name="nim_nip"
                                    value={adminFormData.nim_nip}
                                    onChange={handleAdminFormChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-200"
                                    placeholder="NIM/NIP sesuai akun"
                                    disabled={loading}
                                />
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <p className="text-sm text-yellow-700">
                                    <strong>Catatan:</strong> Password baru akan
                                    dikirim oleh admin melalui WhatsApp ke nomor
                                    telepon yang terdaftar di akun Anda.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-primary-700 to-primary-800 hover:from-primary-800 hover:to-primary-900 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Mengirim..." : "Kirim Request"}
                            </button>

                            <button
                                type="button"
                                onClick={handleBackToMethodSelection}
                                className="w-full text-sm text-gray-600 hover:text-primary-700 font-medium"
                            >
                                Kembali pilih metode
                            </button>
                        </form>
                    )}

                    {/* Admin Success: Request Submitted */}
                    {step === "admin-success" && (
                        <div className="text-center space-y-6">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                <p className="text-green-700">
                                    Request Anda telah dikirim ke admin. Silakan
                                    tunggu konfirmasi melalui WhatsApp ke nomor
                                    telepon yang terdaftar di akun Anda.
                                </p>
                            </div>

                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-left">
                                <p className="text-sm text-gray-600 mb-2">
                                    <strong>Data yang dikirim:</strong>
                                </p>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>Email: {adminFormData.email}</li>
                                    <li>Nama: {adminFormData.nama_lengkap}</li>
                                    <li>NIM/NIP: {adminFormData.nim_nip}</li>
                                </ul>
                            </div>

                            <button
                                onClick={() => navigate("/login")}
                                className="w-full bg-gradient-to-r from-primary-700 to-primary-800 hover:from-primary-800 hover:to-primary-900 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-lg hover:shadow-xl"
                            >
                                Kembali ke Login
                            </button>
                        </div>
                    )}

                    {/* Back to Login Link */}
                    {step !== "admin-success" && (
                        <div className="mt-6 text-center text-sm text-gray-600">
                            <Link
                                to="/login"
                                className="text-primary-700 hover:text-primary-800 font-semibold"
                            >
                                Kembali ke Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
