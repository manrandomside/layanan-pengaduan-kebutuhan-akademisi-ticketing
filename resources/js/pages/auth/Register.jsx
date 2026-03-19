import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { motion } from "motion/react";
import {
    User,
    Hash,
    Mail,
    Phone,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    ArrowLeft,
    AlertTriangle,
    GraduationCap,
} from "lucide-react";

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
        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: "",
            });
        }
        setErrorMessage("");
    };

    const getFieldError = (fieldName) => {
        if (!errors[fieldName]) return null;
        if (Array.isArray(errors[fieldName])) {
            return errors[fieldName][0];
        }
        return errors[fieldName];
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
            if (result.errors) {
                setErrors(result.errors);
                if (result.errors.email) {
                    setErrorMessage(getFieldError("email") || result.message);
                } else if (result.errors.no_telepon) {
                    setErrorMessage(getFieldError("no_telepon") || result.message);
                } else if (result.errors.nim_nip) {
                    setErrorMessage(getFieldError("nim_nip") || result.message);
                } else {
                    setErrorMessage(result.message);
                }
            } else {
                setErrorMessage(result.message);
            }
        }

        setLoading(false);
    };

    // Input field component for cleaner JSX
    const InputField = ({ icon: Icon, label, name, type = "text", placeholder, children }) => (
        <div>
            <label htmlFor={name} className="block text-sm font-semibold text-primary-800 mb-2">
                {label}
            </label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Icon size={18} className="text-primary-300" />
                </div>
                <input
                    type={type}
                    id={name}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-3.5 border ${
                        errors[name] ? "border-red-400 bg-red-50/30" : "border-primary-200 bg-primary-50/30"
                    } rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-primary-900 placeholder-primary-300`}
                    placeholder={placeholder}
                    disabled={loading}
                />
                {children}
            </div>
            {getFieldError(name) && (
                <p className="text-red-500 text-xs mt-1.5 font-medium">{getFieldError(name)}</p>
            )}
        </div>
    );

    return (
        <div
            className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-8"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
            {/* Animated gradient background */}
            <div
                className="absolute inset-0"
                style={{
                    background: "linear-gradient(-45deg, #1a0f24, #371f4a, #4e395e, #74588c, #371f4a)",
                    backgroundSize: "400% 400%",
                    animation: "gradientShift 15s ease infinite",
                }}
            />

            {/* Dot grid overlay */}
            <div
                className="absolute inset-0 opacity-15"
                style={{
                    backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                }}
            />

            {/* Back to home */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="absolute top-6 left-6 z-20"
            >
                <Link
                    to="/"
                    className="flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium transition-colors"
                >
                    <ArrowLeft size={16} />
                    Kembali
                </Link>
            </motion.div>

            {/* Card */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 w-full max-w-2xl"
            >
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/20 p-8 md:p-10 border border-white/50">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.15 }}
                        className="text-center mb-8"
                    >
                        <div className="flex justify-center mb-4">
                            <img src="/images/logo_UPT.png" alt="Logo" className="h-20 w-auto" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-primary-900 mb-1">
                            Buat Akun Baru
                        </h1>
                        <p className="text-primary-400 text-sm">
                            Daftar untuk mulai mengajukan keluhan akademis
                        </p>
                    </motion.div>

                    {/* Error */}
                    {errorMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
                        >
                            <p className="text-red-600 text-sm font-medium">{errorMessage}</p>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Row 1: Name + NIM */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <InputField
                                icon={User}
                                label="Nama Lengkap"
                                name="nama_lengkap"
                                placeholder="Masukkan nama lengkap"
                            />
                            <InputField
                                icon={Hash}
                                label="NIM/NIP"
                                name="nim_nip"
                                placeholder="Masukkan NIM/NIP"
                            />
                        </div>

                        {/* Email */}
                        <InputField
                            icon={Mail}
                            label="Email"
                            name="email"
                            type="email"
                            placeholder="contoh@email.com"
                        />

                        {/* Email warning */}
                        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                            <div className="flex items-start gap-2.5">
                                <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-amber-800 text-sm font-semibold">
                                        Pastikan email Anda benar!
                                    </p>
                                    <p className="text-amber-700 text-xs mt-1 leading-relaxed">
                                        Email ini akan digunakan untuk ubah password ketika lupa dan verifikasi
                                        saat mengubah data akun seperti email dan nomor telepon. Pastikan Anda
                                        memiliki akses ke email ini.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Phone */}
                        <InputField
                            icon={Phone}
                            label="No Telepon"
                            name="no_telepon"
                            placeholder="08xxxxxxxxxx"
                        />

                        {/* Status */}
                        <div>
                            <label htmlFor="status" className="block text-sm font-semibold text-primary-800 mb-2">
                                Status
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <GraduationCap size={18} className="text-primary-300" />
                                </div>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className={`w-full pl-11 pr-4 py-3.5 border ${
                                        errors.status
                                            ? "border-red-400 bg-red-50/30"
                                            : "border-primary-200 bg-primary-50/30"
                                    } rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-primary-900 appearance-none cursor-pointer`}
                                    disabled={loading}
                                >
                                    <option value="">Pilih Status</option>
                                    <option value="mahasiswa">Mahasiswa</option>
                                    <option value="dosen">Dosen</option>
                                    <option value="asdos">Asisten Dosen</option>
                                    <option value="staff">Staff</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                            {getFieldError("status") && (
                                <p className="text-red-500 text-xs mt-1.5 font-medium">{getFieldError("status")}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-primary-800 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock size={18} className="text-primary-300" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`w-full pl-11 pr-12 py-3.5 border ${
                                        errors.password
                                            ? "border-red-400 bg-red-50/30"
                                            : "border-primary-200 bg-primary-50/30"
                                    } rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-primary-900 placeholder-primary-300`}
                                    placeholder="Minimal 6 karakter"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-primary-400 hover:text-primary-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {getFieldError("password") && (
                                <p className="text-red-500 text-xs mt-1.5 font-medium">{getFieldError("password")}</p>
                            )}
                        </div>

                        {/* Submit */}
                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: loading ? 1 : 1.02 }}
                            whileTap={{ scale: loading ? 1 : 0.98 }}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary-700 to-primary-900 hover:from-primary-800 hover:to-primary-950 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary-800/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Daftar Sekarang
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </motion.button>
                    </form>

                    {/* Links */}
                    <div className="mt-8 pt-6 border-t border-primary-100">
                        <p className="text-center text-sm text-primary-500">
                            Sudah punya akun?{" "}
                            <Link to="/login" className="text-primary-700 hover:text-primary-900 font-bold transition-colors">
                                Login disini
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>

            <style>{`
                @keyframes gradientShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>
        </div>
    );
};

export default Register;
