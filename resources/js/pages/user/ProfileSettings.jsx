import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Navbar from "../../Components/user/Navbar";
import Footer from "../../Components/user/Footer";
import axiosInstance from "../../config/axios";

const ProfileSettings = () => {
    const navigate = useNavigate();
    const { user, checkAuth } = useAuth();

    const [activeTab, setActiveTab] = useState("profile");

    // Profile Form
    const [profileData, setProfileData] = useState({
        nama_lengkap: user?.nama_lengkap || "",
        nim_nip: user?.nim_nip || "",
        status: user?.status || "",
    });
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileMessage, setProfileMessage] = useState({
        type: "",
        text: "",
    });

    // Email/Phone Update - Method selection
    const [emailMethod, setEmailMethod] = useState("");
    const [phoneMethod, setPhoneMethod] = useState("");

    // Email/Phone Update - Token method
    const [emailPhoneData, setEmailPhoneData] = useState({
        new_email: "",
        new_no_telepon: "",
        verification_token: "",
    });
    const [emailPhoneStep, setEmailPhoneStep] = useState("select");
    const [emailPhoneLoading, setEmailPhoneLoading] = useState(false);
    const [emailPhoneMessage, setEmailPhoneMessage] = useState({
        type: "",
        text: "",
    });

    // Password Change
    const [passwordData, setPasswordData] = useState({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirmation: false,
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState({
        type: "",
        text: "",
    });

    // Helper function to extract error message from response
    const getErrorMessage = (error, defaultMessage) => {
        if (error.response?.data?.errors) {
            const errors = error.response.data.errors;
            const firstErrorField = Object.keys(errors)[0];
            if (firstErrorField && errors[firstErrorField]) {
                const fieldError = errors[firstErrorField];
                return Array.isArray(fieldError) ? fieldError[0] : fieldError;
            }
        }
        return error.response?.data?.message || defaultMessage;
    };

    // Handle Profile Update
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setProfileMessage({ type: "", text: "" });
        setProfileLoading(true);

        try {
            const response = await axiosInstance.put(
                "/user/profile",
                profileData
            );
            setProfileMessage({
                type: "success",
                text: response.data.message || "Profile berhasil diperbarui",
            });
            checkAuth();
        } catch (error) {
            const message = getErrorMessage(error, "Gagal memperbarui profile");
            setProfileMessage({ type: "error", text: message });
        }

        setProfileLoading(false);
    };

    // Reset email/phone form
    const resetEmailPhoneForm = () => {
        setEmailMethod("");
        setPhoneMethod("");
        setEmailPhoneStep("select");
        setEmailPhoneData({
            new_email: "",
            new_no_telepon: "",
            verification_token: "",
        });
        setEmailPhoneMessage({ type: "", text: "" });
    };

    // Handle method selection for email
    const handleEmailMethodSelect = (method) => {
        setEmailMethod(method);
        setPhoneMethod("");
        setEmailPhoneMessage({ type: "", text: "" });
        if (method === "token") {
            setEmailPhoneStep("input-email");
        } else {
            setEmailPhoneStep("admin-email");
        }
    };

    // Handle method selection for phone
    const handlePhoneMethodSelect = (method) => {
        setPhoneMethod(method);
        setEmailMethod("");
        setEmailPhoneMessage({ type: "", text: "" });
        if (method === "token") {
            setEmailPhoneStep("input-phone");
        } else {
            setEmailPhoneStep("admin-phone");
        }
    };

    // Handle Email Update Request (via token)
    const handleEmailUpdateRequest = async (e) => {
        e.preventDefault();
        setEmailPhoneMessage({ type: "", text: "" });
        setEmailPhoneLoading(true);

        try {
            const response = await axiosInstance.post(
                "/user/profile/request-email-update",
                {
                    new_email: emailPhoneData.new_email,
                }
            );
            setEmailPhoneMessage({
                type: "success",
                text:
                    response.data.message ||
                    "Token verifikasi telah dikirim ke email baru Anda",
            });
            setEmailPhoneStep("verify-email");
        } catch (error) {
            if (error.response?.data?.error_type === "transport_error") {
                setEmailPhoneMessage({
                    type: "error",
                    text: "Server email tidak dapat dihubungi. Silakan gunakan metode 'Minta Bantuan Admin'.",
                });
            } else {
                const message = getErrorMessage(
                    error,
                    "Gagal mengirim token verifikasi"
                );
                setEmailPhoneMessage({ type: "error", text: message });
            }
        }

        setEmailPhoneLoading(false);
    };

    // Handle Email Change via Admin
    const handleEmailChangeAdmin = async (e) => {
        e.preventDefault();
        setEmailPhoneMessage({ type: "", text: "" });
        setEmailPhoneLoading(true);

        try {
            const response = await axiosInstance.post(
                "/user/profile/request-email-change-admin",
                {
                    new_email: emailPhoneData.new_email,
                }
            );
            setEmailPhoneMessage({
                type: "success",
                text:
                    response.data.message ||
                    "Request berhasil dikirim ke admin",
            });
            setEmailPhoneStep("admin-success-email");
        } catch (error) {
            const message = getErrorMessage(error, "Gagal mengirim request");
            setEmailPhoneMessage({ type: "error", text: message });
        }

        setEmailPhoneLoading(false);
    };

    // Handle Email Verification
    const handleEmailVerification = async (e) => {
        e.preventDefault();
        setEmailPhoneMessage({ type: "", text: "" });
        setEmailPhoneLoading(true);

        try {
            const response = await axiosInstance.post(
                "/user/profile/verify-email-update",
                {
                    token: emailPhoneData.verification_token,
                }
            );
            setEmailPhoneMessage({
                type: "success",
                text: response.data.message || "Email berhasil diperbarui",
            });
            resetEmailPhoneForm();
            checkAuth();
        } catch (error) {
            const message = getErrorMessage(error, "Verifikasi gagal");
            setEmailPhoneMessage({ type: "error", text: message });
        }

        setEmailPhoneLoading(false);
    };

    // Handle Phone Update Request (via token)
    const handlePhoneUpdateRequest = async (e) => {
        e.preventDefault();
        setEmailPhoneMessage({ type: "", text: "" });
        setEmailPhoneLoading(true);

        try {
            const response = await axiosInstance.post(
                "/user/profile/request-phone-update",
                {
                    new_no_telepon: emailPhoneData.new_no_telepon,
                }
            );
            setEmailPhoneMessage({
                type: "success",
                text: response.data.message || "Token verifikasi telah dikirim",
            });
            setEmailPhoneStep("verify-phone");
        } catch (error) {
            if (error.response?.data?.error_type === "transport_error") {
                setEmailPhoneMessage({
                    type: "error",
                    text: "Server email tidak dapat dihubungi. Silakan gunakan metode 'Minta Bantuan Admin'.",
                });
            } else {
                const message = getErrorMessage(
                    error,
                    "Gagal mengirim token verifikasi"
                );
                setEmailPhoneMessage({ type: "error", text: message });
            }
        }

        setEmailPhoneLoading(false);
    };

    // Handle Phone Change via Admin
    const handlePhoneChangeAdmin = async (e) => {
        e.preventDefault();
        setEmailPhoneMessage({ type: "", text: "" });
        setEmailPhoneLoading(true);

        try {
            const response = await axiosInstance.post(
                "/user/profile/request-phone-change-admin",
                {
                    new_no_telepon: emailPhoneData.new_no_telepon,
                }
            );
            setEmailPhoneMessage({
                type: "success",
                text:
                    response.data.message ||
                    "Request berhasil dikirim ke admin",
            });
            setEmailPhoneStep("admin-success-phone");
        } catch (error) {
            const message = getErrorMessage(error, "Gagal mengirim request");
            setEmailPhoneMessage({ type: "error", text: message });
        }

        setEmailPhoneLoading(false);
    };

    // Handle Phone Verification
    const handlePhoneVerification = async (e) => {
        e.preventDefault();
        setEmailPhoneMessage({ type: "", text: "" });
        setEmailPhoneLoading(true);

        try {
            const response = await axiosInstance.post(
                "/user/profile/verify-phone-update",
                {
                    token: emailPhoneData.verification_token,
                }
            );
            setEmailPhoneMessage({
                type: "success",
                text: response.data.message || "No telepon berhasil diperbarui",
            });
            resetEmailPhoneForm();
            checkAuth();
        } catch (error) {
            const message = getErrorMessage(error, "Verifikasi gagal");
            setEmailPhoneMessage({ type: "error", text: message });
        }

        setEmailPhoneLoading(false);
    };

    // Handle Password Change
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordMessage({ type: "", text: "" });

        if (
            passwordData.new_password !== passwordData.new_password_confirmation
        ) {
            setPasswordMessage({
                type: "error",
                text: "Konfirmasi password tidak cocok",
            });
            return;
        }

        setPasswordLoading(true);

        try {
            const response = await axiosInstance.put(
                "/user/profile/change-password",
                {
                    current_password: passwordData.current_password,
                    new_password: passwordData.new_password,
                    new_password_confirmation:
                        passwordData.new_password_confirmation,
                }
            );
            setPasswordMessage({
                type: "success",
                text: response.data.message || "Password berhasil diubah",
            });
            setPasswordData({
                current_password: "",
                new_password: "",
                new_password_confirmation: "",
            });
        } catch (error) {
            const message = getErrorMessage(error, "Gagal mengubah password");
            setPasswordMessage({ type: "error", text: message });
        }

        setPasswordLoading(false);
    };

    // Reusable Back Button Component
    const BackButton = ({ onClick, label = "Kembali" }) => (
        <button
            type="button"
            onClick={onClick}
            className="flex items-center justify-center gap-2 w-full mt-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition duration-200"
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
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
            </svg>
            {label}
        </button>
    );

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            {/* Main Content */}
            <main className="flex-grow">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            Profile Settings
                        </h1>
                        <p className="text-gray-600">
                            Kelola informasi akun Anda
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white rounded-xl shadow-md mb-6">
                        <div className="flex border-b border-gray-200">
                            <button
                                onClick={() => setActiveTab("profile")}
                                className={`flex-1 px-6 py-4 text-sm font-medium transition duration-200 ${
                                    activeTab === "profile"
                                        ? "text-primary-700 border-b-2 border-primary-700"
                                        : "text-gray-600 hover:text-gray-800"
                                }`}
                            >
                                Data Profile
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTab("email-phone");
                                    resetEmailPhoneForm();
                                }}
                                className={`flex-1 px-6 py-4 text-sm font-medium transition duration-200 ${
                                    activeTab === "email-phone"
                                        ? "text-primary-700 border-b-2 border-primary-700"
                                        : "text-gray-600 hover:text-gray-800"
                                }`}
                            >
                                Email & No Telepon
                            </button>
                            <button
                                onClick={() => setActiveTab("password")}
                                className={`flex-1 px-6 py-4 text-sm font-medium transition duration-200 ${
                                    activeTab === "password"
                                        ? "text-primary-700 border-b-2 border-primary-700"
                                        : "text-gray-600 hover:text-gray-800"
                                }`}
                            >
                                Ubah Password
                            </button>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
                        {/* Profile Tab */}
                        {activeTab === "profile" && (
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 mb-6">
                                    Update Data Profile
                                </h2>

                                {profileMessage.text && (
                                    <div
                                        className={`mb-6 p-4 rounded-lg ${
                                            profileMessage.type === "success"
                                                ? "bg-green-50 border border-green-200 text-green-700"
                                                : "bg-red-50 border border-red-200 text-red-600"
                                        }`}
                                    >
                                        {profileMessage.text}
                                    </div>
                                )}

                                <form
                                    onSubmit={handleProfileUpdate}
                                    className="space-y-6"
                                >
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nama Lengkap
                                        </label>
                                        <input
                                            type="text"
                                            value={profileData.nama_lengkap}
                                            onChange={(e) =>
                                                setProfileData({
                                                    ...profileData,
                                                    nama_lengkap:
                                                        e.target.value,
                                                })
                                            }
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            disabled={profileLoading}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            NIM/NIP
                                        </label>
                                        <input
                                            type="text"
                                            value={profileData.nim_nip}
                                            onChange={(e) =>
                                                setProfileData({
                                                    ...profileData,
                                                    nim_nip: e.target.value,
                                                })
                                            }
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            disabled={profileLoading}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Status
                                        </label>
                                        <select
                                            value={profileData.status}
                                            onChange={(e) =>
                                                setProfileData({
                                                    ...profileData,
                                                    status: e.target.value,
                                                })
                                            }
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                                            disabled={profileLoading}
                                        >
                                            <option value="dosen">Dosen</option>
                                            <option value="asdos">Asdos</option>
                                            <option value="staff">Staff</option>
                                            <option value="mahasiswa">
                                                Mahasiswa
                                            </option>
                                        </select>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={profileLoading}
                                        className="w-full bg-gradient-to-r from-primary-700 to-primary-800 hover:from-primary-800 hover:to-primary-900 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {profileLoading
                                            ? "Menyimpan..."
                                            : "Simpan Perubahan"}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Email & Phone Tab */}
                        {activeTab === "email-phone" && (
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 mb-2">
                                    Update Email & No Telepon
                                </h2>
                                <p className="text-sm text-gray-600 mb-6">
                                    Email dan no telepon saat ini:{" "}
                                    <strong>{user?.email}</strong> /{" "}
                                    <strong>{user?.no_telepon}</strong>
                                </p>

                                {emailPhoneMessage.text && (
                                    <div
                                        className={`mb-6 p-4 rounded-lg ${
                                            emailPhoneMessage.type === "success"
                                                ? "bg-green-50 border border-green-200 text-green-700"
                                                : "bg-red-50 border border-red-200 text-red-600"
                                        }`}
                                    >
                                        {emailPhoneMessage.text}
                                    </div>
                                )}

                                {/* Step: Select what to change */}
                                {emailPhoneStep === "select" && (
                                    <div className="space-y-6">
                                        {/* Email Change Section */}
                                        <div className="border border-gray-200 rounded-xl p-6">
                                            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                                    <svg
                                                        className="w-4 h-4 text-blue-600"
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
                                                Ganti Email
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <button
                                                    onClick={() =>
                                                        handleEmailMethodSelect(
                                                            "token"
                                                        )
                                                    }
                                                    className="p-4 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition duration-200 text-left"
                                                >
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                                                            <svg
                                                                className="w-5 h-5 text-primary-700"
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
                                                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                                />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-800">
                                                                Via Token Email
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                Token dikirim ke
                                                                email baru
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleEmailMethodSelect(
                                                            "admin"
                                                        )
                                                    }
                                                    className="p-4 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition duration-200 text-left"
                                                >
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                                                            <svg
                                                                className="w-5 h-5 text-primary-700"
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
                                                                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                                                                />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-800">
                                                                Minta Bantuan
                                                                Admin
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                Admin akan
                                                                memproses
                                                                perubahan
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Phone Change Section */}
                                        <div className="border border-gray-200 rounded-xl p-6">
                                            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                                    <svg
                                                        className="w-4 h-4 text-green-600"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                                        />
                                                    </svg>
                                                </div>
                                                Ganti No Telepon
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <button
                                                    onClick={() =>
                                                        handlePhoneMethodSelect(
                                                            "token"
                                                        )
                                                    }
                                                    className="p-4 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition duration-200 text-left"
                                                >
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                                                            <svg
                                                                className="w-5 h-5 text-primary-700"
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
                                                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                                />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-800">
                                                                Via Token Email
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                Token dikirim ke
                                                                email saat ini
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handlePhoneMethodSelect(
                                                            "admin"
                                                        )
                                                    }
                                                    className="p-4 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition duration-200 text-left"
                                                >
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                                                            <svg
                                                                className="w-5 h-5 text-primary-700"
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
                                                                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                                                                />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-800">
                                                                Minta Bantuan
                                                                Admin
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                Admin akan
                                                                memproses
                                                                perubahan
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step: Input Email (Token Method) */}
                                {emailPhoneStep === "input-email" && (
                                    <div>
                                        <form
                                            onSubmit={handleEmailUpdateRequest}
                                        >
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email Baru
                                            </label>
                                            <input
                                                type="email"
                                                value={emailPhoneData.new_email}
                                                onChange={(e) =>
                                                    setEmailPhoneData({
                                                        ...emailPhoneData,
                                                        new_email:
                                                            e.target.value,
                                                    })
                                                }
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                placeholder="email@baru.com"
                                                disabled={emailPhoneLoading}
                                            />
                                            <p className="text-xs text-gray-500 mt-2 mb-4">
                                                Token verifikasi akan dikirim ke
                                                email baru
                                            </p>
                                            <button
                                                type="submit"
                                                disabled={
                                                    emailPhoneLoading ||
                                                    !emailPhoneData.new_email
                                                }
                                                className="w-full bg-gradient-to-r from-primary-700 to-primary-800 hover:from-primary-800 hover:to-primary-900 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {emailPhoneLoading
                                                    ? "Mengirim..."
                                                    : "Kirim Token"}
                                            </button>
                                        </form>
                                        <BackButton
                                            onClick={resetEmailPhoneForm}
                                        />
                                    </div>
                                )}

                                {/* Step: Input Email (Admin Method) */}
                                {emailPhoneStep === "admin-email" && (
                                    <div>
                                        <form onSubmit={handleEmailChangeAdmin}>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email Baru yang Diinginkan
                                            </label>
                                            <input
                                                type="email"
                                                value={emailPhoneData.new_email}
                                                onChange={(e) =>
                                                    setEmailPhoneData({
                                                        ...emailPhoneData,
                                                        new_email:
                                                            e.target.value,
                                                    })
                                                }
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-4"
                                                placeholder="email@baru.com"
                                                disabled={emailPhoneLoading}
                                            />
                                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                                <p className="text-sm text-yellow-700">
                                                    <strong>Catatan:</strong>{" "}
                                                    Request akan dikirim ke
                                                    admin. Admin akan
                                                    memverifikasi dan mengubah
                                                    email Anda.
                                                </p>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={
                                                    emailPhoneLoading ||
                                                    !emailPhoneData.new_email
                                                }
                                                className="w-full bg-gradient-to-r from-primary-700 to-primary-800 hover:from-primary-800 hover:to-primary-900 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {emailPhoneLoading
                                                    ? "Mengirim..."
                                                    : "Kirim Request ke Admin"}
                                            </button>
                                        </form>
                                        <BackButton
                                            onClick={resetEmailPhoneForm}
                                        />
                                    </div>
                                )}

                                {/* Step: Input Phone (Token Method) */}
                                {emailPhoneStep === "input-phone" && (
                                    <div>
                                        <form
                                            onSubmit={handlePhoneUpdateRequest}
                                        >
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                No Telepon Baru
                                            </label>
                                            <input
                                                type="text"
                                                value={
                                                    emailPhoneData.new_no_telepon
                                                }
                                                onChange={(e) =>
                                                    setEmailPhoneData({
                                                        ...emailPhoneData,
                                                        new_no_telepon:
                                                            e.target.value,
                                                    })
                                                }
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                placeholder="08xxxxxxxxxx"
                                                disabled={emailPhoneLoading}
                                            />
                                            <p className="text-xs text-gray-500 mt-2 mb-4">
                                                Token verifikasi akan dikirim ke
                                                email saat ini ({user?.email})
                                            </p>
                                            <button
                                                type="submit"
                                                disabled={
                                                    emailPhoneLoading ||
                                                    !emailPhoneData.new_no_telepon
                                                }
                                                className="w-full bg-gradient-to-r from-primary-700 to-primary-800 hover:from-primary-800 hover:to-primary-900 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {emailPhoneLoading
                                                    ? "Mengirim..."
                                                    : "Kirim Token"}
                                            </button>
                                        </form>
                                        <BackButton
                                            onClick={resetEmailPhoneForm}
                                        />
                                    </div>
                                )}

                                {/* Step: Input Phone (Admin Method) */}
                                {emailPhoneStep === "admin-phone" && (
                                    <div>
                                        <form onSubmit={handlePhoneChangeAdmin}>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                No Telepon Baru yang Diinginkan
                                            </label>
                                            <input
                                                type="text"
                                                value={
                                                    emailPhoneData.new_no_telepon
                                                }
                                                onChange={(e) =>
                                                    setEmailPhoneData({
                                                        ...emailPhoneData,
                                                        new_no_telepon:
                                                            e.target.value,
                                                    })
                                                }
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-4"
                                                placeholder="08xxxxxxxxxx"
                                                disabled={emailPhoneLoading}
                                            />
                                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                                <p className="text-sm text-yellow-700">
                                                    <strong>Catatan:</strong>{" "}
                                                    Request akan dikirim ke
                                                    admin. Admin akan
                                                    memverifikasi dan mengubah
                                                    no telepon Anda.
                                                </p>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={
                                                    emailPhoneLoading ||
                                                    !emailPhoneData.new_no_telepon
                                                }
                                                className="w-full bg-gradient-to-r from-primary-700 to-primary-800 hover:from-primary-800 hover:to-primary-900 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {emailPhoneLoading
                                                    ? "Mengirim..."
                                                    : "Kirim Request ke Admin"}
                                            </button>
                                        </form>
                                        <BackButton
                                            onClick={resetEmailPhoneForm}
                                        />
                                    </div>
                                )}

                                {/* Step: Verify Email Token */}
                                {emailPhoneStep === "verify-email" && (
                                    <div>
                                        <form
                                            onSubmit={handleEmailVerification}
                                        >
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Masukkan Token Verifikasi
                                            </label>
                                            <p className="text-xs text-gray-500 mb-4">
                                                Token telah dikirim ke email
                                                baru Anda
                                            </p>
                                            <input
                                                type="text"
                                                value={
                                                    emailPhoneData.verification_token
                                                }
                                                onChange={(e) =>
                                                    setEmailPhoneData({
                                                        ...emailPhoneData,
                                                        verification_token:
                                                            e.target.value,
                                                    })
                                                }
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-4"
                                                placeholder="Masukkan token 6 digit"
                                                disabled={emailPhoneLoading}
                                            />
                                            <button
                                                type="submit"
                                                disabled={
                                                    emailPhoneLoading ||
                                                    !emailPhoneData.verification_token
                                                }
                                                className="w-full bg-gradient-to-r from-primary-700 to-primary-800 hover:from-primary-800 hover:to-primary-900 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {emailPhoneLoading
                                                    ? "Memverifikasi..."
                                                    : "Verifikasi"}
                                            </button>
                                        </form>
                                        <BackButton
                                            onClick={resetEmailPhoneForm}
                                            label="Batal"
                                        />
                                    </div>
                                )}

                                {/* Step: Verify Phone Token */}
                                {emailPhoneStep === "verify-phone" && (
                                    <div>
                                        <form
                                            onSubmit={handlePhoneVerification}
                                        >
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Masukkan Token Verifikasi
                                            </label>
                                            <p className="text-xs text-gray-500 mb-4">
                                                Token telah dikirim ke email
                                                Anda ({user?.email})
                                            </p>
                                            <input
                                                type="text"
                                                value={
                                                    emailPhoneData.verification_token
                                                }
                                                onChange={(e) =>
                                                    setEmailPhoneData({
                                                        ...emailPhoneData,
                                                        verification_token:
                                                            e.target.value,
                                                    })
                                                }
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-4"
                                                placeholder="Masukkan token 6 digit"
                                                disabled={emailPhoneLoading}
                                            />
                                            <button
                                                type="submit"
                                                disabled={
                                                    emailPhoneLoading ||
                                                    !emailPhoneData.verification_token
                                                }
                                                className="w-full bg-gradient-to-r from-primary-700 to-primary-800 hover:from-primary-800 hover:to-primary-900 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {emailPhoneLoading
                                                    ? "Memverifikasi..."
                                                    : "Verifikasi"}
                                            </button>
                                        </form>
                                        <BackButton
                                            onClick={resetEmailPhoneForm}
                                            label="Batal"
                                        />
                                    </div>
                                )}

                                {/* Step: Admin Request Success (Email) */}
                                {emailPhoneStep === "admin-success-email" && (
                                    <div className="text-center py-6">
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                            Request Terkirim
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            Request perubahan email ke{" "}
                                            <strong>
                                                {emailPhoneData.new_email}
                                            </strong>{" "}
                                            telah dikirim ke admin.
                                        </p>
                                        <p className="text-sm text-gray-500 mb-6">
                                            Admin akan memproses request Anda.
                                            Anda akan menerima notifikasi
                                            setelah email berhasil diubah.
                                        </p>
                                        <button
                                            onClick={resetEmailPhoneForm}
                                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-700 text-white rounded-lg hover:bg-primary-800 transition duration-200 font-medium"
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
                                                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                                />
                                            </svg>
                                            Kembali
                                        </button>
                                    </div>
                                )}

                                {/* Step: Admin Request Success (Phone) */}
                                {emailPhoneStep === "admin-success-phone" && (
                                    <div className="text-center py-6">
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                            Request Terkirim
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            Request perubahan no telepon ke{" "}
                                            <strong>
                                                {emailPhoneData.new_no_telepon}
                                            </strong>{" "}
                                            telah dikirim ke admin.
                                        </p>
                                        <p className="text-sm text-gray-500 mb-6">
                                            Admin akan memproses request Anda.
                                            Anda akan menerima notifikasi
                                            setelah no telepon berhasil diubah.
                                        </p>
                                        <button
                                            onClick={resetEmailPhoneForm}
                                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-700 text-white rounded-lg hover:bg-primary-800 transition duration-200 font-medium"
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
                                                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                                />
                                            </svg>
                                            Kembali
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Password Tab */}
                        {activeTab === "password" && (
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 mb-6">
                                    Ubah Password
                                </h2>

                                {passwordMessage.text && (
                                    <div
                                        className={`mb-6 p-4 rounded-lg ${
                                            passwordMessage.type === "success"
                                                ? "bg-green-50 border border-green-200 text-green-700"
                                                : "bg-red-50 border border-red-200 text-red-600"
                                        }`}
                                    >
                                        {passwordMessage.text}
                                    </div>
                                )}

                                <form
                                    onSubmit={handlePasswordChange}
                                    className="space-y-6"
                                >
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Password Saat Ini
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={
                                                    showPasswords.current
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={
                                                    passwordData.current_password
                                                }
                                                onChange={(e) =>
                                                    setPasswordData({
                                                        ...passwordData,
                                                        current_password:
                                                            e.target.value,
                                                    })
                                                }
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                disabled={passwordLoading}
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPasswords({
                                                        ...showPasswords,
                                                        current:
                                                            !showPasswords.current,
                                                    })
                                                }
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            >
                                                <svg
                                                    className="w-5 h-5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    {showPasswords.current ? (
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                                        />
                                                    ) : (
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                        />
                                                    )}
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Password Baru
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={
                                                    showPasswords.new
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={
                                                    passwordData.new_password
                                                }
                                                onChange={(e) =>
                                                    setPasswordData({
                                                        ...passwordData,
                                                        new_password:
                                                            e.target.value,
                                                    })
                                                }
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                placeholder="Minimal 6 karakter"
                                                disabled={passwordLoading}
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPasswords({
                                                        ...showPasswords,
                                                        new: !showPasswords.new,
                                                    })
                                                }
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            >
                                                <svg
                                                    className="w-5 h-5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    {showPasswords.new ? (
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                                        />
                                                    ) : (
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                        />
                                                    )}
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Konfirmasi Password Baru
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={
                                                    showPasswords.confirmation
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={
                                                    passwordData.new_password_confirmation
                                                }
                                                onChange={(e) =>
                                                    setPasswordData({
                                                        ...passwordData,
                                                        new_password_confirmation:
                                                            e.target.value,
                                                    })
                                                }
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                placeholder="Ketik ulang password baru"
                                                disabled={passwordLoading}
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPasswords({
                                                        ...showPasswords,
                                                        confirmation:
                                                            !showPasswords.confirmation,
                                                    })
                                                }
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            >
                                                <svg
                                                    className="w-5 h-5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    {showPasswords.confirmation ? (
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                                        />
                                                    ) : (
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                        />
                                                    )}
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={passwordLoading}
                                        className="w-full bg-gradient-to-r from-primary-700 to-primary-800 hover:from-primary-800 hover:to-primary-900 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {passwordLoading
                                            ? "Mengubah..."
                                            : "Ubah Password"}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default ProfileSettings;
