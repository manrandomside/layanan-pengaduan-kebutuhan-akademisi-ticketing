import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/admin/Navbar";
import axiosInstance from "../../config/axios";

const KelolaKeluhan = () => {
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [filteredComplaints, setFilteredComplaints] = useState([]);
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [selectedComplaints, setSelectedComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        fetchComplaints();
    }, []);

    useEffect(() => {
        filterComplaints();
    }, [statusFilter, priorityFilter, complaints]);

    const fetchComplaints = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get("/admin/complaints");
            setComplaints(response.data.data || []);
        } catch (error) {
            console.error("Error fetching complaints:", error);
        }
        setLoading(false);
    };

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
            fetchComplaints();
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        } catch (error) {
            const errorMsg =
                error.response?.data?.message || "Gagal memperbarui status";
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
                {filteredComplaints.length > 0 && (
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

                {/* Complaints List */}
                {filteredComplaints.length === 0 ? (
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
                            Belum ada keluhan dengan filter yang dipilih
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredComplaints.map((complaint) => (
                            <div
                                key={complaint.complaint_id}
                                className="bg-white rounded-xl shadow-md p-6 border-2 border-transparent hover:border-primary-500 transition duration-200"
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
        </div>
    );
};

export default KelolaKeluhan;
