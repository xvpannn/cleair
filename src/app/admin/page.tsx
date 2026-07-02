"use client";

import React, { useState, useEffect } from "react";
import { 
  Trash2, 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  Lock, 
  LogOut, 
  RefreshCw, 
  Calendar, 
  MessageSquare,
  Sparkles,
  Check
} from "lucide-react";

interface BookingItem {
  id: string;
  name: string;
  whatsapp: string;
  resourceName: string;
  resourceType: string;
  startTime: string;
  endTime: string;
  status: string;
  createdAt: string;
}

interface ToastState {
  show: boolean;
  message: string;
  type: "success" | "error" | "warning";
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: "",
    type: "success"
  });

  // Check auth state from sessionStorage on mount
  useEffect(() => {
    const isAuth = sessionStorage.getItem("clear_admin_authenticated");
    if (isAuth === "true") {
      setIsAuthenticated(true);
      fetchBookings();
    }
  }, []);

  const triggerToast = (message: string, type: "success" | "error" | "warning") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin" && password === "admin123") {
      sessionStorage.setItem("clear_admin_authenticated", "true");
      setIsAuthenticated(true);
      setLoginError("");
      fetchBookings();
      triggerToast("Login berhasil!", "success");
    } else {
      setLoginError("Kombinasi username atau password salah.");
      triggerToast("Login gagal", "error");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("clear_admin_authenticated");
    setIsAuthenticated(false);
    setBookings([]);
    triggerToast("Logout berhasil.", "success");
  };

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();
      if (res.ok && data.success) {
        // Sort bookings by createdAt desc
        const sorted = (data.bookings || []).sort(
          (a: BookingItem, b: BookingItem) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setBookings(sorted);
      } else {
        triggerToast("Gagal mengambil data jadwal.", "error");
      }
    } catch (err) {
      triggerToast("Terjadi kendala koneksi ke API.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const updateBookingStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast(`Status diperbarui menjadi ${newStatus}.`, "success");
        // Update local state
        setBookings(prev => 
          prev.map(b => b.id === id ? { ...b, status: newStatus } : b)
        );
      } else {
        triggerToast(data.error || "Gagal memperbarui status.", "error");
      }
    } catch (err) {
      triggerToast("Gagal memperbarui status karena kendala koneksi.", "error");
    }
  };

  const deleteBooking = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus jadwal pemesanan ini secara permanen?")) {
      return;
    }
    try {
      const res = await fetch(`/api/bookings?id=${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast("Jadwal pemesanan berhasil dihapus.", "success");
        setBookings(prev => prev.filter(b => b.id !== id));
      } else {
        triggerToast(data.error || "Gagal menghapus jadwal.", "error");
      }
    } catch (err) {
      triggerToast("Gagal menghapus jadwal karena kendala koneksi.", "error");
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (filterStatus === "ALL") return true;
    return b.status === filterStatus;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-emerald-50 text-emerald-800 border border-emerald-200/50";
      case "PENDING":
        return "bg-amber-50 text-amber-800 border border-amber-200/50";
      case "CANCELLED":
        return "bg-rose-50 text-rose-800 border border-rose-200/50";
      case "COMPLETED":
        return "bg-blue-50 text-blue-800 border border-blue-200/50";
      default:
        return "bg-gray-50 text-gray-800 border border-gray-200/50";
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("id-ID", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    } catch (e) {
      return dateStr;
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit"
      }) + " WIB";
    } catch (e) {
      return dateStr;
    }
  };

  // Render Login Form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F9F6F0] flex items-center justify-center px-4 relative overflow-hidden font-sans selection:bg-[#1C2D24] selection:text-white">
        {/* Abstract resort ambient glow */}
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-[#2D5A27] rounded-full blur-[100px] opacity-5 pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-[#8C6239] rounded-full blur-[100px] opacity-5 pointer-events-none"></div>
        
        {/* Subtle grid backdrop */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(28,45,36,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(28,45,36,0.015)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none"></div>

        <div className="max-w-[420px] w-full bg-white/90 backdrop-blur-md rounded-2xl p-8 border border-[#1C2D24]/5 shadow-sm relative z-10">
          <div className="text-center mb-8">
            <span className="font-serif italic text-3xl text-[#1C2D24] block mb-1">Clear<span className="text-[#2D5A27]">.</span></span>
            <p className="text-[10px] font-bold tracking-[0.2em] text-[#5B7A68] uppercase font-mono">ADMINISTRATOR PORTAL</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold tracking-wider uppercase text-[#5B7A68] mb-2 font-mono">
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-[#F9F6F0]/50 border border-[#1C2D24]/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#2D5A27] focus:bg-white transition-all text-[#1C2D24]"
                placeholder="admin"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-wider uppercase text-[#5B7A68] mb-2 font-mono">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#F9F6F0]/50 border border-[#1C2D24]/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#2D5A27] focus:bg-white transition-all text-[#1C2D24]"
                placeholder="••••••••"
              />
            </div>

            {loginError && (
              <p className="text-xs text-rose-700 bg-rose-50 px-3 py-2 rounded border border-rose-200/50">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-[#1C2D24] text-[#F9F6F0] rounded-lg font-bold text-[10px] uppercase tracking-wider hover:bg-[#2D5A27] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              Masuk Dasbor
            </button>
          </form>
        </div>

        {/* Custom Toast Bubble */}
        {toast.show && (
          <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl bg-white shadow-lg border text-xs font-medium max-w-sm transition-all duration-300 transform translate-y-0 ${
            toast.type === "success" ? "border-emerald-500/30 text-[#1C2D24]" : "border-rose-500/30 text-rose-900"
          }`}>
            <span className={`w-2 h-2 rounded-full ${toast.type === "success" ? "bg-emerald-500" : "bg-rose-500"}`}></span>
            <span>{toast.message}</span>
          </div>
        )}
      </div>
    );
  }

  // Render Admin Dashboard
  return (
    <div className="min-h-screen bg-[#F9F6F0] text-[#1C2D24] font-sans antialiased relative pb-16 selection:bg-[#1C2D24] selection:text-white">
      {/* Subtle grid backdrop */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,rgba(28,45,36,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(28,45,36,0.015)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none z-0"></div>

      {/* Top Bar Navigation */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-[#1C2D24]/5 py-4 z-40 relative">
        <div className="max-w-[1200px] mx-auto px-6 flex justify-between items-center">
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-xl font-semibold tracking-tight text-[#1C2D24]">
              Clear<span className="text-[#2D5A27]">.</span>
            </span>
            <span className="font-mono text-[8px] font-bold tracking-widest text-[#8C6239] uppercase bg-[#8C6239]/10 px-2 py-0.5 rounded">
              ADMIN PANEL
            </span>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#1C2D24]/10 rounded-full text-[9px] font-bold tracking-wider uppercase text-[#5B7A68] hover:text-[#1C2D24] hover:border-[#1C2D24] transition-colors"
          >
            <LogOut className="w-3 h-3" />
            Keluar
          </button>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 py-12 relative z-10">
        {/* Welcome & Stats Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-12">
          <div className="lg:col-span-8">
            <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#1C2D24]">
              Daftar Permintaan Jadwal <br />
              <span className="font-serif italic text-[#5B7A68]">Diskusi Proyek Klien</span>
            </h1>
          </div>
          
          {/* Controls */}
          <div className="lg:col-span-4 flex items-center justify-end gap-3">
            <button 
              onClick={fetchBookings}
              disabled={isLoading}
              className="flex items-center justify-center p-3 rounded-lg bg-white border border-[#1C2D24]/10 hover:border-[#1C2D24] text-[#5B7A68] hover:text-[#1C2D24] transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>

            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-4 py-3 rounded-lg bg-white border border-[#1C2D24]/10 text-xs font-semibold focus:outline-none focus:border-[#2D5A27] text-[#1C2D24]"
            >
              <option value="ALL">Semua Status</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Booking Count Summary Widgets */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border border-[#1C2D24]/5">
            <span className="text-[9px] font-mono font-bold tracking-widest text-[#5B7A68] uppercase block mb-1">TOTAL PERMINTAAN</span>
            <span className="text-2xl font-semibold text-[#1C2D24]">{bookings.length}</span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-[#1C2D24]/5">
            <span className="text-[9px] font-mono font-bold tracking-widest text-[#2D5A27] uppercase block mb-1">TERKONFIRMASI</span>
            <span className="text-2xl font-semibold text-[#2D5A27]">
              {bookings.filter(b => b.status === "CONFIRMED").length}
            </span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-[#1C2D24]/5">
            <span className="text-[9px] font-mono font-bold tracking-widest text-blue-700 uppercase block mb-1">SELESAI DISKUSI</span>
            <span className="text-2xl font-semibold text-blue-700">
              {bookings.filter(b => b.status === "COMPLETED").length}
            </span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-[#1C2D24]/5">
            <span className="text-[9px] font-mono font-bold tracking-widest text-rose-700 uppercase block mb-1">BATAL</span>
            <span className="text-2xl font-semibold text-rose-700">
              {bookings.filter(b => b.status === "CANCELLED").length}
            </span>
          </div>
        </div>

        {/* Bookings Table / List Container */}
        <div className="bg-white rounded-2xl border border-[#1C2D24]/5 overflow-hidden">
          {isLoading && bookings.length === 0 ? (
            <div className="py-24 text-center">
              <RefreshCw className="w-8 h-8 text-[#5B7A68] animate-spin mx-auto mb-3" />
              <p className="font-serif italic text-lg text-[#5B7A68]/80">Mengambil data pemesanan...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="py-24 text-center">
              <Calendar className="w-8 h-8 text-[#5B7A68]/40 mx-auto mb-3" />
              <p className="font-serif italic text-lg text-[#5B7A68]/80">Tidak ada data diskusi ditemukan.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#1C2D24]/5 bg-[#F9F6F0]/20">
                    <th className="px-6 py-4 text-[9px] font-mono font-bold tracking-widest text-[#5B7A68] uppercase">KLIEN</th>
                    <th className="px-6 py-4 text-[9px] font-mono font-bold tracking-widest text-[#5B7A68] uppercase">LAYANAN</th>
                    <th className="px-6 py-4 text-[9px] font-mono font-bold tracking-widest text-[#5B7A68] uppercase">TANGGAL & WAKTU</th>
                    <th className="px-6 py-4 text-[9px] font-mono font-bold tracking-widest text-[#5B7A68] uppercase">STATUS</th>
                    <th className="px-6 py-4 text-[9px] font-mono font-bold tracking-widest text-[#5B7A68] uppercase text-right">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C2D24]/5">
                  {filteredBookings.map((booking) => {
                    const waLink = `https://wa.me/${booking.whatsapp.replace(/\D/g, "")}`;
                    
                    return (
                      <tr key={booking.id} className="hover:bg-[#F9F6F0]/10 transition-colors">
                        {/* Client details */}
                        <td className="px-6 py-5">
                          <div className="font-semibold text-sm text-[#1C2D24]">{booking.name}</div>
                          <a 
                            href={waLink} 
                            target="_blank" 
                            className="text-xs font-mono text-[#5B7A68] hover:text-[#2D5A27] inline-flex items-center gap-1.5 mt-1"
                          >
                            <span>{booking.whatsapp}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </td>
                        
                        {/* Service Chosen */}
                        <td className="px-6 py-5">
                          <div className="text-sm font-medium">{booking.resourceName}</div>
                          <div className="text-[10px] font-mono text-[#8C6239] uppercase mt-0.5">{booking.resourceType}</div>
                        </td>

                        {/* Date and Time */}
                        <td className="px-6 py-5">
                          <div className="text-sm text-[#1C2D24] font-medium">{formatDate(booking.startTime)}</div>
                          <div className="text-xs font-mono text-[#5B7A68] mt-0.5">{formatTime(booking.startTime)}</div>
                        </td>

                        {/* Status Badge */}
                        <td className="px-6 py-5">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono ${getStatusBadgeClass(booking.status)}`}>
                            {booking.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {booking.status !== "CONFIRMED" && (
                              <button
                                onClick={() => updateBookingStatus(booking.id, "CONFIRMED")}
                                title="Konfirmasi"
                                className="p-1.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/40 transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {booking.status !== "COMPLETED" && (
                              <button
                                onClick={() => updateBookingStatus(booking.id, "COMPLETED")}
                                title="Tandai Selesai"
                                className="p-1.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/40 transition-colors"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {booking.status !== "CANCELLED" && (
                              <button
                                onClick={() => updateBookingStatus(booking.id, "CANCELLED")}
                                title="Batalkan"
                                className="p-1.5 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/40 transition-colors"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteBooking(booking.id)}
                              title="Hapus"
                              className="p-1.5 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/40 transition-colors ml-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Custom Toast Bubble */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl bg-white shadow-lg border text-xs font-medium max-w-sm transition-all duration-300 transform translate-y-0 ${
          toast.type === "success" 
            ? "border-emerald-500/30 text-[#1C2D24]" 
            : toast.type === "warning"
            ? "border-amber-500/30 text-amber-900"
            : "border-rose-500/30 text-rose-900"
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            toast.type === "success" 
              ? "bg-emerald-500" 
              : toast.type === "warning" 
              ? "bg-amber-500" 
              : "bg-rose-500"
          }`}></span>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
