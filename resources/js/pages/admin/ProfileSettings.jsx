import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Navbar from "../../Components/admin/Navbar";
import axiosInstance from "../../config/axios";

const AdminProfileSettings = () => {
    const navigate = useNavigate();
    const { admin, checkAuth } = useAuth();

    const [activeTab, setActiveTab] = useState("profile");

    // Profile Form
    const [profileData, setProfileData] = useState({
        nama: admin?.nama || "",
    });
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileMessage, setProfileMessage] = useState({
        type: "",
        text: "",
    });

    // Password Change
    const [passwordData, setPasswordData] = useState({
        new_password: "",
        new_password_confirmation: "",
    });
    const [showPasswords, setShowPasswords] = useState({
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
            const response = await axiosInstance.put("/admin/profile", {
                nama: profileData.nama,
            });

            setProfileMessage({
                type: "success",
                text: response.data.message || "Profile berhasil diperbarui",
            });

            await checkAuth();

            setTimeout(() => {
                setProfileMessage({ type: "", text: "" });
            }, 3000);
        } catch (error) {
            const message =
                error.response?.data?.message || "Gagal memperbarui profile";
            setProfileMessage({ type: "error", text: message });
        }

        setProfileLoading(false);
    };

    // Handle Password Change
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordMessage({ type: "", text: "" });

        if (
            !passwordData.new_password ||
            !passwordData.new_password_confirmation
        ) {
            setPasswordMessage({
                type: "error",
                text: "Semua field wajib diisi",
            });
            return;
        }

        if (
            passwordData.new_password !== passwordData.new_password_confirmation
        ) {
            setPasswordMessage({
                type: "error",
                text: "Konfirmasi password tidak cocok",
            });
            return;
        }

        if (passwordData.new_password.length < 6) {
            setPasswordMessage({
                type: "error",
                text: "Password minimal 6 karakter",
            });
            return;
        }

        setPasswordLoading(true);

        try {
            const response = await axiosInstance.put(
                "/admin/profile/change-password",
                {
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
                new_password: "",
                new_password_confirmation: "",
            });

            setTimeout(() => {
                setPasswordMessage({ type: "", text: "" });
            }, 3000);
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
                        onClick={() => navigate("/admin/dashboard")}
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
                        Admin Settings
                    </h1>
                    <p className="text-gray-600">
                        Kelola informasi akun admin Anda
                    </p>
                </div>

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

                {activeTab === "profile" && (
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">
                            Informasi Profile
                        </h2>

                        {profileMessage.text && (
                            <div
                                className={`mb-6 p-4 rounded-lg border ${
                                    profileMessage.type === "success"
                                        ? "bg-primary-50 border-primary-200 text-primary-700"
                                        : "bg-red-50 border-red-200 text-red-600"
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
                                    Nama Admin
                                </label>
                                <input
                                    type="text"
                                    value={profileData.nama}
                                    onChange={(e) =>
                                        setProfileData({
                                            ...profileData,
                                            nama: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="Masukkan nama admin"
                                    disabled={profileLoading}
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Nama ini akan digunakan untuk login dan
                                    ditampilkan di sistem
                                </p>
                            </div>

                            <div className="flex gap-4 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => navigate("/admin/dashboard")}
                                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition duration-200"
                                    disabled={profileLoading}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={profileLoading}
                                    className="flex-1 bg-primary-700 text-white font-semibold py-3 rounded-lg hover:bg-primary-800 transition duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {profileLoading
                                        ? "Menyimpan..."
                                        : "Simpan Perubahan"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {activeTab === "password" && (
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">
                            Ubah Password
                        </h2>

                        {passwordMessage.text && (
                            <div
                                className={`mb-6 p-4 rounded-lg border ${
                                    passwordMessage.type === "success"
                                        ? "bg-primary-50 border-primary-200 text-primary-700"
                                        : "bg-red-50 border-red-200 text-red-600"
                                }`}
                            >
                                {passwordMessage.text}
                            </div>
                        )}

                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-start gap-3">
                                <svg
                                    className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
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
                                        Untuk admin, Anda dapat langsung
                                        mengubah password tanpa perlu memasukkan
                                        password lama. Pastikan password baru
                                        Anda kuat dan mudah diingat.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form
                            onSubmit={handlePasswordChange}
                            className="space-y-6"
                        >
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
                                                new_password: e.target.value,
                                            })
                                        }
                                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="Masukkan password baru"
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
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
                                                <>
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
                                                </>
                                            )}
                                        </svg>
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Password minimal 6 karakter
                                </p>
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
                                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="Konfirmasi password baru"
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
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
                                                <>
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
                                                </>
                                            )}
                                        </svg>
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Ulangi password baru untuk konfirmasi
                                </p>
                            </div>

                            <div className="flex gap-4 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPasswordData({
                                            new_password: "",
                                            new_password_confirmation: "",
                                        });
                                        setPasswordMessage({
                                            type: "",
                                            text: "",
                                        });
                                    }}
                                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition duration-200"
                                    disabled={passwordLoading}
                                >
                                    Reset Form
                                </button>
                                <button
                                    type="submit"
                                    disabled={passwordLoading}
                                    className="flex-1 bg-primary-700 text-white font-semibold py-3 rounded-lg hover:bg-primary-800 transition duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {passwordLoading
                                        ? "Mengubah Password..."
                                        : "Ubah Password"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminProfileSettings;
