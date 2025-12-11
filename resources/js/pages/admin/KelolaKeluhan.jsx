import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/admin/Navbar";
import Footer from "../../Components/admin/Footer";
import axiosInstance from "../../config/axios";

const KelolaKeluhan = () => {
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [filteredComplaints, setFilteredComplaints] = useState([]);
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [selectedComplaints, setSelectedComplaints] = useState([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    // Fetch complaints from API with search parameter
    const fetchComplaints = useCallback(
        async (search = "", isInitial = false) => {
            if (isInitial) {
                setInitialLoading(true);
            } else {
                setSearchLoading(true);
            }

            try {
                const params = {};
                if (search) {
                    params.search = search;
                }
                const response = await axiosInstance.get("/admin/complaints", {
                    params,
                });
                setComplaints(response.data.data || []);
            } catch (error) {
                console.error("Error fetching complaints:", error);
            }

            setInitialLoading(false);
            setSearchLoading(false);
        },
        []
    );

    // Initial load
    useEffect(() => {
        fetchComplaints("", true);
    }, []);

    // Debounce search - fetch dari API setelah user berhenti mengetik
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchComplaints(searchKeyword, false);
        }, 800);

        return () => clearTimeout(debounceTimer);
    }, [searchKeyword]);

    // Subscribe to real-time events from admin channel
    useEffect(() => {
        const channel = window.Echo.channel("admin-channel");

        // Listen for new complaint submissions
        channel.listen(".ComplaintSubmitted", (event) => {
            const newComplaint = {
                complaint_id: event.complaint_id,
                ticket_id: event.ticket_id,
                nama_lengkap: event.nama_lengkap,
                nim_nip: event.nim_nip,
                email: event.email || "",
                no_telepon: event.no_telepon || "",
                priority: event.priority,
                keluhan: event.keluhan,
                status: event.status || "waiting",
                status_user: event.status_user || "mahasiswa",
                kelas: event.kelas || null,
                lab: event.lab || null,
                ruangan: event.ruangan || null,
                is_hidden: event.is_hidden || "visible",
                created_at: event.created_at,
            };

            setComplaints((prev) => {
                const exists = prev.some(
                    (c) => c.complaint_id === newComplaint.complaint_id
                );
                if (exists) return prev;
                return [newComplaint, ...prev];
            });
        });

        // Listen for complaint status changes from other admins
        channel.listen(".ComplaintStatusChanged", (event) => {
            setComplaints((prev) =>
                prev.map((complaint) =>
                    complaint.complaint_id === event.complaint_id
                        ? { ...complaint, status: event.new_status }
                        : complaint
                )
            );
        });

        // Listen for complaint hide/unhide actions
        channel.listen(".ComplaintHidden", (event) => {
            setComplaints((prev) =>
                prev.map((complaint) =>
                    complaint.complaint_id === event.complaint_id
                        ? { ...complaint, is_hidden: event.is_hidden }
                        : complaint
                )
            );
        });

        return () => {
            channel.stopListening(".ComplaintSubmitted");
            channel.stopListening(".ComplaintStatusChanged");
            channel.stopListening(".ComplaintHidden");
            window.Echo.leave("admin-channel");
        };
    }, []);

    // Filter complaints by status and priority (client-side filtering)
    useEffect(() => {
        filterComplaints();
    }, [statusFilter, priorityFilter, complaints]);

    const filterComplaints = () => {
        let filtered = complaints;

        if (statusFilter !== "all") {
            filtered = filtered.filter((c) => c.status === statusFilter);
        }

        if (priorityFilter !== "all") {
            filtered = filtered.filter((c) => c.priority === priorityFilter);
        }

        setFilteredComplaints(filtered);
    };

    const handleStatusUpdate = async (complaintId, newStatus) => {
        try {
            const response = await axiosInstance.put(
                `/admin/complaints/${complaintId}/status`,
                {
                    status: newStatus,
                }
            );
            setMessage({
                type: "success",
                text: response.data.message || "Status berhasil diperbarui",
            });
            fetchComplaints(searchKeyword, false);
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        } catch (error) {
            const errorMsg =
                error.response?.data?.message || "Gagal memperbarui status";
            setMessage({ type: "error", text: errorMsg });
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        }
    };

    // Toggle hide/unhide complaint
    const handleToggleHide = async (complaintId, currentIsHidden) => {
        const newIsHidden =
            currentIsHidden === "visible" ? "hidden" : "visible";

        try {
            const response = await axiosInstance.put(
                `/admin/complaints/${complaintId}/hide`,
                {
                    is_hidden: newIsHidden,
                }
            );

            setComplaints((prev) =>
                prev.map((complaint) =>
                    complaint.complaint_id === complaintId
                        ? { ...complaint, is_hidden: newIsHidden }
                        : complaint
                )
            );

            setMessage({
                type: "success",
                text:
                    response.data.message ||
                    `Keluhan berhasil ${
                        newIsHidden === "hidden"
                            ? "disembunyikan"
                            : "ditampilkan"
                    }`,
            });
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        } catch (error) {
            const errorMsg =
                error.response?.data?.message ||
                "Gagal mengubah visibility keluhan";
            setMessage({ type: "error", text: errorMsg });
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        }
    };

    const handleSelectComplaint = (complaintId) => {
        setSelectedComplaints((prev) => {
            if (prev.includes(complaintId)) {
                return prev.filter((id) => id !== complaintId);
            } else {
                return [...prev, complaintId];
            }
        });
    };

    const handleSelectAll = () => {
        if (selectedComplaints.length === filteredComplaints.length) {
            setSelectedComplaints([]);
        } else {
            setSelectedComplaints(
                filteredComplaints.map((c) => c.complaint_id)
            );
        }
    };

    // Clear search input
    const handleClearSearch = () => {
        setSearchKeyword("");
    };

    const handleExportPDF = () => {
        const complaintsToExport =
            selectedComplaints.length > 0
                ? complaints.filter((c) =>
                      selectedComplaints.includes(c.complaint_id)
                  )
                : filteredComplaints;

        if (complaintsToExport.length === 0) {
            alert("Tidak ada keluhan untuk dicetak");
            return;
        }

        const printWindow = window.open("", "_blank");
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Laporan Keluhan UPT LAB</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 20px;
                        color: #333;
                    }
                    h1 {
                        text-align: center;
                        color: #166534;
                        margin-bottom: 10px;
                    }
                    .subtitle {
                        text-align: center;
                        color: #666;
                        margin-bottom: 30px;
                    }
                    .complaint {
                        border: 1px solid #ddd;
                        padding: 15px;
                        margin-bottom: 20px;
                        page-break-inside: avoid;
                    }
                    .complaint-header {
                        background-color: #f5f5f5;
                        padding: 10px;
                        margin: -15px -15px 15px -15px;
                        border-bottom: 2px solid #166534;
                    }
                    .field {
                        margin-bottom: 8px;
                    }
                    .label {
                        font-weight: bold;
                        display: inline-block;
                        width: 150px;
                    }
                    .value {
                        display: inline-block;
                    }
                    .status {
                        display: inline-block;
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-size: 12px;
                        font-weight: bold;
                    }
                    .status-waiting {
                        background-color: #fef3c7;
                        color: #92400e;
                    }
                    .status-on_progress {
                        background-color: #dbeafe;
                        color: #1e3a8a;
                    }
                    .status-done {
                        background-color: #dcfce7;
                        color: #166534;
                    }
                    .priority {
                        display: inline-block;
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-size: 12px;
                        font-weight: bold;
                    }
                    .priority-low {
                        background-color: #f3f4f6;
                        color: #374151;
                    }
                    .priority-middle {
                        background-color: #fed7aa;
                        color: #92400e;
                    }
                    .priority-high {
                        background-color: #fecaca;
                        color: #991b1b;
                    }
                    @media print {
                        body {
                            padding: 10px;
                        }
                    }
                </style>
            </head>
            <body>
                <h1>Laporan Keluhan UPT LAB</h1>
                <p class="subtitle">Sistem Layanan Pengaduan Kebutuhan Akademisi</p>
                <p class="subtitle">Tanggal Cetak: ${new Date().toLocaleDateString(
                    "id-ID",
                    {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                    }
                )}</p>
                ${complaintsToExport
                    .map(
                        (c) => `
                    <div class="complaint">
                        <div class="complaint-header">
                            <strong>Ticket ID: ${c.ticket_id}</strong>
                            <span style="float: right;">
                                <span class="status status-${
                                    c.status
                                }">${getStatusText(c.status)}</span>
                                <span class="priority priority-${
                                    c.priority
                                }">${getPriorityText(c.priority)}</span>
                            </span>
                        </div>
                        <div class="field">
                            <span class="label">Nama Lengkap:</span>
                            <span class="value">${c.nama_lengkap}</span>
                        </div>
                        <div class="field">
                            <span class="label">NIM/NIP:</span>
                            <span class="value">${c.nim_nip}</span>
                        </div>
                        <div class="field">
                            <span class="label">Email:</span>
                            <span class="value">${c.email}</span>
                        </div>
                        <div class="field">
                            <span class="label">No Telepon:</span>
                            <span class="value">${c.no_telepon}</span>
                        </div>
                        <div class="field">
                            <span class="label">Status User:</span>
                            <span class="value">${c.status_user}</span>
                        </div>
                        ${
                            c.kelas
                                ? `<div class="field">
                            <span class="label">Kelas:</span>
                            <span class="value">${c.kelas}</span>
                        </div>`
                                : ""
                        }
                        ${
                            c.lab
                                ? `<div class="field">
                            <span class="label">Lab:</span>
                            <span class="value">${c.lab}</span>
                        </div>`
                                : ""
                        }
                        ${
                            c.ruangan
                                ? `<div class="field">
                            <span class="label">Ruangan:</span>
                            <span class="value">${c.ruangan}</span>
                        </div>`
                                : ""
                        }
                        <div class="field">
                            <span class="label">Keluhan:</span>
                            <div style="margin-left: 150px; margin-top: 5px; white-space: pre-wrap;">${
                                c.keluhan
                            }</div>
                        </div>
                        <div class="field">
                            <span class="label">Tanggal Pengajuan:</span>
                            <span class="value">${new Date(
                                c.created_at
                            ).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            })}</span>
                        </div>
                    </div>
                `
                    )
                    .join("")}
            </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 250);
    };

    const getStatusBadge = (status) => {
        const badges = {
            waiting: "bg-yellow-100 text-yellow-800 border-yellow-200",
            on_progress: "bg-blue-100 text-blue-800 border-blue-200",
            done: "bg-primary-100 text-primary-800 border-primary-200",
        };
        return badges[status] || "bg-gray-100 text-gray-800 border-gray-200";
    };

    const getPriorityBadge = (priority) => {
        const badges = {
            low: "bg-gray-100 text-gray-800 border-gray-200",
            middle: "bg-orange-100 text-orange-800 border-orange-200",
            high: "bg-red-100 text-red-800 border-red-200",
        };
        return badges[priority] || "bg-gray-100 text-gray-800 border-gray-200";
    };

    const getStatusText = (status) => {
        const statusText = {
            waiting: "Menunggu",
            on_progress: "Sedang Diproses",
            done: "Selesai",
        };
        return statusText[status] || status;
    };

    const getPriorityText = (priority) => {
        const priorityText = {
            low: "Rendah",
            middle: "Sedang",
            high: "Tinggi",
        };
        return priorityText[priority] || priority;
    };

    const getStatusCount = (status) => {
        if (status === "all") return complaints.length;
        return complaints.filter((c) => c.status === status).length;
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
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Kelola Keluhan
                    </h1>
                    <p className="text-gray-600">
                        Manage dan update status semua keluhan
                    </p>
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
                            placeholder="Cari berdasarkan ticket ID, nama, NIM/NIP, email, keluhan, lab, ruangan, kelas..."
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
                                Semua ({getStatusCount("all")})
                            </button>
                            <button
                                onClick={() => setStatusFilter("waiting")}
                                className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                                    statusFilter === "waiting"
                                        ? "bg-yellow-500 text-white shadow-lg"
                                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                Menunggu ({getStatusCount("waiting")})
                            </button>
                            <button
                                onClick={() => setStatusFilter("on_progress")}
                                className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                                    statusFilter === "on_progress"
                                        ? "bg-blue-500 text-white shadow-lg"
                                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                Diproses ({getStatusCount("on_progress")})
                            </button>
                            <button
                                onClick={() => setStatusFilter("done")}
                                className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                                    statusFilter === "done"
                                        ? "bg-primary-600 text-white shadow-lg"
                                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                Selesai ({getStatusCount("done")})
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <select
                                value={priorityFilter}
                                onChange={(e) =>
                                    setPriorityFilter(e.target.value)
                                }
                                className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                <option value="all">Semua Priority</option>
                                <option value="low">Low</option>
                                <option value="middle">Middle</option>
                                <option value="high">High</option>
                            </select>

                            {selectedComplaints.length > 0 && (
                                <button
                                    onClick={handleExportPDF}
                                    className="px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800 transition duration-200 flex items-center gap-2"
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
                                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                        />
                                    </svg>
                                    Cetak PDF ({selectedComplaints.length})
                                </button>
                            )}

                            <button
                                onClick={handleExportPDF}
                                className="px-4 py-2 border-2 border-primary-700 text-primary-700 rounded-lg hover:bg-primary-50 transition duration-200 flex items-center gap-2"
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
                                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                    />
                                </svg>
                                Cetak Semua
                            </button>
                        </div>
                    </div>
                </div>

                {/* Select All */}
                {filteredComplaints.length > 0 && !searchLoading && (
                    <div className="bg-white rounded-xl shadow-md p-4 mb-4">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={
                                    selectedComplaints.length ===
                                    filteredComplaints.length
                                }
                                onChange={handleSelectAll}
                                className="w-5 h-5 text-primary-700 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <span className="ml-3 text-gray-700 font-medium">
                                Pilih Semua ({filteredComplaints.length}{" "}
                                keluhan)
                            </span>
                        </label>
                    </div>
                )}

                {/* Complaints List Area */}
                {searchLoading ? (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700 mx-auto mb-4"></div>
                        <p className="text-gray-600">Mencari keluhan...</p>
                    </div>
                ) : filteredComplaints.length === 0 ? (
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
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            Tidak ada keluhan
                        </h3>
                        <p className="text-gray-600">
                            {searchKeyword
                                ? `Tidak ditemukan keluhan dengan kata kunci "${searchKeyword}"`
                                : "Belum ada keluhan dengan filter yang dipilih"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredComplaints.map((complaint) => (
                            <div
                                key={complaint.complaint_id}
                                className={`bg-white rounded-xl shadow-md p-6 border-2 border-transparent hover:border-primary-500 transition duration-200 ${
                                    complaint.is_hidden === "hidden"
                                        ? "opacity-60"
                                        : ""
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedComplaints.includes(
                                            complaint.complaint_id
                                        )}
                                        onChange={() =>
                                            handleSelectComplaint(
                                                complaint.complaint_id
                                            )
                                        }
                                        className="mt-1 w-5 h-5 text-primary-700 border-gray-300 rounded focus:ring-primary-500"
                                    />

                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-3">
                                            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-mono font-semibold rounded-full">
                                                {complaint.ticket_id}
                                            </span>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(
                                                    complaint.status
                                                )}`}
                                            >
                                                {getStatusText(
                                                    complaint.status
                                                )}
                                            </span>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityBadge(
                                                    complaint.priority
                                                )}`}
                                            >
                                                Priority:{" "}
                                                {getPriorityText(
                                                    complaint.priority
                                                )}
                                            </span>
                                            {complaint.is_hidden ===
                                                "hidden" && (
                                                <span className="px-3 py-1 rounded-full text-xs font-medium border bg-gray-100 text-gray-600 border-gray-300">
                                                    Keluhan ini Disembunyikan
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                            {complaint.keluhan}
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600 mb-3">
                                            <div>
                                                <span className="font-medium">
                                                    Nama:
                                                </span>{" "}
                                                {complaint.nama_lengkap}
                                            </div>
                                            <div>
                                                <span className="font-medium">
                                                    NIM/NIP:
                                                </span>{" "}
                                                {complaint.nim_nip}
                                            </div>
                                            <div>
                                                <span className="font-medium">
                                                    Email:
                                                </span>{" "}
                                                {complaint.email}
                                            </div>
                                            <div>
                                                <span className="font-medium">
                                                    Status:
                                                </span>{" "}
                                                <span className="capitalize">
                                                    {complaint.status_user}
                                                </span>
                                            </div>
                                            {complaint.kelas && (
                                                <div>
                                                    <span className="font-medium">
                                                        Kelas:
                                                    </span>{" "}
                                                    {complaint.kelas}
                                                </div>
                                            )}
                                            {complaint.lab && (
                                                <div>
                                                    <span className="font-medium">
                                                        Lab:
                                                    </span>{" "}
                                                    {complaint.lab}
                                                </div>
                                            )}
                                            {complaint.ruangan && (
                                                <div>
                                                    <span className="font-medium">
                                                        Ruangan:
                                                    </span>{" "}
                                                    {complaint.ruangan}
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-xs text-gray-500">
                                            Diajukan:{" "}
                                            {new Date(
                                                complaint.created_at
                                            ).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() =>
                                                handleToggleHide(
                                                    complaint.complaint_id,
                                                    complaint.is_hidden ||
                                                        "visible"
                                                )
                                            }
                                            className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition duration-200 text-sm font-medium flex items-center gap-2"
                                            title={
                                                complaint.is_hidden === "hidden"
                                                    ? "Tampilkan keluhan"
                                                    : "Sembunyikan keluhan"
                                            }
                                        >
                                            {complaint.is_hidden ===
                                            "hidden" ? (
                                                <>
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
                                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                        />
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                        />
                                                    </svg>
                                                    Tampilkan
                                                </>
                                            ) : (
                                                <>
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
                                                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                                        />
                                                    </svg>
                                                    Sembunyikan
                                                </>
                                            )}
                                        </button>

                                        {complaint.status === "waiting" && (
                                            <button
                                                onClick={() =>
                                                    handleStatusUpdate(
                                                        complaint.complaint_id,
                                                        "on_progress"
                                                    )
                                                }
                                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 text-sm font-medium whitespace-nowrap"
                                            >
                                                Mulai Proses
                                            </button>
                                        )}

                                        {complaint.status === "on_progress" && (
                                            <button
                                                onClick={() =>
                                                    handleStatusUpdate(
                                                        complaint.complaint_id,
                                                        "done"
                                                    )
                                                }
                                                className="px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800 transition duration-200 text-sm font-medium whitespace-nowrap"
                                            >
                                                Selesai
                                            </button>
                                        )}

                                        {complaint.status === "done" && (
                                            <span className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg text-sm font-medium text-center">
                                                Selesai
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default KelolaKeluhan;
