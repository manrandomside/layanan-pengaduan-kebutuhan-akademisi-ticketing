import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { motion } from "motion/react";
import { Phone, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, ArrowLeft } from "lucide-react";

const LoginUser = () => {
    const navigate = useNavigate();
    const { loginUser } = useAuth();

    const [formData, setFormData] = useState({
        no_telepon: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (!formData.no_telepon || !formData.password) {
            setError("No telepon dan password wajib diisi");
            setLoading(false);
            return;
        }

        const result = await loginUser(formData.no_telepon, formData.password);

        if (result.success) {
            navigate("/dashboard");
        } else {
            setError(result.message);
        }

        setLoading(false);
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center relative overflow-hidden px-4"
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
                className="relative z-10 w-full max-w-md"
            >
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/20 p-8 md:p-10 border border-white/50">
                    {/* Logo */}
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
                            Masuk ke Akun
                        </h1>
                        <p className="text-primary-400 text-sm">
                            Sistem Layanan Pengaduan Kebutuhan Akademisi
                        </p>
                    </motion.div>

                    {/* Error */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
                        >
                            <p className="text-red-600 text-sm font-medium">{error}</p>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Phone */}
                        <div>
                            <label htmlFor="no_telepon" className="block text-sm font-semibold text-primary-800 mb-2">
                                No Telepon
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Phone size={18} className="text-primary-300" />
                                </div>
                                <input
                                    type="text"
                                    id="no_telepon"
                                    name="no_telepon"
                                    value={formData.no_telepon}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3.5 border border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-primary-50/30 text-primary-900 placeholder-primary-300"
                                    placeholder="08xxxxxxxxxx"
                                    disabled={loading}
                                />
                            </div>
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
                                    className="w-full pl-11 pr-12 py-3.5 border border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-primary-50/30 text-primary-900 placeholder-primary-300"
                                    placeholder="Masukkan password"
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
                        </div>

                        {/* Forgot password */}
                        <div className="flex justify-end">
                            <Link
                                to="/forgot-password"
                                className="text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors"
                            >
                                Lupa Password?
                            </Link>
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
                                    Masuk
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </motion.button>
                    </form>

                    {/* Links */}
                    <div className="mt-8 pt-6 border-t border-primary-100">
                        <p className="text-center text-sm text-primary-500">
                            Belum punya akun?{" "}
                            <Link to="/register" className="text-primary-700 hover:text-primary-900 font-bold transition-colors">
                                Daftar disini
                            </Link>
                        </p>
                        <div className="mt-4 flex items-center justify-center gap-2">
                            <ShieldCheck size={14} className="text-primary-300" />
                            <Link
                                to="/admin/login"
                                className="text-xs text-primary-400 hover:text-primary-600 font-medium transition-colors"
                            >
                                Login sebagai Admin
                            </Link>
                        </div>
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

export default LoginUser;
