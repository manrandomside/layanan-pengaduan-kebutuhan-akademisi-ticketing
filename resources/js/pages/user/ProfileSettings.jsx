import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Navbar from "../../Components/user/Navbar";
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

    // Email/Phone Update
    const [emailPhoneData, setEmailPhoneData] = useState({
        new_email: "",
        new_no_telepon: "",
        verification_token: "",
    });
    const [emailPhoneStep, setEmailPhoneStep] = useState("input");
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
            const message =
                error.response?.data?.message || "Gagal memperbarui profile";
            setProfileMessage({ type: "error", text: message });
        }

        setProfileLoading(false);
    };

    // Handle Email Update Request
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
            const message =
                error.response?.data?.message ||
                "Gagal mengirim token verifikasi";
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
            setEmailPhoneStep("input");
            setEmailPhoneData({
                new_email: "",
                new_no_telepon: "",
                verification_token: "",
            });
            checkAuth();
        } catch (error) {
            const message = error.response?.data?.message || "Verifikasi gagal";
            setEmailPhoneMessage({ type: "error", text: message });
        }

        setEmailPhoneLoading(false);
    };

    // Handle Phone Update Request
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
            const message =
                error.response?.data?.message ||
                "Gagal mengirim token verifikasi";
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
            setEmailPhoneStep("input");
            setEmailPhoneData({
                new_email: "",
                new_no_telepon: "",
                verification_token: "",
            });
            checkAuth();
        } catch (error) {
            const message = error.response?.data?.message || "Verifikasi gagal";
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
            const message =
                error.response?.data?.message || "Gagal mengubah password";
            setPasswordMessage({ type: "error", text: message });
        }

        setPasswordLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

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
                    <p className="text-gray-600">Kelola informasi akun Anda</p>
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
                            onClick={() => setActiveTab("email-phone")}
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
                                            ? "bg-primary-50 border border-primary-200 text-primary-700"
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
                                                nama_lengkap: e.target.value,
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
                                            ? "bg-primary-50 border border-primary-200 text-primary-700"
                                            : "bg-red-50 border border-red-200 text-red-600"
                                    }`}
                                >
                                    {emailPhoneMessage.text}
                                </div>
                            )}

                            {emailPhoneStep === "input" && (
                                <div className="space-y-6">
                                    <form onSubmit={handleEmailUpdateRequest}>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Baru
                                        </label>
                                        <div className="flex gap-2">
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
                                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                placeholder="email@baru.com"
                                                disabled={emailPhoneLoading}
                                            />
                                            <button
                                                type="submit"
                                                disabled={
                                                    emailPhoneLoading ||
                                                    !emailPhoneData.new_email
                                                }
                                                className="px-6 py-3 bg-primary-700 text-white rounded-lg hover:bg-primary-800 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {emailPhoneLoading
                                                    ? "Loading..."
                                                    : "Kirim Token"}
                                            </button>
                                        </div>
                                    </form>

                                    <div className="border-t border-gray-200 pt-6">
                                        <form
                                            onSubmit={handlePhoneUpdateRequest}
                                        >
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                No Telepon Baru
                                            </label>
                                            <div className="flex gap-2">
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
                                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                    placeholder="08xxxxxxxxxx"
                                                    disabled={emailPhoneLoading}
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={
                                                        emailPhoneLoading ||
                                                        !emailPhoneData.new_no_telepon
                                                    }
                                                    className="px-6 py-3 bg-primary-700 text-white rounded-lg hover:bg-primary-800 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {emailPhoneLoading
                                                        ? "Loading..."
                                                        : "Kirim Token"}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {emailPhoneStep === "verify-email" && (
                                <form onSubmit={handleEmailVerification}>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Masukkan Token Verifikasi (dikirim ke
                                        email baru)
                                    </label>
                                    <div className="flex gap-2">
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
                                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="Masukkan token"
                                            disabled={emailPhoneLoading}
                                        />
                                        <button
                                            type="submit"
                                            disabled={
                                                emailPhoneLoading ||
                                                !emailPhoneData.verification_token
                                            }
                                            className="px-6 py-3 bg-primary-700 text-white rounded-lg hover:bg-primary-800 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {emailPhoneLoading
                                                ? "Verifying..."
                                                : "Verifikasi"}
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEmailPhoneStep("input");
                                            setEmailPhoneData({
                                                new_email: "",
                                                new_no_telepon: "",
                                                verification_token: "",
                                            });
                                        }}
                                        className="mt-4 text-sm text-gray-600 hover:text-gray-800"
                                    >
                                        Batal
                                    </button>
                                </form>
                            )}

                            {emailPhoneStep === "verify-phone" && (
                                <form onSubmit={handlePhoneVerification}>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Masukkan Token Verifikasi
                                    </label>
                                    <div className="flex gap-2">
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
                                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="Masukkan token"
                                            disabled={emailPhoneLoading}
                                        />
                                        <button
                                            type="submit"
                                            disabled={
                                                emailPhoneLoading ||
                                                !emailPhoneData.verification_token
                                            }
                                            className="px-6 py-3 bg-primary-700 text-white rounded-lg hover:bg-primary-800 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {emailPhoneLoading
                                                ? "Verifying..."
                                                : "Verifikasi"}
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEmailPhoneStep("input");
                                            setEmailPhoneData({
                                                new_email: "",
                                                new_no_telepon: "",
                                                verification_token: "",
                                            });
                                        }}
                                        className="mt-4 text-sm text-gray-600 hover:text-gray-800"
                                    >
                                        Batal
                                    </button>
                                </form>
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
                                            ? "bg-primary-50 border border-primary-200 text-primary-700"
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
                                            value={passwordData.new_password}
                                            onChange={(e) =>
                                                setPasswordData({
                                                    ...passwordData,
                                                    new_password:
                                                        e.target.value,
                                                })
                                            }
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="Minimal 8 karakter"
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
        </div>
    );
};

export default ProfileSettings;
