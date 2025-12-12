import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/admin/Navbar";
import Footer from "../../Components/admin/Footer";
import axiosInstance from "../../config/axios";

const KelolaPengguna = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [statusFilter, setStatusFilter] = useState("all");
    const [activeFilter, setActiveFilter] = useState("all");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [initialLoading, setInitialLoading] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [paginationMeta, setPaginationMeta] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 0,
        from: null,
        to: null,
    });

    // Create user modal state
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

    // Deactivate confirmation modal state
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [userToDeactivate, setUserToDeactivate] = useState(null);
    const [deactivateLoading, setDeactivateLoading] = useState(false);

    // Fetch users from API with search, filter, and pagination
    const fetchUsers = useCallback(
        async (isInitial = false) => {
            if (isInitial) {
                setInitialLoading(true);
            } else {
                setSearchLoading(true);
            }

            try {
                const params = {
                    page: currentPage,
                    per_page: 20,
                };

                if (searchKeyword) {
                    params.search = searchKeyword;
                }

                if (statusFilter !== "all") {
                    params.status = statusFilter;
                }

                if (activeFilter !== "all") {
                    params.is_active = activeFilter;
                }

                const response = await axiosInstance.get("/admin/users", {
                    params,
                });
                setUsers(response.data.data || []);

                if (response.data.meta) {
                    setPaginationMeta(response.data.meta);
                }
            } catch (error) {
                console.error("Error fetching users:", error);
            }

            setInitialLoading(false);
            setSearchLoading(false);
        },
        [currentPage, searchKeyword, statusFilter, activeFilter]
    );

    // Initial load
    useEffect(() => {
        fetchUsers(true);
    }, []);

    // Fetch when page changes
    useEffect(() => {
        if (!initialLoading) {
            fetchUsers(false);
        }
    }, [currentPage]);

    // Debounce search - fetch dari API setelah user berhenti mengetik
    useEffect(() => {
        if (initialLoading) return;

        const timer = setTimeout(() => {
            setCurrentPage(1);
            fetchUsers(false);
        }, 800);

        return () => clearTimeout(timer);
    }, [searchKeyword]);

    // Fetch when filters change
    useEffect(() => {
        if (initialLoading) return;

        setCurrentPage(1);
        fetchUsers(false);
    }, [statusFilter, activeFilter]);

    // Subscribe to real-time user registration events
    useEffect(() => {
        const channel = window.Echo.channel("admin-channel");

        channel.listen(".UserRegistered", (event) => {
            const newUser = {
                user_id: event.user_id,
                nama_lengkap: event.nama_lengkap,
                nim_nip: event.nim_nip,
                email: event.email,
                no_telepon: event.no_telepon,
                status: event.status,
                is_active: event.is_active,
                total_tickets: event.total_tickets,
                daily_tickets: event.daily_tickets,
                created_at: event.created_at,
            };

            // Add new user to the list if on first page and no active filters/search
            setUsers((prev) => {
                const exists = prev.some((u) => u.user_id === newUser.user_id);
                if (exists) return prev;

                // Only add to list if viewing all users on first page
                if (
                    currentPage === 1 &&
                    statusFilter === "all" &&
                    activeFilter === "all" &&
                    !searchKeyword
                ) {
                    return [newUser, ...prev];
                }
                return prev;
            });

            // Update pagination total
            setPaginationMeta((prev) => ({
                ...prev,
                total: prev.total + 1,
            }));

            // Show notification message
            setMessage({
                type: "success",
                text: `User baru "${event.nama_lengkap}" telah terdaftar`,
            });
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        });

        return () => {
            channel.stopListening(".UserRegistered");
            window.Echo.leave("admin-channel");
        };
    }, [currentPage, statusFilter, activeFilter, searchKeyword]);

    // Open deactivate confirmation modal
    const openDeactivateModal = (user) => {
        setUserToDeactivate(user);
        setShowDeactivateModal(true);
    };

    // Close deactivate confirmation modal
    const closeDeactivateModal = () => {
        setShowDeactivateModal(false);
        setUserToDeactivate(null);
    };

    // Handle deactivate user with modal confirmation
    const handleDeactivateUser = async () => {
        if (!userToDeactivate) return;

        setDeactivateLoading(true);

        try {
            const response = await axiosInstance.put(
                `/admin/users/${userToDeactivate.user_id}/deactivate`
            );
            setMessage({
                type: "success",
                text: response.data.message || "User berhasil dinonaktifkan",
            });
            closeDeactivateModal();
            fetchUsers(false);
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        } catch (error) {
            const errorMsg =
                error.response?.data?.message || "Gagal menonaktifkan user";
            setMessage({ type: "error", text: errorMsg });
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        }

        setDeactivateLoading(false);
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
            fetchUsers(false);
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
            fetchUsers(false);
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

    // Clear search
    const handleClearSearch = () => {
        setSearchKeyword("");
    };

    // Pagination handlers
    const handlePageChange = (page) => {
        if (page >= 1 && page <= paginationMeta.last_page) {
            setCurrentPage(page);
        }
    };

    // Generate pagination numbers
    const getPaginationNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        const lastPage = paginationMeta.last_page;

        if (lastPage <= maxVisible) {
            for (let i = 1; i <= lastPage; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push("...");
                pages.push(lastPage);
            } else if (currentPage >= lastPage - 2) {
                pages.push(1);
                pages.push("...");
                for (let i = lastPage - 3; i <= lastPage; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push("...");
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push("...");
                pages.push(lastPage);
            }
        }

        return pages;
    };

    // Full page loading hanya untuk initial load
    if (initialLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                            className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-primary-700 to-primary-800 hover:from-primary-800 hover:to-primary-900 text-white font-semibold rounded-lg transition duration-200 shadow-lg hover:shadow-xl"
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

                {/* Search Bar */}
                <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg
                                className="h-5 w-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>
                        <input
                            type="text"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            placeholder="Cari berdasarkan nama, NIM/NIP, email, atau no telepon..."
                            className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                        />
                        {searchKeyword && (
                            <button
                                onClick={handleClearSearch}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                <svg
                                    className="h-5 w-5 text-gray-400 hover:text-gray-600"
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
                        )}
                    </div>
                    {searchKeyword && (
                        <p className="mt-2 text-sm text-gray-500">
                            Menampilkan hasil pencarian untuk "{searchKeyword}"
                        </p>
                    )}
                </div>

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
                                Semua
                            </button>
                            <button
                                onClick={() => setStatusFilter("dosen")}
                                className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                                    statusFilter === "dosen"
                                        ? "bg-primary-700 text-white shadow-lg"
                                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                Dosen
                            </button>
                            <button
                                onClick={() => setStatusFilter("asdos")}
                                className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                                    statusFilter === "asdos"
                                        ? "bg-primary-700 text-white shadow-lg"
                                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                Asdos
                            </button>
                            <button
                                onClick={() => setStatusFilter("staff")}
                                className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                                    statusFilter === "staff"
                                        ? "bg-primary-700 text-white shadow-lg"
                                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                Staff
                            </button>
                            <button
                                onClick={() => setStatusFilter("mahasiswa")}
                                className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                                    statusFilter === "mahasiswa"
                                        ? "bg-primary-700 text-white shadow-lg"
                                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                Mahasiswa
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

                {/* Users Table Area */}
                {searchLoading ? (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700 mx-auto mb-4"></div>
                        <p className="text-gray-600">Mencari user...</p>
                    </div>
                ) : users.length === 0 ? (
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
                            {searchKeyword
                                ? `Tidak ditemukan user dengan kata kunci "${searchKeyword}"`
                                : "Belum ada user dengan filter yang dipilih"}
                        </p>
                    </div>
                ) : (
                    <>
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
                                        {users.map((user) => (
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
                                                                {
                                                                    user.nama_lengkap
                                                                }
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
                                                        {user.is_active ===
                                                        "active"
                                                            ? "Aktif"
                                                            : "Tidak Aktif"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    {user.is_active ===
                                                    "active" ? (
                                                        <button
                                                            onClick={() =>
                                                                openDeactivateModal(
                                                                    user
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

                        {/* Pagination */}
                        {paginationMeta.last_page > 1 && (
                            <div className="bg-white rounded-xl shadow-md p-4 mt-6">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="text-sm text-gray-600">
                                        Menampilkan {paginationMeta.from || 0} -{" "}
                                        {paginationMeta.to || 0} dari{" "}
                                        {paginationMeta.total} user
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {/* Previous Button */}
                                        <button
                                            onClick={() =>
                                                handlePageChange(
                                                    currentPage - 1
                                                )
                                            }
                                            disabled={currentPage === 1}
                                            className={`px-3 py-2 rounded-lg font-medium transition duration-200 ${
                                                currentPage === 1
                                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            }`}
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
                                                    d="M15 19l-7-7 7-7"
                                                />
                                            </svg>
                                        </button>

                                        {/* Page Numbers */}
                                        {getPaginationNumbers().map(
                                            (page, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() =>
                                                        typeof page ===
                                                            "number" &&
                                                        handlePageChange(page)
                                                    }
                                                    disabled={page === "..."}
                                                    className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                                                        page === currentPage
                                                            ? "bg-primary-700 text-white shadow-lg"
                                                            : page === "..."
                                                            ? "bg-transparent text-gray-400 cursor-default"
                                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            )
                                        )}

                                        {/* Next Button */}
                                        <button
                                            onClick={() =>
                                                handlePageChange(
                                                    currentPage + 1
                                                )
                                            }
                                            disabled={
                                                currentPage ===
                                                paginationMeta.last_page
                                            }
                                            className={`px-3 py-2 rounded-lg font-medium transition duration-200 ${
                                                currentPage ===
                                                paginationMeta.last_page
                                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            }`}
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
                                                    d="M9 5l7 7-7 7"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Deactivate User Confirmation Modal */}
            {showDeactivateModal && userToDeactivate && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                    <svg
                                        className="w-8 h-8 text-red-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                        />
                                    </svg>
                                </div>
                            </div>

                            <h2 className="text-xl font-bold text-gray-800 text-center mb-2">
                                Konfirmasi Nonaktifkan User
                            </h2>

                            <p className="text-gray-600 text-center mb-6">
                                Apakah Anda yakin ingin menonaktifkan{" "}
                                <span className="font-semibold text-gray-800">
                                    {userToDeactivate.nama_lengkap}
                                </span>
                                ? User yang dinonaktifkan tidak akan dapat login
                                ke sistem.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={closeDeactivateModal}
                                    disabled={deactivateLoading}
                                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeactivateUser}
                                    disabled={deactivateLoading}
                                    className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {deactivateLoading
                                        ? "Memproses..."
                                        : "Ya, Nonaktifkan"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                                        className="flex-1 bg-linear-to-r from-primary-700 to-primary-800 hover:from-primary-800 hover:to-primary-900 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
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

            <Footer />
        </div>
    );
};

export default KelolaPengguna;
