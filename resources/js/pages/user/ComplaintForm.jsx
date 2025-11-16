import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Navbar from "../../components/user/Navbar";
import axiosInstance from "../../config/axios";

const ComplaintForm = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        kelas: "",
        lab: "",
        ruangan: "",
        keluhan: "",
        priority: "",
    });
    const [errors, setErrors] = useState({});
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [ticketBalance, setTicketBalance] = useState(0);
    const [availableTickets, setAvailableTickets] = useState([]);

    useEffect(() => {
        fetchTicketBalance();
        fetchAvailableTickets();
    }, []);

    const fetchTicketBalance = async () => {
        try {
            const response = await axiosInstance.get("/user/tickets/balance");
            setTicketBalance(response.data.total_tickets || 0);
        } catch (error) {
            console.error("Error fetching ticket balance:", error);
        }
    };

    const fetchAvailableTickets = async () => {
        try {
            const response = await axiosInstance.get("/user/tickets/balance");
            const tickets = response.data.available_tickets || [];
            setAvailableTickets(tickets);
        } catch (error) {
            console.error("Error fetching available tickets:", error);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setErrors({
            ...errors,
            [e.target.name]: "",
        });
        setErrorMessage("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setErrorMessage("");

        if (!formData.keluhan.trim()) {
            setErrors({ keluhan: "Keluhan wajib diisi" });
            return;
        }

        if (!formData.priority) {
            setErrors({ priority: "Priority wajib dipilih" });
            return;
        }

        if (ticketBalance <= 0) {
            setErrorMessage(
                "Anda tidak memiliki tiket. Silakan claim tiket terlebih dahulu."
            );
            return;
        }

        setLoading(true);

        try {
            const response = await axiosInstance.post("/user/complaints", {
                kelas: formData.kelas || null,
                lab: formData.lab || null,
                ruangan: formData.ruangan || null,
                keluhan: formData.keluhan,
                priority: formData.priority,
            });

            alert(response.data.message || "Keluhan berhasil diajukan!");
            navigate("/keluhan/list");
        } catch (error) {
            const message =
                error.response?.data?.message || "Gagal mengajukan keluhan";
            setErrorMessage(message);

            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <button
                        onClick={() => navigate("/dashboard")}
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
                        Kembali ke Dashboard
                    </button>

                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Ajukan Keluhan Baru
                    </h1>
                    <p className="text-gray-600">
                        Isi form di bawah ini untuk mengajukan keluhan
                    </p>
                </div>

                {errorMessage && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{errorMessage}</p>
                    </div>
                )}

                {ticketBalance <= 0 && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800 text-sm font-medium">
                            Anda tidak memiliki tiket. Silakan claim tiket di
                            dashboard terlebih dahulu.
                        </p>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-600">
                                Tiket Tersedia
                            </p>
                            <p className="text-2xl font-bold text-green-600">
                                {ticketBalance}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500">
                                1 keluhan = 1 tiket
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Data User - Auto Filled & Read Only */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nama Lengkap
                                </label>
                                <input
                                    type="text"
                                    value={user?.nama_lengkap || ""}
                                    readOnly
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    NIM/NIP
                                </label>
                                <input
                                    type="text"
                                    value={user?.nim_nip || ""}
                                    readOnly
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={user?.email || ""}
                                    readOnly
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    No Telepon
                                </label>
                                <input
                                    type="text"
                                    value={user?.no_telepon || ""}
                                    readOnly
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <input
                                type="text"
                                value={user?.status || ""}
                                readOnly
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed capitalize"
                            />
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                Detail Keluhan
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label
                                        htmlFor="kelas"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Kelas{" "}
                                        <span className="text-gray-400">
                                            (Opsional)
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        id="kelas"
                                        name="kelas"
                                        value={formData.kelas}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="Contoh: IF-2A"
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="lab"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Lab{" "}
                                        <span className="text-gray-400">
                                            (Opsional)
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        id="lab"
                                        name="lab"
                                        value={formData.lab}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="Contoh: Lab Komputer 1"
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="ruangan"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Ruangan{" "}
                                        <span className="text-gray-400">
                                            (Opsional)
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        id="ruangan"
                                        name="ruangan"
                                        value={formData.ruangan}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="Contoh: R.101"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="mt-6">
                                <label
                                    htmlFor="priority"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Priority{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="priority"
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border ${
                                        errors.priority
                                            ? "border-red-500"
                                            : "border-gray-300"
                                    } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white`}
                                    disabled={loading}
                                >
                                    <option value="">Pilih Priority</option>
                                    <option value="low">
                                        Low - Tidak Mendesak
                                    </option>
                                    <option value="middle">
                                        Middle - Cukup Penting
                                    </option>
                                    <option value="high">
                                        High - Sangat Mendesak
                                    </option>
                                </select>
                                {errors.priority && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.priority}
                                    </p>
                                )}
                            </div>

                            <div className="mt-6">
                                <label
                                    htmlFor="keluhan"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Keluhan{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="keluhan"
                                    name="keluhan"
                                    value={formData.keluhan}
                                    onChange={handleChange}
                                    rows="5"
                                    className={`w-full px-4 py-3 border ${
                                        errors.keluhan
                                            ? "border-red-500"
                                            : "border-gray-300"
                                    } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                                    placeholder="Jelaskan keluhan Anda secara detail..."
                                    disabled={loading}
                                />
                                {errors.keluhan && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.keluhan}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-4 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => navigate("/dashboard")}
                                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition duration-200"
                                disabled={loading}
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={loading || ticketBalance <= 0}
                                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ backgroundColor: "#439454" }}
                            >
                                {loading ? "Mengirim..." : "Kirim Keluhan"}
                            </button>
                        </div>

                        <p className="text-xs text-gray-500 text-center mt-4">
                            Dengan mengirim keluhan, 1 tiket akan digunakan dari
                            saldo Anda
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ComplaintForm;
