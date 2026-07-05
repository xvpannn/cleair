"use client";

import React, { useState, useEffect } from "react";
import { 
  Trash2, 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  Lock, 
  Unlock,
  LogOut, 
  RefreshCw, 
  Calendar, 
  MessageSquare,
  Sparkles,
  Check,
  Edit,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock
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

const TIME_SLOTS = [
  { value: "09:00", label: "09:00 WIB" },
  { value: "10:00", label: "10:00 WIB" },
  { value: "11:00", label: "11:00 WIB" },
  { value: "12:00", label: "12:00 WIB" },
  { value: "13:00", label: "13:00 WIB" },
  { value: "14:00", label: "14:00 WIB" },
  { value: "15:00", label: "15:00 WIB" },
  { value: "16:00", label: "16:00 WIB" },
  { value: "17:00", label: "17:00 WIB" }
];

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

  // Create Booking/Block State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createIsBlock, setCreateIsBlock] = useState(true);
  const [createName, setCreateName] = useState("BLOKIR JADWAL");
  const [createWhatsapp, setCreateWhatsapp] = useState("00000000000");
  const [createResourceName, setCreateResourceName] = useState("Semua Layanan");
  const [createDate, setCreateDate] = useState("");
  const [createTime, setCreateTime] = useState("09:00");

  // Edit/Reschedule State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<BookingItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editWhatsapp, setEditWhatsapp] = useState("");
  const [editResourceName, setEditResourceName] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editStatus, setEditStatus] = useState("CONFIRMED");

  // Interactive Calendar States
  const [activeTab, setActiveTab] = useState<"calendar" | "list">("calendar");
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedCalendarDateStr, setSelectedCalendarDateStr] = useState<string>(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
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

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createDate || !createTime) {
      triggerToast("Tanggal dan waktu wajib dipilih.", "warning");
      return;
    }

    try {
      const startTimeStr = `${createDate}T${createTime}:00`;
      const start = new Date(startTimeStr);
      const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour slot

      const payload = {
        name: createIsBlock ? "BLOKIR JADWAL" : createName,
        whatsapp: createIsBlock ? "00000000000" : createWhatsapp,
        resourceName: createResourceName,
        resourceType: "SLOT",
        startTime: start.toISOString(),
        endTime: end.toISOString()
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast(createIsBlock ? "Slot waktu berhasil diblokir." : "Booking berhasil ditambahkan.", "success");
        setIsCreateModalOpen(false);
        // Reset form
        setCreateIsBlock(true);
        setCreateName("BLOKIR JADWAL");
        setCreateWhatsapp("00000000000");
        setCreateResourceName("Semua Layanan");
        setCreateDate("");
        setCreateTime("09:00");
        fetchBookings();
      } else {
        triggerToast(data.error || "Gagal membuat booking/blokir.", "error");
      }
    } catch (err) {
      triggerToast("Terjadi kendala koneksi.", "error");
    }
  };

  const openEditModal = (booking: BookingItem) => {
    setEditingBooking(booking);
    setEditName(booking.name);
    setEditWhatsapp(booking.whatsapp);
    setEditResourceName(booking.resourceName);
    
    // Parse ISO string to YYYY-MM-DD and HH:MM local format
    const dateObj = new Date(booking.startTime);
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
    const dd = String(dateObj.getDate()).padStart(2, "0");
    setEditDate(`${yyyy}-${mm}-${dd}`);
    
    const hh = String(dateObj.getHours()).padStart(2, "0");
    const min = String(dateObj.getMinutes()).padStart(2, "0");
    setEditTime(`${hh}:${min}`);
    setEditStatus(booking.status);
    setIsEditModalOpen(true);
  };

  const handleEditBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;
    if (!editDate || !editTime) {
      triggerToast("Tanggal dan waktu wajib dipilih.", "warning");
      return;
    }

    try {
      const startTimeStr = `${editDate}T${editTime}:00`;
      const start = new Date(startTimeStr);
      const end = new Date(start.getTime() + 60 * 60 * 1000);

      const payload = {
        id: editingBooking.id,
        name: editName,
        whatsapp: editWhatsapp,
        resourceName: editResourceName,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        status: editStatus
      };

      const res = await fetch("/api/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast("Data pemesanan berhasil diperbarui.", "success");
        setIsEditModalOpen(false);
        setEditingBooking(null);
        fetchBookings();
      } else {
        triggerToast(data.error || "Gagal memperbarui data.", "error");
      }
    } catch (err) {
      triggerToast("Terjadi kendala koneksi.", "error");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("clear_admin_authenticated");
    setIsAuthenticated(false);
    setBookings([]);
    triggerToast("Logout berhasil.", "success");
  };

  // Generate days in month for React calendar grid
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    const startDayIndex = firstDay.getDay(); // 0 is Sunday, 1 is Monday, etc.
    
    // Total days in month
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    
    // Padding days from previous month
    const prevMonthTotalDays = new Date(year, month, 0).getDate();
    for (let i = startDayIndex - 1; i >= 0; i--) {
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      days.push({
        dateStr: `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}-${String(prevMonthTotalDays - i).padStart(2, "0")}`,
        dayNum: prevMonthTotalDays - i,
        isCurrentMonth: false
      });
    }
    
    // Days of current month
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        dateStr: `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`,
        dayNum: i,
        isCurrentMonth: true
      });
    }
    
    // Padding days for next month to complete the grid (usually 42 cells total)
    const totalCells = 42;
    const nextMonthPadding = totalCells - days.length;
    for (let i = 1; i <= nextMonthPadding; i++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      days.push({
        dateStr: `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`,
        dayNum: i,
        isCurrentMonth: false
      });
    }
    
    return days;
  };

  const getLocalDateStr = (dateObjOrStr: Date | string) => {
    const d = new Date(dateObjOrStr);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const getDayStatus = (dateStr: string) => {
    const dayBookings = bookings.filter(b => getLocalDateStr(b.startTime) === dateStr);
    const isBlocked = dayBookings.some(b => b.name === "BLOKIR HARI" && b.status === "CONFIRMED");
    const clientBookings = dayBookings.filter(b => b.name !== "BLOKIR HARI");
    const d = new Date(dateStr);
    const isSunday = d.getDay() === 0;
    
    return {
      isBlocked,
      isSunday,
      clientBookings,
      totalBookings: clientBookings.length
    };
  };

  const handleToggleBlockDay = async (dateStr: string) => {
    const status = getDayStatus(dateStr);
    if (status.isBlocked) {
      // Unblock: Find block booking and delete
      const blockBooking = bookings.find(b => getLocalDateStr(b.startTime) === dateStr && b.name === "BLOKIR HARI");
      if (blockBooking) {
        try {
          const res = await fetch(`/api/bookings?id=${blockBooking.id}`, {
            method: "DELETE"
          });
          const data = await res.json();
          if (res.ok && data.success) {
            triggerToast("Blokir hari berhasil dibuka.", "success");
            fetchBookings();
          } else {
            triggerToast(data.error || "Gagal membuka blokir.", "error");
          }
        } catch (err) {
          triggerToast("Gagal karena kendala koneksi.", "error");
        }
      }
    } else {
      // Block: Create full-day block
      try {
        const start = new Date(`${dateStr}T00:00:00`);
        const end = new Date(`${dateStr}T23:59:59`);
        
        const payload = {
          name: "BLOKIR HARI",
          whatsapp: "00000000000",
          resourceName: "Semua Layanan",
          resourceType: "BLOCK",
          startTime: start.toISOString(),
          endTime: end.toISOString()
        };

        const res = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok && data.success) {
          triggerToast("Hari berhasil diblokir penuh.", "success");
          fetchBookings();
        } else {
          triggerToast(data.error || "Gagal memblokir hari.", "error");
        }
      } catch (err) {
        triggerToast("Gagal karena kendala koneksi.", "error");
      }
    }
  };

  const handleBlockSlot = async (dateStr: string, timeVal: string) => {
    try {
      const start = new Date(`${dateStr}T${timeVal}:00`);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      
      const payload = {
        name: "BLOKIR JADWAL",
        whatsapp: "00000000000",
        resourceName: "Semua Layanan",
        resourceType: "BLOCK",
        startTime: start.toISOString(),
        endTime: end.toISOString()
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast("Slot waktu berhasil diblokir.", "success");
        fetchBookings();
      } else {
        triggerToast(data.error || "Gagal memblokir slot.", "error");
      }
    } catch (err) {
      triggerToast("Gagal karena kendala koneksi.", "error");
    }
  };

  const openManualBooking = (dateStr: string, timeVal: string) => {
    setCreateDate(dateStr);
    setCreateTime(timeVal);
    setCreateIsBlock(false);
    setCreateName("");
    setCreateWhatsapp("");
    setCreateResourceName("Website Kustom");
    setIsCreateModalOpen(true);
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
            <span className="font-serif italic text-3xl text-[#1C2D24] block mb-1">Cleaire<span className="text-[#2D5A27]">.</span></span>
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
  const daysInMonth = getDaysInMonth(currentMonth);
  const weekdays = ["Ming", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const currentMonthLabel = `${currentMonth.toLocaleDateString("id-ID", { month: "long" })} ${currentMonth.getFullYear()}`;

  return (
    <div className="min-h-screen bg-[#F9F6F0] text-[#1C2D24] font-sans antialiased relative pb-16 selection:bg-[#1C2D24] selection:text-white">
      {/* Subtle grid backdrop */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,rgba(28,45,36,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(28,45,36,0.015)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none z-0"></div>

      {/* Top Bar Navigation */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-[#1C2D24]/5 py-4 z-40 relative">
        <div className="max-w-[1200px] mx-auto px-6 flex justify-between items-center">
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-xl font-semibold tracking-tight text-[#1C2D24]">
              Cleaire<span className="text-[#2D5A27]">.</span>
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
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#1C2D24]">
              Dasbor Manajemen Jadwal <br />
              <span className="font-serif italic text-[#5B7A68]">Diskusi & Ketersediaan</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                setCreateDate(selectedCalendarDateStr);
                setCreateIsBlock(true);
                setCreateName("BLOKIR JADWAL");
                setCreateWhatsapp("00000000000");
                setIsCreateModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-3 rounded-lg bg-[#1C2D24] text-[#F9F6F0] hover:bg-[#2D5A27] transition-all text-xs font-bold uppercase tracking-wider shadow-sm cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              Blokir Slot Waktu
            </button>

            <button 
              onClick={fetchBookings}
              disabled={isLoading}
              className="flex items-center justify-center p-3 rounded-lg bg-white border border-[#1C2D24]/10 hover:border-[#1C2D24] text-[#5B7A68] hover:text-[#1C2D24] transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex border-b border-[#1C2D24]/10 mb-8 gap-4">
          <button
            onClick={() => setActiveTab("calendar")}
            className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 font-mono transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "calendar"
                ? "border-[#2D5A27] text-[#2D5A27]"
                : "border-transparent text-[#5B7A68] hover:text-[#1C2D24]"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Kalender Interaktif
          </button>
          <button
            onClick={() => setActiveTab("list")}
            className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 font-mono transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "list"
                ? "border-[#2D5A27] text-[#2D5A27]"
                : "border-transparent text-[#5B7A68] hover:text-[#1C2D24]"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Semua Permintaan ({bookings.length})
          </button>
        </div>

        {/* TAB 1: CALENDAR VIEW */}
        {activeTab === "calendar" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Monthly Calendar Grid */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#1C2D24]/5 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif text-lg font-semibold text-[#1C2D24] capitalize">
                  {currentMonthLabel}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                    className="p-1.5 rounded-lg border border-[#1C2D24]/10 hover:bg-[#1C2D24]/5 text-[#5B7A68] hover:text-[#1C2D24]"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                    className="p-1.5 rounded-lg border border-[#1C2D24]/10 hover:bg-[#1C2D24]/5 text-[#5B7A68] hover:text-[#1C2D24]"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Day column headers */}
              <div className="grid grid-cols-7 gap-2 text-center mb-3">
                {weekdays.map(wd => (
                  <span key={wd} className="text-[10px] font-bold text-[#5B7A68] uppercase font-mono tracking-wider">
                    {wd}
                  </span>
                ))}
              </div>

              {/* Grid cell wrapper */}
              <div className="grid grid-cols-7 gap-2">
                {daysInMonth.map((day, idx) => {
                  const status = getDayStatus(day.dateStr);
                  const isSelected = selectedCalendarDateStr === day.dateStr;
                  const isToday = getLocalDateStr(new Date()) === day.dateStr;

                  return (
                    <button
                      key={`${day.dateStr}-${idx}`}
                      onClick={() => setSelectedCalendarDateStr(day.dateStr)}
                      className={`min-h-[76px] p-2 rounded-xl border text-left flex flex-col justify-between transition-all relative ${
                        !day.isCurrentMonth
                          ? "opacity-30 border-[#1C2D24]/5 bg-transparent cursor-pointer"
                          : isSelected
                          ? "border-[#2D5A27] bg-[#2D5A27]/5 shadow-sm ring-1 ring-[#2D5A27] cursor-pointer"
                          : status.isBlocked
                          ? "border-[#8C6239]/20 bg-[#8C6239]/5 cursor-pointer"
                          : status.isSunday
                          ? "border-transparent bg-gray-50/50 text-gray-400 cursor-pointer"
                          : "border-[#1C2D24]/5 bg-white hover:bg-[#F9F6F0]/50 cursor-pointer"
                      }`}
                    >
                      <div className="flex justify-between items-baseline w-full">
                        <span className={`text-xs font-bold font-serif ${
                          isToday ? "bg-[#2D5A27] text-white w-5 h-5 rounded-full flex items-center justify-center -ml-0.5" : ""
                        }`}>
                          {day.dayNum}
                        </span>
                        {status.isBlocked && (
                          <span className="text-[8px] font-bold text-[#8C6239] font-mono tracking-wide uppercase">LOCK</span>
                        )}
                      </div>

                      <div className="space-y-1 w-full text-[8px] font-mono mt-1">
                        {status.isBlocked ? (
                          <div className="text-[#8C6239] font-bold">🔒 Tutup</div>
                        ) : status.isSunday ? (
                          <div className="text-gray-400 font-light">Libur</div>
                        ) : status.totalBookings > 0 ? (
                          <div className="text-[#2D5A27] font-bold">
                            🟢 {status.totalBookings} Slot
                          </div>
                        ) : (
                          <div className="text-[#5B7A68]/40">Tersedia</div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Daily Slots Panel */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-[#1C2D24]/5 shadow-sm space-y-6">
              <div className="border-b border-[#1C2D24]/10 pb-4 flex justify-between items-center">
                <div>
                  <span className="text-[8px] font-mono font-bold tracking-widest text-[#8C6239] uppercase">DETAIL JADWAL</span>
                  <h3 className="font-serif text-lg font-semibold text-[#1C2D24] mt-0.5">
                    {new Date(`${selectedCalendarDateStr}T00:00:00`).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })}
                  </h3>
                </div>

                {/* Day block trigger */}
                <button
                  onClick={() => handleToggleBlockDay(selectedCalendarDateStr)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider font-mono border transition-all cursor-pointer ${
                    getDayStatus(selectedCalendarDateStr).isBlocked
                      ? "bg-[#8C6239] border-[#8C6239] text-[#F9F6F0] hover:bg-[#8C6239]/90"
                      : "border-[#8C6239] text-[#8C6239] bg-transparent hover:bg-[#8C6239]/10"
                  }`}
                >
                  {getDayStatus(selectedCalendarDateStr).isBlocked ? "🔓 Buka Hari" : "🔒 Blokir Hari"}
                </button>
              </div>

              {/* Day fully blocked notice */}
              {getDayStatus(selectedCalendarDateStr).isBlocked ? (
                <div className="p-8 text-center bg-amber-50/50 rounded-2xl border border-dashed border-[#8C6239]/30 text-amber-900 space-y-2">
                  <Lock className="w-8 h-8 text-[#8C6239] mx-auto" />
                  <h4 className="font-serif text-base font-semibold">Hari Ini Diblokir Penuh</h4>
                  <p className="text-xs text-[#5B7A68] max-w-xs mx-auto">
                    Klien tidak dapat memesan jam diskusi manapun pada tanggal ini karena sistem terkunci.
                  </p>
                </div>
              ) : getDayStatus(selectedCalendarDateStr).isSunday ? (
                <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-500 space-y-2">
                  <Calendar className="w-8 h-8 text-gray-400 mx-auto" />
                  <h4 className="font-serif text-base font-semibold">Hari Minggu</h4>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto">
                    Hari libur operasional reguler. Pilihan kalender user otomatis menyembunyikan hari Minggu.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold font-mono tracking-widest text-[#5B7A68] uppercase mb-4">
                    SLOT WAKTU (9:00 - 17:00)
                  </h4>
                  
                  <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                    {TIME_SLOTS.map(slot => {
                      const dayBookings = bookings.filter(b => getLocalDateStr(b.startTime) === selectedCalendarDateStr);
                      const booking = dayBookings.find(b => {
                        const bTime = new Date(b.startTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
                        return bTime === slot.value;
                      });

                      const isSlotBlocked = booking?.name === "BLOKIR JADWAL" && booking?.status === "CONFIRMED";

                      return (
                        <div
                          key={slot.value}
                          className={`flex items-center justify-between p-3.5 rounded-xl border text-xs transition-all ${
                            isSlotBlocked
                              ? "bg-amber-50/10 border-amber-200/40 text-amber-900"
                              : booking
                              ? "bg-[#2D5A27]/5 border-[#2D5A27]/10"
                              : "bg-white border-[#1C2D24]/5 hover:border-[#1C2D24]/10"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="font-mono font-bold text-[#1C2D24] text-[11px] bg-[#F9F6F0] px-2 py-1 rounded border border-[#1C2D24]/5">
                              {slot.value}
                            </div>
                            
                            <div className="text-left">
                              {isSlotBlocked ? (
                                <div className="font-semibold text-[#8C6239] flex items-center gap-1">
                                  <span>🔒 Jam Diblokir</span>
                                </div>
                              ) : booking ? (
                                <div>
                                  <div className="font-bold text-[#1C2D24]">{booking.name}</div>
                                  <div className="text-[10px] text-[#5B7A68] font-mono mt-0.5">
                                    {booking.resourceName} • {booking.whatsapp}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-[#2D5A27] font-semibold">🟢 Tersedia</div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isSlotBlocked ? (
                              <button
                                onClick={() => deleteBooking(booking.id)}
                                className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider font-mono bg-rose-50 text-rose-700 hover:bg-rose-100 rounded border border-rose-200/30 transition-colors cursor-pointer"
                              >
                                Buka Blokir
                              </button>
                            ) : booking ? (
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => openEditModal(booking)}
                                  className="p-1 rounded bg-white text-[#5B7A68] hover:text-[#1C2D24] border border-[#1C2D24]/10 transition-colors cursor-pointer"
                                  title="Edit/Reschedule"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => deleteBooking(booking.id)}
                                  className="p-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/40 transition-colors cursor-pointer"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => openManualBooking(selectedCalendarDateStr, slot.value)}
                                  className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider font-mono bg-[#1C2D24] text-[#F9F6F0] hover:bg-[#2D5A27] rounded transition-colors cursor-pointer"
                                >
                                  Book
                                </button>
                                <button
                                  onClick={() => handleBlockSlot(selectedCalendarDateStr, slot.value)}
                                  className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider font-mono border border-[#8C6239] text-[#8C6239] hover:bg-[#8C6239]/10 rounded transition-colors cursor-pointer"
                                >
                                  Blokir
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: TABLE LIST VIEW */}
        {activeTab === "list" && (
          <div className="space-y-6">
            {/* Booking Count Summary Widgets */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

            {/* List Controls */}
            <div className="flex justify-end gap-3 items-center bg-white p-4 rounded-xl border border-[#1C2D24]/5">
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 rounded-lg bg-white border border-[#1C2D24]/10 text-xs font-semibold focus:outline-none focus:border-[#2D5A27] text-[#1C2D24]"
              >
                <option value="ALL">Semua Status</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
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
                          <tr key={booking.id} className={`hover:bg-[#F9F6F0]/10 transition-colors ${
                            booking.name === "BLOKIR JADWAL" ? "bg-amber-50/20" : ""
                          }`}>
                            {/* Client details */}
                            <td className="px-6 py-5">
                              {booking.name === "BLOKIR JADWAL" ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-sm text-[#8C6239] flex items-center gap-1">🔒 JADWAL DIBLOKIR</span>
                                  <span className="text-[7px] font-mono font-bold tracking-widest text-[#8C6239] bg-[#8C6239]/10 px-1.5 py-0.5 rounded">UNAVAILABLE</span>
                                </div>
                              ) : booking.name === "BLOKIR HARI" ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-sm text-[#8C6239] flex items-center gap-1">🔒 HARI DIBLOKIR</span>
                                  <span className="text-[7px] font-mono font-bold tracking-widest text-[#8C6239] bg-[#8C6239]/10 px-1.5 py-0.5 rounded">FULL DAY</span>
                                </div>
                              ) : (
                                <div className="font-semibold text-sm text-[#1C2D24]">{booking.name}</div>
                              )}
                              
                              {booking.name === "BLOKIR JADWAL" || booking.name === "BLOKIR HARI" ? (
                                <span className="text-[10px] font-mono text-[#5B7A68]">Blokir Sistem</span>
                              ) : (
                                <a 
                                  href={waLink} 
                                  target="_blank" 
                                  className="text-xs font-mono text-[#5B7A68] hover:text-[#2D5A27] inline-flex items-center gap-1.5 mt-1"
                                >
                                  <span>{booking.whatsapp}</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
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
                                <button
                                  onClick={() => openEditModal(booking)}
                                  title="Reschedule / Edit"
                                  className="p-1.5 rounded bg-white text-[#5B7A68] hover:text-[#1C2D24] border border-[#1C2D24]/10 hover:border-[#1C2D24] transition-colors cursor-pointer"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                {booking.status !== "CONFIRMED" && (
                                  <button
                                    onClick={() => updateBookingStatus(booking.id, "CONFIRMED")}
                                    title="Konfirmasi"
                                    className="p-1.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/40 transition-colors cursor-pointer"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {booking.status !== "COMPLETED" && booking.name !== "BLOKIR JADWAL" && booking.name !== "BLOKIR HARI" && (
                                  <button
                                    onClick={() => updateBookingStatus(booking.id, "COMPLETED")}
                                    title="Tandai Selesai"
                                    className="p-1.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/40 transition-colors cursor-pointer"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {booking.status !== "CANCELLED" && (
                                  <button
                                    onClick={() => updateBookingStatus(booking.id, "CANCELLED")}
                                    title="Batalkan"
                                    className="p-1.5 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/40 transition-colors cursor-pointer"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteBooking(booking.id)}
                                  title="Hapus"
                                  className="p-1.5 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/40 transition-colors ml-2 cursor-pointer"
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
          </div>
        )}
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

      {/* 10. CREATE BOOKING & BLOCK SLOT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-[#F9F6F0] rounded-2xl shadow-2xl p-6 border border-[#1C2D24]/10 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-5 right-5 text-[#5B7A68] hover:text-[#1C2D24] transition-colors cursor-pointer"
            >
              <XCircle className="h-5 w-5" />
            </button>

            <div className="text-left pb-4 border-b border-[#1C2D24]/10 mb-6">
              <span className="text-[9px] font-mono text-[#5B7A68] font-bold tracking-widest uppercase block mb-1">ADMINISTRATOR ACT</span>
              <h4 className="font-serif text-2xl font-light text-[#1C2D24]">Tambah Booking / Blokir</h4>
              <p className="text-xs text-[#5B7A68] mt-1">Buat jadwal manual atau blokir slot agar tidak bisa dipesan klien.</p>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-4">
              <div className="flex gap-4 p-3 bg-white rounded-xl border border-[#1C2D24]/5">
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input 
                    type="radio" 
                    checked={createIsBlock} 
                    onChange={() => {
                      setCreateIsBlock(true);
                      setCreateName("BLOKIR JADWAL");
                      setCreateWhatsapp("00000000000");
                    }} 
                    className="accent-[#2D5A27]"
                  />
                  Blokir Slot (Unavailable)
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input 
                    type="radio" 
                    checked={!createIsBlock} 
                    onChange={() => {
                      setCreateIsBlock(false);
                      setCreateName("");
                      setCreateWhatsapp("");
                    }} 
                    className="accent-[#2D5A27]"
                  />
                  Booking Klien Manual
                </label>
              </div>

              {!createIsBlock && (
                <>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[#5B7A68] uppercase tracking-wider block font-mono">Nama Klien</label>
                    <input 
                      type="text" 
                      value={createName}
                      onChange={(e) => setCreateName(e.target.value)}
                      placeholder="Nama klien / instansi"
                      className="w-full rounded-xl bg-white px-4 py-3 text-xs text-[#1C2D24] border border-[#1C2D24]/10 focus:outline-none focus:border-[#2D5A27]"
                      required={!createIsBlock}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[#5B7A68] uppercase tracking-wider block font-mono">Nomor WhatsApp</label>
                    <input 
                      type="tel" 
                      value={createWhatsapp}
                      onChange={(e) => setCreateWhatsapp(e.target.value)}
                      placeholder="Contoh: 0812345678"
                      className="w-full rounded-xl bg-white px-4 py-3 text-xs text-[#1C2D24] border border-[#1C2D24]/10 focus:outline-none focus:border-[#2D5A27]"
                      required={!createIsBlock}
                    />
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-[#5B7A68] uppercase tracking-wider block font-mono">Layanan / Resource</label>
                <select 
                  value={createResourceName}
                  onChange={(e) => setCreateResourceName(e.target.value)}
                  className="w-full rounded-xl bg-white px-4 py-3 text-xs text-[#1C2D24] border border-[#1C2D24]/10 focus:outline-none focus:border-[#2D5A27]"
                >
                  <option value="Semua Layanan">Semua Layanan (Blokir Global)</option>
                  <option value="Website Kustom">Website Kustom</option>
                  <option value="Dasbor Internal">Dasbor Internal</option>
                  <option value="Company Profile">Company Profile</option>
                  <option value="Landing Page Penawaran">Landing Page Penawaran</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-[#5B7A68] uppercase tracking-wider block font-mono">Tanggal</label>
                  <input 
                    type="date" 
                    value={createDate}
                    onChange={(e) => setCreateDate(e.target.value)}
                    className="w-full rounded-xl bg-white px-4 py-3 text-xs text-[#1C2D24] border border-[#1C2D24]/10 focus:outline-none focus:border-[#2D5A27]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-[#5B7A68] uppercase tracking-wider block font-mono">Jam Diskusi</label>
                  <select 
                    value={createTime}
                    onChange={(e) => setCreateTime(e.target.value)}
                    className="w-full rounded-xl bg-white px-4 py-3 text-xs text-[#1C2D24] border border-[#1C2D24]/10 focus:outline-none focus:border-[#2D5A27]"
                  >
                    {TIME_SLOTS.map(slot => (
                      <option key={slot.value} value={slot.value}>{slot.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-3 border border-[#1C2D24]/10 text-[#5B7A68] text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-[#1C2D24]/5 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="flex-[2] py-3 bg-[#1C2D24] text-[#F9F6F0] text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-[#2D5A27] transition-colors shadow-sm cursor-pointer"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 11. RESCHEDULE & EDIT BOOKING MODAL */}
      {isEditModalOpen && editingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-[#F9F6F0] rounded-2xl shadow-2xl p-6 border border-[#1C2D24]/10 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingBooking(null);
              }}
              className="absolute top-5 right-5 text-[#5B7A68] hover:text-[#1C2D24] transition-colors cursor-pointer"
            >
              <XCircle className="h-5 w-5" />
            </button>

            <div className="text-left pb-4 border-b border-[#1C2D24]/10 mb-6">
              <span className="text-[9px] font-mono text-[#5B7A68] font-bold tracking-widest uppercase block mb-1">ADMINISTRATOR ACT</span>
              <h4 className="font-serif text-2xl font-light text-[#1C2D24]">Edit / Reschedule Jadwal</h4>
              <p className="text-xs text-[#5B7A68] mt-1">Ubah tanggal, jam, detail kontak, atau status jadwal.</p>
            </div>

            <form onSubmit={handleEditBooking} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-[#5B7A68] uppercase tracking-wider block font-mono">Nama / Deskripsi</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Nama klien / BLOKIR JADWAL"
                  className="w-full rounded-xl bg-white px-4 py-3 text-xs text-[#1C2D24] border border-[#1C2D24]/10 focus:outline-none focus:border-[#2D5A27]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-[#5B7A68] uppercase tracking-wider block font-mono">WhatsApp</label>
                <input 
                  type="text" 
                  value={editWhatsapp}
                  onChange={(e) => setEditWhatsapp(e.target.value)}
                  placeholder="WhatsApp number / 00000000000"
                  className="w-full rounded-xl bg-white px-4 py-3 text-xs text-[#1C2D24] border border-[#1C2D24]/10 focus:outline-none focus:border-[#2D5A27]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-[#5B7A68] uppercase tracking-wider block font-mono">Layanan / Resource</label>
                <select 
                  value={editResourceName}
                  onChange={(e) => setEditResourceName(e.target.value)}
                  className="w-full rounded-xl bg-white px-4 py-3 text-xs text-[#1C2D24] border border-[#1C2D24]/10 focus:outline-none focus:border-[#2D5A27]"
                >
                  <option value="Semua Layanan">Semua Layanan (Blokir Global)</option>
                  <option value="Website Kustom">Website Kustom</option>
                  <option value="Dasbor Internal">Dasbor Internal</option>
                  <option value="Company Profile">Company Profile</option>
                  <option value="Landing Page Penawaran">Landing Page Penawaran</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-[#5B7A68] uppercase tracking-wider block font-mono">Tanggal</label>
                  <input 
                    type="date" 
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full rounded-xl bg-white px-4 py-3 text-xs text-[#1C2D24] border border-[#1C2D24]/10 focus:outline-none focus:border-[#2D5A27]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-[#5B7A68] uppercase tracking-wider block font-mono">Jam Diskusi</label>
                  <select 
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="w-full rounded-xl bg-white px-4 py-3 text-xs text-[#1C2D24] border border-[#1C2D24]/10 focus:outline-none focus:border-[#2D5A27]"
                  >
                    {TIME_SLOTS.map(slot => (
                      <option key={slot.value} value={slot.value}>{slot.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-[#5B7A68] uppercase tracking-wider block font-mono">Status Jadwal</label>
                <select 
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full rounded-xl bg-white px-4 py-3 text-xs text-[#1C2D24] border border-[#1C2D24]/10 focus:outline-none focus:border-[#2D5A27]"
                >
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PENDING">PENDING</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingBooking(null);
                  }}
                  className="flex-1 py-3 border border-[#1C2D24]/10 text-[#5B7A68] text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-[#1C2D24]/5 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="flex-[2] py-3 bg-[#1C2D24] text-[#F9F6F0] text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-[#2D5A27] transition-colors shadow-sm cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
