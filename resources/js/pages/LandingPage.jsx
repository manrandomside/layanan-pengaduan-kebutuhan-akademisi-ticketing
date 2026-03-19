import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion, animate } from "motion/react";
import { useInView } from "react-intersection-observer";
import { TypeAnimation } from "react-type-animation";
import Marquee from "react-fast-marquee";
import {
    Ticket,
    Radio,
    Bell,
    Users,
    BarChart3,
    Flag,
    ChevronRight,
    Sparkles,
    ArrowRight,
    Menu,
    X,
    Mail,
    Phone,
} from "lucide-react";

// -- Animated counter component --
const AnimatedCounter = ({ target, suffix = "", duration = 2 }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });
    const hasAnimated = useRef(false);

    useEffect(() => {
        if (inView && !hasAnimated.current) {
            hasAnimated.current = true;
            const numericTarget =
                typeof target === "string"
                    ? parseInt(target.replace(/\D/g, ""), 10)
                    : target;
            animate(0, numericTarget, {
                duration,
                ease: "easeOut",
                onUpdate: (v) => setDisplayValue(Math.round(v)),
            });
        }
    }, [inView, target, duration]);

    return (
        <span ref={ref}>
            {displayValue}
            {suffix}
        </span>
    );
};

// -- Scroll reveal wrapper --
const RevealSection = ({ children, className = "", delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: "easeOut", delay }}
        className={className}
    >
        {children}
    </motion.div>
);

// -- Stagger animation variants --
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 100, damping: 15 },
    },
};

// -- Feature data --
const features = [
    {
        icon: Ticket,
        title: "Sistem Tiket Otomatis",
        desc: "Setiap keluhan mendapat nomor tiket unik untuk pelacakan mudah",
        span: "md:col-span-2",
    },
    {
        icon: Radio,
        title: "Pelacakan Real-time",
        desc: "Pantau status keluhan dari waiting hingga selesai secara langsung",
        span: "",
    },
    {
        icon: Bell,
        title: "Notifikasi Instant",
        desc: "Dapatkan pemberitahuan langsung saat ada perubahan status",
        span: "",
    },
    {
        icon: Users,
        title: "Multi-Role Access",
        desc: "Akses untuk mahasiswa, dosen, asisten dosen, dan staff",
        span: "md:col-span-2",
    },
    {
        icon: BarChart3,
        title: "Analisis & Feedback",
        desc: "Rating dan feedback untuk peningkatan kualitas layanan",
        span: "",
    },
    {
        icon: Flag,
        title: "Prioritas Keluhan",
        desc: "Sistem prioritas low, middle, high untuk penanganan efektif",
        span: "",
    },
];

// -- Steps data --
const steps = [
    {
        num: "01",
        title: "Ajukan Keluhan",
        desc: "Isi form keluhan dengan detail, pilih prioritas, dan gunakan tiket kamu",
    },
    {
        num: "02",
        title: "Lacak Status",
        desc: "Pantau perkembangan keluhan secara real-time dari dashboard",
    },
    {
        num: "03",
        title: "Selesai & Feedback",
        desc: "Terima notifikasi saat keluhan selesai dan berikan rating",
    },
];

// Stats are fetched from the API inside the component

// -- Departments for marquee --
const departments = [
    "Fakultas Teknik",
    "Fakultas Ekonomi",
    "Fakultas Hukum",
    "UPT Laboratorium",
    "Fakultas Kedokteran",
    "Fakultas MIPA",
    "Biro Akademik",
    "UPT Perpustakaan",
];

