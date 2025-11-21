import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/admin/Navbar";
import axiosInstance from "../../config/axios";

const KelolaPengguna = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [statusFilter, setStatusFilter] = useState("all");
    const [activeFilter, setActiveFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createFormData, setCreateFormData] = useState({
        nama_lengkap: "",
        nim_nip: "",
        email: "",
        no_telepon: "",
        status: "",
        password: "",
    });
    const [createLoading, setCreateLoading] = useState(false);
    const [createErrors, setCreateErrors] = useState({});

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [statusFilter, activeFilter, users]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get("/admin/users");
            setUsers(response.data.data || []);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
        setLoading(false);
    };

    const filterUsers = () => {
        let filtered = users;

        if (statusFilter !== "all") {
            filtered = filtered.filter((u) => u.status === statusFilter);
        }

        if (activeFilter !== "all") {
            filtered = filtered.filter((u) => u.is_active === activeFilter);
        }

        setFilteredUsers(filtered);
    };

    const handleDeactivateUser = async (userId) => {
        if (!confirm("Apakah Anda yakin ingin menonaktifkan user ini?")) return;

        try {
            const response = await axiosInstance.put(
                `/admin/users/${userId}/deactivate`
            );
            setMessage({
                type: "success",
                text: response.data.message || "User berhasil dinonaktifkan",
            });
            fetchUsers();
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        } catch (error) {
            const errorMsg =
                error.response?.data?.message || "Gagal menonaktifkan user";
            setMessage({ type: "error", text: errorMsg });
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        }
    };

    const handleActivateUser = async (userId) => {
        try {
            const response = await axiosInstance.put(
                `/admin/users/${userId}/activate`
            );
            setMessage({
                type: "success",
                text: response.data.message || "User berhasil diaktifkan",
            });
            fetchUsers();
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        } catch (error) {
            const errorMsg =
                error.response?.data?.message || "Gagal mengaktifkan user";
            setMessage({ type: "error", text: errorMsg });
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setCreateErrors({});
        setCreateLoading(true);

        try {
            const response = await axiosInstance.post(
                "/admin/users",
                createFormData
            );
            setMessage({
                type: "success",
                text: response.data.message || "User berhasil dibuat",
            });
            setShowCreateModal(false);
            setCreateFormData({
                nama_lengkap: "",
                nim_nip: "",
                email: "",
                no_telepon: "",
                status: "",
                password: "",
            });
            fetchUsers();
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        } catch (error) {
            const errorMsg =
                error.response?.data?.message || "Gagal membuat user";
            setMessage({ type: "error", text: errorMsg });
            if (error.response?.data?.errors) {
                setCreateErrors(error.response.data.errors);
            }
        }

        setCreateLoading(false);
    };

    const getStatusCount = (status) => {
        if (status === "all") return users.length;
        return users.filter((u) => u.status === status).length;
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

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                Kelola Pengguna
                            </h1>
                            <p className="text-gray-600">
                                Manage semua user yang terdaftar
                            </p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
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
                            Tambah User
                        </button>
                    </div>
                </div>

                {message.text && (
                    <div
                        className={`mb-6 p-4 rounded-lg ${
                            message.type === "success"
                                ? "bg-primary-50 border border-primary-200 text-primary-700"
                                : "bg-red-50 border border-red-200 text-red-600"
                        }`}
                    >
                        {message.text}
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setStatusFilter("all")}
                                className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                                    statusFilter === "all"
                                        ? "bg-primary-700 text-white shadow-lg"
                                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                Semua ({getStatusCount("all")})
                            </button>
                            <button
                                onClick={() => setStatusFilter("dosen")}
                                className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                                    statusFilter === "dosen"
                                        ? "bg-primary-700 text-white shadow-lg"
                                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                Dosen ({getStatusCount("dosen")})
                            </button>
                            <button
                                onClick={() => setStatusFilter("asdos")}
                                className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                                    statusFilter === "asdos"
                                        ? "bg-primary-700 text-white shadow-lg"
                                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                Asdos ({getStatusCount("asdos")})
                            </button>
                            <button
                                onClick={() => setStatusFilter("staff")}
                                className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                                    statusFilter === "staff"
                                        ? "bg-primary-700 text-white shadow-lg"
                                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                Staff ({getStatusCount("staff")})
                            </button>
                            <button
                                onClick={() => setStatusFilter("mahasiswa")}
                                className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                                    statusFilter === "mahasiswa"
                                        ? "bg-primary-700 text-white shadow-lg"
                                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                Mahasiswa ({getStatusCount("mahasiswa")})
                            </button>
                        </div>

                        <div>
                            <select
                                value={activeFilter}
                                onChange={(e) =>
                                    setActiveFilter(e.target.value)
                                }
                                className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                <option value="all">Semua Status</option>
                                <option value="active">Aktif</option>
                                <option value="inactive">Tidak Aktif</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                {filteredUsers.length === 0 ? (
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
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                        </svg>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            Tidak ada user
                        </h3>
                        <p className="text-gray-600">
                            Belum ada user dengan filter yang dipilih
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nama
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            NIM/NIP
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            No Telepon
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredUsers.map((user) => (
                                        <tr
                                            key={user.user_id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-primary-700 to-primary-800 rounded-full flex items-center justify-center">
                                                        <span className="text-white font-semibold">
                                                            {user.nama_lengkap
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {user.nama_lengkap}
                                                        </div>
                                                        <div className="text-xs text-gray-500 capitalize">
                                                            {user.status}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {user.nim_nip}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {user.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {user.no_telepon}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        user.is_active ===
                                                        "active"
                                                            ? "bg-primary-100 text-primary-800"
                                                            : "bg-red-100 text-red-800"
                                                    }`}
                                                >
                                                    {user.is_active === "active"
                                                        ? "Aktif"
                                                        : "Tidak Aktif"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {user.is_active === "active" ? (
                                                    <button
                                                        onClick={() =>
                                                            handleDeactivateUser(
                                                                user.user_id
                                                            )
                                                        }
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Nonaktifkan
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() =>
                                                            handleActivateUser(
                                                                user.user_id
                                                            )
                                                        }
                                                        className="text-primary-700 hover:text-primary-900"
                                                    >
                                                        Aktifkan
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Create User Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">
                                    Tambah User Baru
                                </h2>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
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

                            <form
                                onSubmit={handleCreateUser}
                                className="space-y-4"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nama Lengkap
                                        </label>
                                        <input
                                            type="text"
                                            value={createFormData.nama_lengkap}
                                            onChange={(e) =>
                                                setCreateFormData({
                                                    ...createFormData,
                                                    nama_lengkap:
                                                        e.target.value,
                                                })
                                            }
                                            className={`w-full px-4 py-3 border ${
                                                createErrors.nama_lengkap
                                                    ? "border-red-500"
                                                    : "border-gray-300"
                                            } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                                            disabled={createLoading}
                                        />
                                        {createErrors.nama_lengkap && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {createErrors.nama_lengkap[0]}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            NIM/NIP
                                        </label>
                                        <input
                                            type="text"
                                            value={createFormData.nim_nip}
                                            onChange={(e) =>
                                                setCreateFormData({
                                                    ...createFormData,
                                                    nim_nip: e.target.value,
                                                })
                                            }
                                            className={`w-full px-4 py-3 border ${
                                                createErrors.nim_nip
                                                    ? "border-red-500"
                                                    : "border-gray-300"
                                            } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                                            disabled={createLoading}
                                        />
                                        {createErrors.nim_nip && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {createErrors.nim_nip[0]}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={createFormData.email}
                                            onChange={(e) =>
                                                setCreateFormData({
                                                    ...createFormData,
                                                    email: e.target.value,
                                                })
                                            }
                                            className={`w-full px-4 py-3 border ${
                                                createErrors.email
                                                    ? "border-red-500"
                                                    : "border-gray-300"
                                            } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                                            disabled={createLoading}
                                        />
                                        {createErrors.email && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {createErrors.email[0]}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            No Telepon
                                        </label>
                                        <input
                                            type="text"
                                            value={createFormData.no_telepon}
                                            onChange={(e) =>
                                                setCreateFormData({
                                                    ...createFormData,
                                                    no_telepon: e.target.value,
                                                })
                                            }
                                            className={`w-full px-4 py-3 border ${
                                                createErrors.no_telepon
                                                    ? "border-red-500"
                                                    : "border-gray-300"
                                            } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                                            disabled={createLoading}
                                        />
                                        {createErrors.no_telepon && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {createErrors.no_telepon[0]}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={createFormData.status}
                                        onChange={(e) =>
                                            setCreateFormData({
                                                ...createFormData,
                                                status: e.target.value,
                                            })
                                        }
                                        className={`w-full px-4 py-3 border ${
                                            createErrors.status
                                                ? "border-red-500"
                                                : "border-gray-300"
                                        } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white`}
                                        disabled={createLoading}
                                    >
                                        <option value="">Pilih Status</option>
                                        <option value="dosen">Dosen</option>
                                        <option value="asdos">Asdos</option>
                                        <option value="staff">Staff</option>
                                        <option value="mahasiswa">
                                            Mahasiswa
                                        </option>
                                    </select>
                                    {createErrors.status && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {createErrors.status[0]}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        value={createFormData.password}
                                        onChange={(e) =>
                                            setCreateFormData({
                                                ...createFormData,
                                                password: e.target.value,
                                            })
                                        }
                                        className={`w-full px-4 py-3 border ${
                                            createErrors.password
                                                ? "border-red-500"
                                                : "border-gray-300"
                                        } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                                        placeholder="Minimal 8 karakter"
                                        disabled={createLoading}
                                    />
                                    {createErrors.password && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {createErrors.password[0]}
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowCreateModal(false)
                                        }
                                        className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition duration-200"
                                        disabled={createLoading}
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createLoading}
                                        className="flex-1 bg-gradient-to-r from-primary-700 to-primary-800 hover:from-primary-800 hover:to-primary-900 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {createLoading
                                            ? "Menyimpan..."
                                            : "Simpan User"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KelolaPengguna;
