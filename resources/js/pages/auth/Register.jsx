import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        nama_lengkap: "",
        nim_nip: "",
        email: "",
        no_telepon: "",
        status: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

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
        setLoading(true);

        const result = await register(formData);

        if (result.success) {
            navigate("/dashboard");
        } else {
            setErrorMessage(result.message);
            if (result.errors) {
                setErrors(result.errors);
            }
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-green-50 px-4 py-8">
            <div className="w-full max-w-2xl">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            Registrasi Akun
                        </h1>
                        <p className="text-gray-600">
                            Sistem Layanan Pengaduan Kebutuhan Akademisi
                        </p>
                    </div>

                    {errorMessage && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm">
                                {errorMessage}
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label
                                    htmlFor="nama_lengkap"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Nama Lengkap
                                </label>
                                <input
                                    type="text"
                                    id="nama_lengkap"
                                    name="nama_lengkap"
                                    value={formData.nama_lengkap}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border ${
                                        errors.nama_lengkap
                                            ? "border-red-500"
                                            : "border-gray-300"
                                    } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200`}
                                    placeholder="Masukkan nama lengkap"
                                    disabled={loading}
                                />
                                {errors.nama_lengkap && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.nama_lengkap[0]}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="nim_nip"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    NIM/NIP
                                </label>
                                <input
                                    type="text"
                                    id="nim_nip"
                                    name="nim_nip"
                                    value={formData.nim_nip}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border ${
                                        errors.nim_nip
                                            ? "border-red-500"
                                            : "border-gray-300"
                                    } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200`}
                                    placeholder="Masukkan NIM/NIP"
                                    disabled={loading}
                                />
                                {errors.nim_nip && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.nim_nip[0]}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border ${
                                        errors.email
                                            ? "border-red-500"
                                            : "border-gray-300"
                                    } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200`}
                                    placeholder="contoh@email.com"
                                    disabled={loading}
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.email[0]}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="no_telepon"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    No Telepon
                                </label>
                                <input
                                    type="text"
                                    id="no_telepon"
                                    name="no_telepon"
                                    value={formData.no_telepon}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border ${
                                        errors.no_telepon
                                            ? "border-red-500"
                                            : "border-gray-300"
                                    } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200`}
                                    placeholder="08xxxxxxxxxx"
                                    disabled={loading}
                                />
                                {errors.no_telepon && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.no_telepon[0]}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="status"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Status
                            </label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border ${
                                    errors.status
                                        ? "border-red-500"
                                        : "border-gray-300"
                                } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 bg-white`}
                                disabled={loading}
                            >
                                <option value="">Pilih Status</option>
                                <option value="dosen">Dosen</option>
                                <option value="asdos">Asdos</option>
                                <option value="staff">Staff</option>
                                <option value="mahasiswa">Mahasiswa</option>
                            </select>
                            {errors.status && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.status[0]}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border ${
                                        errors.password
                                            ? "border-red-500"
                                            : "border-gray-300"
                                    } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200`}
                                    placeholder="Minimal 8 karakter"
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
                            {errors.password && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.password[0]}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: "#439454" }}
                        >
                            {loading ? "Loading..." : "Daftar"}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-600">
                        Sudah punya akun?{" "}
                        <Link
                            to="/login"
                            className="text-green-600 hover:text-green-700 font-semibold"
                        >
                            Login disini
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