const LandingPage = () => {
    const { isAuthenticated, role, loading } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [liveStats, setLiveStats] = useState(null);

    // Fetch real stats from API using relative URL to avoid CORS issues
    useEffect(() => {
        fetch("/api/public/stats", {
            headers: { Accept: "application/json" },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) setLiveStats(data.data);
            })
            .catch(() => {});
    }, []);

    // Build stats array from API data
    const stats = liveStats
        ? [
              {
                  target: liveStats.complaints_resolved,
                  suffix: "",
                  label: "Keluhan Terselesaikan",
              },
              {
                  target: liveStats.satisfaction_percent,
                  suffix: "%",
                  label: "Tingkat Kepuasan",
              },
              {
                  target: liveStats.total_users,
                  suffix: "",
                  label: "Pengguna Terdaftar",
              },
              {
                  target: liveStats.total_complaints,
                  suffix: "",
                  label: "Total Keluhan Masuk",
              },
          ]
        : [];

    // Navbar scroll detection
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 60);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Smooth scroll to section
    const scrollToSection = (id) => {
        setMobileMenuOpen(false);
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
    };

    // Dashboard link based on role
    const dashboardLink =
        role === "admin" ? "/admin/dashboard" : "/dashboard";

    const navLinks = [
        { label: "Fitur", id: "fitur" },
        { label: "Cara Kerja", id: "cara-kerja" },
        { label: "Tentang", id: "tentang" },
    ];

    return (
        <div
            className="min-h-screen overflow-x-hidden"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
            {/* ===== NAVBAR ===== */}
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                    scrolled
                        ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-primary-100"
                        : "bg-transparent"
                }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 lg:h-20">
                        {/* Logo */}
                        <Link to="/" className="flex items-center">
                            <img
                                src="/images/logo_UPT.png"
                                alt="Logo"
                                className="h-14 lg:h-16 w-auto"
                            />
                        </Link>

                        {/* Desktop nav links */}
                        <div className="hidden md:flex items-center gap-8">
                            {navLinks.map((link) => (
                                <button
                                    key={link.id}
                                    onClick={() => scrollToSection(link.id)}
                                    className={`text-sm font-medium transition-colors duration-300 hover:opacity-80 cursor-pointer ${
                                        scrolled
                                            ? "text-primary-700"
                                            : "text-white/90"
                                    }`}
                                >
                                    {link.label}
                                </button>
                            ))}
                        </div>

                        {/* Auth buttons */}
                        <div className="hidden md:flex items-center gap-3">
                            {!loading && isAuthenticated ? (
                                <Link
                                    to={dashboardLink}
                                    className="px-5 py-2.5 bg-primary-800 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-all"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                                            scrolled
                                                ? "text-primary-800 hover:bg-primary-50"
                                                : "text-white hover:bg-white/10"
                                        }`}
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="px-5 py-2.5 bg-primary-800 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-all shadow-lg shadow-primary-800/25"
                                    >
                                        Daftar
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className={`md:hidden p-2 rounded-lg transition-colors ${
                                scrolled
                                    ? "text-primary-800"
                                    : "text-white"
                            }`}
                        >
                            {mobileMenuOpen ? (
                                <X size={24} />
                            ) : (
                                <Menu size={24} />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="md:hidden bg-white border-t border-primary-100 shadow-xl"
                    >
                        <div className="px-4 py-4 space-y-1">
                            {navLinks.map((link) => (
                                <button
                                    key={link.id}
                                    onClick={() => scrollToSection(link.id)}
                                    className="block w-full text-left px-4 py-3 text-sm font-medium text-primary-700 hover:bg-primary-50 rounded-lg"
                                >
                                    {link.label}
                                </button>
                            ))}
                            <div className="pt-3 border-t border-primary-100 flex flex-col gap-2">
                                {!loading && isAuthenticated ? (
                                    <Link
                                        to={dashboardLink}
                                        className="block text-center px-4 py-3 bg-primary-800 text-white text-sm font-semibold rounded-lg"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            to="/login"
                                            className="block text-center px-4 py-3 text-sm font-semibold text-primary-800 hover:bg-primary-50 rounded-lg"
                                        >
                                            Masuk
                                        </Link>
                                        <Link
                                            to="/register"
                                            className="block text-center px-4 py-3 bg-primary-800 text-white text-sm font-semibold rounded-lg"
                                        >
                                            Daftar
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </nav>

            {/* ===== HERO SECTION ===== */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-primary-900">
                {/* Animated gradient background */}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "linear-gradient(-45deg, #1a0f24, #371f4a, #4e395e, #74588c, #371f4a, #fcf74b33)",
                        backgroundSize: "400% 400%",
                        animation: "gradientShift 15s ease infinite",
                    }}
                />

                {/* Dot grid overlay */}
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                    }}
                />

                {/* Radial glow */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(252,247,75,0.08)_0%,_transparent_70%)]" />

                <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center pt-20">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-white/90 text-sm font-medium mb-8"
                    >
                        <Sparkles size={16} className="text-accent-300" />
                        Sistem Layanan Akademis Terpercaya
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6"
                    >
                        Kelola Keluhan Kampus
                        <br />
                        dengan{" "}
                        <span className="relative">
                            <span className="text-accent-300">
                                <TypeAnimation
                                    sequence={[
                                        "Cepat",
                                        2000,
                                        "Transparan",
                                        2000,
                                        "Efisien",
                                        2000,
                                        "Mudah",
                                        2000,
                                    ]}
                                    wrapper="span"
                                    speed={40}
                                    repeat={Infinity}
                                />
                            </span>
                            <span className="absolute -bottom-1 left-0 right-0 h-1 bg-accent-300/40 rounded-full" />
                        </span>
                    </motion.h1>

                    {/* Sub-headline */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed"
                    >
                        Platform terintegrasi untuk mengajukan, melacak, dan
                        menyelesaikan keluhan akademis secara real-time. Dari
                        mahasiswa, dosen, asisten dosen, hingga staff.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Link
                                to="/register"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-800 font-bold rounded-xl hover:shadow-2xl hover:shadow-white/20 transition-shadow text-base"
                            >
                                Mulai Sekarang
                                <ArrowRight size={18} />
                            </Link>
                        </motion.div>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <button
                                onClick={() => scrollToSection("cara-kerja")}
                                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all text-base cursor-pointer"
                            >
                                Lihat Cara Kerja
                                <ChevronRight size={18} />
                            </button>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Bottom gradient fade */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
            </section>

            {/* ===== SOCIAL PROOF / TRUST BAR ===== */}
            <section className="py-12 bg-primary-50/50">
                <RevealSection>
                    <p className="text-center text-sm font-medium text-primary-500 mb-6 tracking-wide uppercase">
                        Dipercaya oleh berbagai departemen dan fakultas
                    </p>
                    <Marquee
                        speed={40}
                        gradient
                        gradientColor="rgb(245, 243, 247)"
                        gradientWidth={80}
                        pauseOnHover
                    >
                        {departments.map((dept, i) => (
                            <div
                                key={i}
                                className="mx-8 flex items-center gap-2 text-primary-600/70 font-semibold text-base whitespace-nowrap"
                            >
                                <div className="w-2 h-2 rounded-full bg-primary-400/50" />
                                {dept}
                            </div>
                        ))}
                    </Marquee>
                </RevealSection>
            </section>

            {/* ===== FITUR UTAMA (Bento Grid) ===== */}
            <section id="fitur" className="py-20 lg:py-28 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <RevealSection className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-primary-900 mb-4">
                            Fitur yang Memudahkan Semua Pihak
                        </h2>
                        <p className="text-primary-500 text-lg max-w-2xl mx-auto">
                            Dirancang untuk memberikan pengalaman terbaik bagi
                            mahasiswa, dosen, dan admin
                        </p>
                    </RevealSection>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.15 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-5"
                    >
                        {features.map((feat, i) => (
                            <motion.div
                                key={i}
                                variants={itemVariants}
                                whileHover={{
                                    scale: 1.02,
                                    boxShadow:
                                        "0 20px 40px -12px rgba(55, 31, 74, 0.15)",
                                }}
                                className={`group relative p-7 rounded-2xl border border-primary-100 bg-white hover:border-primary-300 transition-all cursor-default ${feat.span}`}
                            >
                                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-5 group-hover:bg-primary-100 transition-colors">
                                    <feat.icon
                                        size={24}
                                        className="text-primary-700"
                                    />
                                </div>
                                <h3 className="text-lg font-bold text-primary-900 mb-2">
                                    {feat.title}
                                </h3>
                                <p className="text-primary-500 text-sm leading-relaxed">
                                    {feat.desc}
                                </p>
                                {/* Subtle gradient glow on hover */}
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-50/0 to-accent-300/0 group-hover:from-primary-50/50 group-hover:to-accent-300/5 transition-all pointer-events-none" />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ===== CARA KERJA ===== */}
            <section
                id="cara-kerja"
                className="py-20 lg:py-28 bg-primary-50/60"
            >
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <RevealSection className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-primary-900 mb-4">
                            Bagaimana Cara Kerjanya?
                        </h2>
                        <p className="text-primary-500 text-lg max-w-xl mx-auto">
                            Tiga langkah mudah untuk menyelesaikan keluhanmu
                        </p>
                    </RevealSection>

                    <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
                        {/* Connecting line (desktop) */}
                        <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200" />

                        {/* Connecting line (mobile) */}
                        <div className="md:hidden absolute top-0 bottom-0 left-8 w-0.5 bg-gradient-to-b from-primary-200 via-primary-400 to-primary-200" />

                        {steps.map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{
                                    duration: 0.5,
                                    delay: i * 0.15,
                                    ease: "easeOut",
                                }}
                                className="relative text-center md:text-center pl-16 md:pl-0"
                            >
                                {/* Number circle */}
                                <div className="absolute md:relative left-0 md:left-auto md:mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary-700 to-primary-900 flex items-center justify-center mb-6 shadow-lg shadow-primary-800/20">
                                    <span className="text-xl font-extrabold text-white">
                                        {step.num}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-primary-900 mb-3 mt-2 md:mt-0">
                                    {step.title}
                                </h3>
                                <p className="text-primary-500 text-sm leading-relaxed max-w-xs mx-auto">
                                    {step.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== STATISTIK ===== */}
            <section className="relative py-20 lg:py-28 overflow-hidden">
                {/* Dark purple background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950" />

                {/* Dot grid */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                    }}
                />

                <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {stats.length > 0 ? (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.2 }}
                            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
                        >
                            {stats.map((stat, i) => (
                                <motion.div
                                    key={i}
                                    variants={itemVariants}
                                    className="text-center p-6 lg:p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-colors"
                                >
                                    <div className="text-4xl lg:text-5xl font-extrabold text-white mb-2">
                                        <AnimatedCounter
                                            target={stat.target}
                                            suffix={stat.suffix}
                                            duration={2}
                                        />
                                    </div>
                                    <p className="text-white/60 text-sm font-medium">
                                        {stat.label}
                                    </p>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {[...Array(4)].map((_, i) => (
                                <div
                                    key={i}
                                    className="text-center p-6 lg:p-8 rounded-2xl bg-white/5 border border-white/10 animate-pulse"
                                >
                                    <div className="h-12 w-20 mx-auto bg-white/10 rounded mb-2" />
                                    <div className="h-4 w-28 mx-auto bg-white/10 rounded" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ===== TENTANG ===== */}
            <section id="tentang" className="py-20 lg:py-28 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        {/* Text */}
                        <motion.div
                            initial={{ opacity: 0, x: -40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                        >
                            <span className="inline-block px-3 py-1 bg-primary-50 text-primary-700 text-xs font-semibold rounded-full mb-4 uppercase tracking-wider">
                                Tentang Kami
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-primary-900 mb-6 leading-tight">
                                Tentang Sistem Layanan Pengaduan
                            </h2>
                            <p className="text-primary-500 leading-relaxed mb-6">
                                Sistem Layanan Pengaduan Kebutuhan Akademisi
                                dikembangkan oleh PT Citra Konsultama Indonesia
                                untuk memberikan solusi pengelolaan keluhan yang
                                transparan, efisien, dan terintegrasi di
                                lingkungan akademis.
                            </p>
                            <p className="text-primary-500 leading-relaxed">
                                Dengan teknologi real-time dan antarmuka yang
                                intuitif, kami memastikan setiap keluhan
                                ditangani dengan cepat dan profesional.
                            </p>
                        </motion.div>

                        {/* Visual mockup */}
                        <motion.div
                            initial={{ opacity: 0, x: 40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{
                                duration: 0.6,
                                ease: "easeOut",
                                delay: 0.1,
                            }}
                            className="relative"
                        >
                            <div className="relative mx-auto max-w-md">
                                {/* Background card */}
                                <div className="absolute -top-4 -right-4 w-full h-full rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200/50" />

                                {/* Main card */}
                                <div className="relative bg-white rounded-2xl shadow-xl border border-primary-100 p-6 space-y-4">
                                    {/* Header bar mockup */}
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-3 h-3 rounded-full bg-red-400" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                        <div className="w-3 h-3 rounded-full bg-green-400" />
                                        <div className="ml-4 flex-1 h-4 bg-primary-50 rounded" />
                                    </div>

                                    {/* Ticket card mockups */}
                                    {[
                                        {
                                            status: "Selesai",
                                            color: "bg-green-100 text-green-700",
                                            priority: "High",
                                        },
                                        {
                                            status: "Diproses",
                                            color: "bg-blue-100 text-blue-700",
                                            priority: "Medium",
                                        },
                                        {
                                            status: "Menunggu",
                                            color: "bg-amber-100 text-amber-700",
                                            priority: "Low",
                                        },
                                    ].map((item, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-4 p-3 rounded-xl bg-primary-50/50 border border-primary-100"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                                                <Ticket
                                                    size={18}
                                                    className="text-primary-600"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="h-3 w-32 bg-primary-200/60 rounded mb-1.5" />
                                                <div className="h-2.5 w-20 bg-primary-100 rounded" />
                                            </div>
                                            <span
                                                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${item.color}`}
                                            >
                                                {item.status}
                                            </span>
                                        </div>
                                    ))}

                                    {/* Stats bar mockup */}
                                    <div className="grid grid-cols-3 gap-3 pt-2">
                                        {[
                                            { val: "12", lbl: "Total" },
                                            { val: "8", lbl: "Selesai" },
                                            { val: "4", lbl: "Proses" },
                                        ].map((s, i) => (
                                            <div
                                                key={i}
                                                className="text-center p-2 bg-primary-50 rounded-lg"
                                            >
                                                <div className="text-lg font-bold text-primary-800">
                                                    {s.val}
                                                </div>
                                                <div className="text-xs text-primary-400">
                                                    {s.lbl}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Floating notification mockup */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.5, duration: 0.4 }}
                                    className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg border border-primary-100 p-3 flex items-center gap-3"
                                >
                                    <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
                                        <Bell
                                            size={16}
                                            className="text-green-600"
                                        />
                                    </div>
                                    <div>
                                        <div className="text-xs font-semibold text-primary-800">
                                            Keluhan diselesaikan
                                        </div>
                                        <div className="text-xs text-primary-400">
                                            Baru saja
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ===== CTA AKHIR ===== */}
            <section className="relative py-20 lg:py-28 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-800 via-primary-900 to-primary-950" />

                {/* Dot grid */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                    }}
                />

                {/* Radial glow */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(252,247,75,0.06)_0%,_transparent_60%)]" />

                <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
                    <RevealSection>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
                            Siap Mengelola Keluhan dengan Lebih Baik?
                        </h2>
                        <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
                            Daftar sekarang dan mulai ajukan keluhan akademis
                            kamu
                        </p>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                            className="inline-block"
                        >
                            <Link
                                to="/register"
                                className="inline-flex items-center gap-2 px-10 py-4 bg-white text-primary-800 font-bold rounded-xl text-lg hover:shadow-2xl hover:shadow-white/20 transition-shadow"
                            >
                                Daftar Gratis
                                <ArrowRight size={20} />
                            </Link>
                        </motion.div>
                    </RevealSection>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer className="bg-primary-950 pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
                        {/* Company info */}
                        <div>
                            <Link
                                to="/"
                                className="flex items-center mb-4"
                            >
                                <img
                                    src="/images/logo_UPT.png"
                                    alt="Logo"
                                    className="h-14 w-auto brightness-200"
                                />
                            </Link>
                            <p className="text-white/40 text-sm leading-relaxed">
                                Sistem pengelolaan keluhan akademis oleh PT
                                Citra Konsultama Indonesia. Transparan, efisien,
                                dan terintegrasi.
                            </p>
                        </div>

                        {/* Navigation */}
                        <div>
                            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
                                Navigasi
                            </h4>
                            <ul className="space-y-3">
                                {navLinks.map((link) => (
                                    <li key={link.id}>
                                        <button
                                            onClick={() =>
                                                scrollToSection(link.id)
                                            }
                                            className="text-white/50 text-sm hover:text-white/80 transition-colors cursor-pointer"
                                        >
                                            {link.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Access */}
                        <div>
                            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
                                Akses
                            </h4>
                            <ul className="space-y-3">
                                <li>
                                    <Link
                                        to="/login"
                                        className="text-white/50 text-sm hover:text-white/80 transition-colors"
                                    >
                                        Login User
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/admin/login"
                                        className="text-white/50 text-sm hover:text-white/80 transition-colors"
                                    >
                                        Login Admin
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/register"
                                        className="text-white/50 text-sm hover:text-white/80 transition-colors"
                                    >
                                        Register
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
                                Kontak
                            </h4>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-2 text-white/50 text-sm">
                                    <Mail size={14} />
                                    support@citra-konsultama.co.id
                                </li>
                                <li className="flex items-center gap-2 text-white/50 text-sm">
                                    <Phone size={14} />
                                    (021) 123-4567
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Divider + copyright */}
                    <div className="border-t border-white/10 pt-8">
                        <p className="text-center text-white/30 text-sm">
                            &copy; 2026 PT Citra Konsultama Indonesia. All
                            rights reserved.
                        </p>
                    </div>
                </div>
            </footer>

            {/* CSS keyframes for gradient animation */}
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

export default LandingPage;
