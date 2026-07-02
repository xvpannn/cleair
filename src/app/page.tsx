"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { 
  MessageSquare, 
  X, 
  Sparkles,
  Smartphone,
  Activity,
  Briefcase,
  Monitor,
  ChevronRight,
  ArrowUpRight
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

// 4 Core Services of Clear
const SERVICES = [
  { 
    id: "srv-01", 
    name: "Website Kustom", 
    tagline: "Arsitektur web khusus untuk proses bisnis yang unik.",
    icon: Monitor,
    description: "Ketika bisnis Anda membutuhkan arsitektur perangkat lunak yang dirancang khusus untuk menangani logika transaksi atau alur kerja spesifik yang tidak ada di solusi instan.",
    outcome: "Sistem fungsional yang berjalan sesuai dengan alur kerja spesifik operasional Anda.",
    delivery: "Custom",
    speed: "Aplikasi web yang dibangun tanpa dependensi template pihak ketiga.",
    integration: "Integrasi database relasional, API eksternal, dan logika bisnis kustom.",
    suitability: "Ketika bisnis Anda membutuhkan arsitektur perangkat lunak yang dirancang khusus untuk menangani logika transaksi atau alur kerja spesifik yang tidak ada di solusi instan.",
    ctaText: "Pesan Website Kustom"
  },
  { 
    id: "srv-02", 
    name: "Dasbor Internal", 
    tagline: "Lacak transaksi tanpa spreadsheet yang berantakan.",
    icon: Activity,
    description: "Ketika data bisnis Anda tercecer di WhatsApp dan Excel, membuat operasional mulai melambat dan rawan salah input.",
    outcome: "Pusat kendali operasional untuk mengurangi entri data ganda dan salah input.",
    delivery: "Custom",
    speed: "Dasbor operasional dengan pembaruan data waktu-nyata.",
    integration: "Otomatisasi pencatatan transaksi, manajemen stok, dan laporan keuangan terpadu.",
    suitability: "Ketika data bisnis Anda tercecer di WhatsApp dan Excel, membuat operasional mulai melambat dan rawan salah input.",
    ctaText: "Pesan Dasbor Internal"
  },
  { 
    id: "srv-03", 
    name: "Company Profile", 
    tagline: "Validasi bisnis profesional untuk calon mitra dan korporasi.",
    icon: Briefcase,
    description: "Saat Anda mulai membidik klien korporat atau investor besar yang membutuhkan bukti validitas bisnis yang profesional.",
    outcome: "Halaman portofolio digital yang memuat informasi struktur dan legalitas usaha Anda.",
    delivery: "3 Minggu",
    speed: "Akses cepat (<1.2 detik) dengan performa Lighthouse optimal.",
    integration: "Tata letak portofolio editorial yang bersih, teroptimasi SEO, dan responsif.",
    suitability: "Saat Anda mulai membidik klien korporat atau investor besar yang membutuhkan bukti validitas bisnis yang profesional.",
    ctaText: "Pesan Company Profile"
  },
  { 
    id: "srv-04", 
    name: "Landing Page Penawaran", 
    tagline: "Halaman terfokus untuk mengonversi klik iklan.",
    icon: Smartphone,
    description: "Ketika Anda sedang menjalankan iklan berbayar (Meta/Google Ads) untuk produk spesifik dan butuh konversi penjualan yang tinggi.",
    outcome: "Memastikan trafik iklan Anda tersalurkan menjadi hasil nyata.",
    delivery: "1 - 2 Minggu",
    speed: "Struktur halaman satu kolom dengan jalur tindakan tunggal tanpa gangguan.",
    integration: "Navigasi fokus tunggal dengan tombol aksi langsung terhubung ke admin WhatsApp.",
    suitability: "Ketika Anda sedang menjalankan iklan berbayar (Meta/Google Ads) untuk produk spesifik dan butuh konversi penjualan yang tinggi.",
    ctaText: "Pesan Landing Page Penawaran"
  }
];

const TIME_SLOTS = [
  { value: "09:00", label: "09:00 WIB" },
  { value: "11:00", label: "11:00 WIB" },
  { value: "14:00", label: "14:00 WIB" },
  { value: "16:00", label: "16:00 WIB" }
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState("srv-01");
  
  // Onboarding Form State
  const [formName, setFormName] = useState("");
  const [formWhatsapp, setFormWhatsapp] = useState("");
  const [formDetail, setFormDetail] = useState("");
  
  // Inline Calendar State (Watermelon UX)
  const [availableDays, setAvailableDays] = useState<Array<{ dateStr: string; label: string; dayName: string }>>([]);
  const [selectedDateStr, setSelectedDateStr] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("14:00");

  // Booking Modals
  const [activeCheckoutBooking, setActiveCheckoutBooking] = useState<BookingItem | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: "",
    type: "success"
  });

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "host"; text: string }>>([
    { sender: "host", text: "Halo. Saya Pramutamu Clear. Untuk menjaga efisiensi waktu, silakan pilih salah satu opsi di bawah untuk langsung menuju solusi yang Anda butuhkan." }
  ]);

  // Navbar scroll tracking
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Google Translate script loading
    (window as any).googleTranslateElementInit = () => {
      if ((window as any).google && (window as any).google.translate) {
        new (window as any).google.translate.TranslateElement(
          {
            pageLanguage: 'id',
            layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE
          },
          'google_translate_element'
        );
      }
    };

    if (!document.getElementById("google-translate-script")) {
      const addScript = document.createElement("script");
      addScript.setAttribute("id", "google-translate-script");
      addScript.setAttribute("src", "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit");
      document.body.appendChild(addScript);
    }
    
    // Generate next 7 days (excluding Sundays) for inline calendar
    const days = [];
    const weekdays = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
    
    let count = 0;
    let offset = 1;
    while (count < 7) {
      const d = new Date();
      d.setDate(d.getDate() + offset);
      if (d.getDay() !== 0) {
        const dateStr = d.toISOString().split("T")[0];
        days.push({
          dateStr,
          label: `${d.getDate()} ${months[d.getMonth()]}`,
          dayName: weekdays[d.getDay()]
        });
        count++;
      }
      offset++;
    }
    setAvailableDays(days);
    if (days.length > 0) {
      setSelectedDateStr(days[0].dateStr);
    }

    // Scroll listener for sticky dock transition
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const selectedService = SERVICES.find(s => s.id === selectedServiceId) || SERVICES[0];

  const triggerToast = (message: string, type: "success" | "error" | "warning") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    
    let targetTop = 0;
    if (id !== "top") {
      const element = document.getElementById(id);
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      targetTop = rect.top + scrollTop - 80; // Offset for sticky navbar height
    }

    const startY = window.pageYOffset || document.documentElement.scrollTop;
    const difference = targetTop - startY;
    const duration = 750; // smooth 750ms duration
    const startTime = performance.now();

    const step = (currentTime: number) => {
      const progress = currentTime - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      // Easing: easeInOutCubic
      const easing = percentage < 0.5 
        ? 4 * percentage * percentage * percentage 
        : 1 - Math.pow(-2 * percentage + 2, 3) / 2;

      window.scrollTo(0, startY + difference * easing);

      if (progress < duration) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName || !formWhatsapp || !selectedDateStr || !selectedTimeSlot) {
      triggerToast("Silakan lengkapi seluruh isian formulir.", "warning");
      return;
    }

    try {
      const startDateTimeStr = `${selectedDateStr}T${selectedTimeSlot}:00`;
      const start = new Date(startDateTimeStr);
      const end = new Date(start.getTime() + 60 * 60 * 1000);

      if (isNaN(start.getTime())) {
        triggerToast("Format tanggal atau waktu tidak valid.", "error");
        return;
      }

      const payload = {
        name: formName,
        whatsapp: formWhatsapp,
        resourceName: selectedService.name,
        resourceType: "SLOT",
        pricingUnit: "FLAT",
        basePrice: 0,
        startTime: start.toISOString(),
        endTime: end.toISOString()
      };

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        triggerToast("Permintaan slot diskusi berhasil diajukan!", "success");
        setFormName("");
        setFormWhatsapp("");
        setFormDetail("");
        setActiveCheckoutBooking(data.booking);
        setIsSubmitModalOpen(false);
      } else {
        triggerToast(data.error || "Gagal mengajukan permintaan.", "error");
      }
    } catch (err) {
      triggerToast("Terjadi kendala koneksi ke server.", "error");
    }
  };

  const getWhatsAppLink = (bookingDetails?: BookingItem) => {
    const waNumber = "6281805397068";
    const name = bookingDetails ? bookingDetails.name : formName || "[Belum diisi]";
    const serviceName = bookingDetails ? bookingDetails.resourceName : selectedService.name;
    const detail = formDetail || "Saya ingin tahu estimasi pengerjaan dan alur mulainya.";
    
    let timeStr = "";
    if (bookingDetails) {
      const d = new Date(bookingDetails.startTime);
      timeStr = `\n• Jadwal Diskusi: ${d.toLocaleDateString("id-ID", { dateStyle: "medium" })} pukul ${d.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })} WIB`;
    }
    
    const text = `Halo Clear,\n\nSaya ingin berdiskusi mengenai proyek website:\n\n• Nama: ${name}\n• Layanan: ${serviceName}${timeStr}\n• Catatan: ${detail}\n\nApakah jadwal ini dapat dikonfirmasi? Terima kasih.`;
    return `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
  };

  const handleSimulatedPayment = (bookingDetails: BookingItem) => {
    window.open(getWhatsAppLink(bookingDetails), "_blank");
    setActiveCheckoutBooking(null);
  };

  const handleFaqClick = (question: string, answer: string) => {
    setChatMessages(prev => [
      ...prev,
      { sender: "user", text: question },
      { sender: "host", text: answer }
    ]);
  };

  const faqItems = [
    {
      q: "Bisa bantu sistem atau otomasi apa saja?",
      a: "Kami membangun infrastruktur digital yang mengeliminasi kerja manual. Fokus kami adalah Website Kustom, Dasbor Operasional, Company Profile Korporat, dan Landing Page Iklan. Semua dirancang untuk satu tujuan: efisiensi sistem dan pertumbuhan bisnis Anda."
    },
    {
      q: "Bagaimana cara mulai kolaborasi?",
      a: "Sederhana. Anda memilih jadwal diskusi yang tersedia di halaman ini, mengunci slot waktu, dan kita akan langsung melakukan validasi kebutuhan bisnis Anda secara spesifik. Jika kualifikasi terpenuhi, proyek langsung berjalan."
    },
    {
      q: "Berapa kisaran investasi proyek?",
      a: "Investasi bersifat kustom, bergantung pada kompleksitas arsitektur sistem yang bisnis Anda butuhkan. Kami tidak berkompetisi di pasar harga murah; kami memberikan kepastian sistem yang andal, aman, dan tanpa celah kebocoran data."
    }
  ];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F9F6F0] flex items-center justify-center">
        <div className="font-serif italic text-2xl text-[#1C2D24]/60 animate-pulse">Clear.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F6F0] text-[#1C2D24] font-sans antialiased relative pb-0 selection:bg-[#1C2D24] selection:text-white">
      {/* Architectural dotted grid backdrop */}
      <div className="grid-bg"></div>

      {/* 1. BARLESS STICKY FLOATING DOCK (Posisi Fixed Sejati Tanpa Terperangkap Transform) */}
      <div className="fixed top-5 left-0 w-full z-50 px-4 flex justify-center pointer-events-none">
        <nav className={`pointer-events-auto flex items-center justify-between px-6 py-3 rounded-full border bg-white/80 backdrop-blur-md border-[#1C2D24]/5 shadow-sm max-w-[620px] w-full transition-all duration-500 ${
          isScrolled ? "scale-[0.96] shadow-md border-[#2D5A27]/10 bg-white/90" : ""
        }`}>
          <div className="flex items-center gap-1">
            <span 
              onClick={(e) => scrollToSection(e, "top")} 
              className="font-serif text-lg font-semibold tracking-tight text-[#1C2D24] cursor-pointer"
            >
              Clear<span className="text-[#2D5A27]">.</span>
            </span>
          </div>
          
          <div className="flex items-center gap-6 text-[9px] font-bold tracking-[0.2em] uppercase text-[#5B7A68]">
            <a href="#layanan" onClick={(e) => scrollToSection(e, "layanan")} className="hover:text-[#1C2D24] transition-colors">Layanan</a>
            <a href="#spesifikasi" onClick={(e) => scrollToSection(e, "spesifikasi")} className="hover:text-[#1C2D24] transition-colors">Kebutuhan</a>
            <a href="#filosofi" onClick={(e) => scrollToSection(e, "filosofi")} className="hover:text-[#1C2D24] transition-colors">Standar</a>
          </div>

          <div className="flex items-center gap-2">
            <div id="google_translate_element" className="mr-1"></div>
            <button 
              onClick={() => {
                setSelectedServiceId("srv-01");
                setIsSubmitModalOpen(true);
              }}
              className="rounded-full bg-[#1C2D24] px-4 py-1.5 text-[9px] font-bold tracking-wider uppercase text-[#F9F6F0] transition-all hover:bg-[#2D5A27]"
            >
              Call
            </button>
          </div>
        </nav>
      </div>

      {/* Padding to prevent layout jump under the floating nav */}
      <div className="h-24"></div>

      {/* Container untuk efek animasi masuk (fade-in) khusus section isi, bukan root div */}
      <div className="animate-fade-in relative z-10">
        
        {/* 2. HERO HEADER (Apple Typography & Spacing) */}
        <header className="relative py-24 text-center">
          <div className="mx-auto max-w-[1000px] px-6 space-y-8">
            <h1 className="font-serif text-4xl sm:text-7xl font-light tracking-tight text-[#1C2D24] leading-[1.1] max-w-4xl mx-auto">
              Kendalikan bisnis Anda. <br />
              <span className="font-serif italic text-[#5B7A68]">Dari mana saja</span>.
            </h1>

            <p className="text-base sm:text-lg font-light text-[#5B7A68] leading-relaxed max-w-2xl mx-auto">
              Satu sistem terintegrasi untuk mengelola transaksi, inventaris, dan klien.
            </p>

            {/* Apple Styled CTA with Tagline Beside Button */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
              <button 
                onClick={() => {
                  setSelectedServiceId("srv-01");
                  setIsSubmitModalOpen(true);
                }}
                className="w-full sm:w-auto text-center px-8 py-4 bg-[#1C2D24] text-[#F9F6F0] font-bold text-[10px] uppercase tracking-wider rounded-lg hover:bg-[#2D5A27] transition-all shadow-sm cursor-pointer"
              >
                Sederhanakan Bisnis Saya Sekarang
              </button>
              <div className="flex items-center gap-2 text-[#5B7A68]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2D5A27] animate-pulse"></span>
                <span className="font-mono text-[9px] tracking-wider uppercase font-semibold">
                  Tersedia 3 Slot Bulan Ini
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* 3. SERVICES SECTION (Alternating Editorial Artbook Style) */}
        <section id="layanan" className="py-28 bg-white border-y border-[#1C2D24]/5 relative">
          <div className="max-w-[1200px] mx-auto px-6 mb-24">
            <span className="text-[10px] font-semibold tracking-[0.25em] text-[#5B7A68] uppercase block mb-2 font-mono">PILIHAN LAYANAN</span>
            <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#1C2D24]">
              Pilih sistem yang mempermudah <br />
              <span className="font-serif italic text-[#5B7A68]">bisnis Anda berkembang</span>.
            </h2>
          </div>

          <div className="max-w-[1200px] mx-auto px-6 space-y-36">
            {SERVICES.map((srv, index) => {
              const Icon = srv.icon;
              const isEven = index % 2 === 0;
              return (
                <div 
                  key={srv.id}
                  className={`grid grid-cols-1 lg:grid-cols-12 gap-16 items-center ${
                    isEven ? "" : "lg:flex-row-reverse"
                  }`}
                >
                  {/* Text Content Column */}
                  <div className={`lg:col-span-6 space-y-6 ${
                    isEven ? "lg:order-1" : "lg:order-2"
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono font-bold text-[#8C6239] bg-[#8C6239]/10 px-3 py-1 rounded-full uppercase tracking-wider">
                        0{index + 1}
                      </span>
                      <span className="text-xs text-[#5B7A68] uppercase tracking-widest font-mono">CODE & STRUCTURE</span>
                    </div>
                    
                    <h3 className="font-serif text-3xl sm:text-4xl font-light text-[#1C2D24] leading-tight">
                      {srv.name}
                    </h3>
                    
                    <p className="text-[11px] font-mono text-[#2D5A27] uppercase tracking-widest font-bold">
                      {srv.tagline}
                    </p>
                    
                    <p className="text-sm text-[#5B7A68] font-sans font-light leading-relaxed max-w-xl">
                      {srv.description}
                    </p>

                    <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <button 
                        onClick={() => {
                          setSelectedServiceId(srv.id);
                          setIsSubmitModalOpen(true);
                        }}
                        className="px-6 py-3 bg-[#1C2D24] text-[#F9F6F0] hover:bg-[#2D5A27] transition-all text-[9px] font-bold uppercase tracking-wider rounded-lg shadow-sm cursor-pointer"
                      >
                        {srv.ctaText}
                      </button>
                      <a 
                        href={getWhatsAppLink()}
                        target="_blank"
                        className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#5B7A68] hover:text-[#1C2D24] transition-colors flex items-center gap-1.5"
                      >
                        Tanya via WhatsApp &rarr;
                      </a>
                    </div>
                  </div>

                  {/* Symmetrical High-Fidelity CSS Preview Column */}
                  <div className={`lg:col-span-6 ${
                    isEven ? "lg:order-2" : "lg:order-1"
                  }`}>
                    <div className="bg-[#F9F6F0] rounded-2xl p-6 sm:p-8 border border-[#1C2D24]/5 shadow-sm relative overflow-hidden h-[300px] flex flex-col justify-between group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#2D5A36]/5 rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-all duration-500"></div>
                      
                      <div className="flex justify-between items-center border-b border-[#1C2D24]/5 pb-3">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-[#2D5A27]" />
                          <span className="text-[9px] font-mono text-[#5B7A68] uppercase tracking-wider font-semibold">PREVIEW // SPECS</span>
                        </div>
                        <span className="text-[8px] font-mono text-[#2D5A27] bg-[#2D5A27]/10 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">Ready</span>
                      </div>

                      <div className="flex-1 flex flex-col justify-center gap-2 my-4">
                        <div className="flex items-baseline justify-between text-xs border-b border-dashed border-[#1C2D24]/5 pb-1">
                          <span className="text-[#5B7A68] font-mono text-[9px] uppercase">Pengerjaan</span>
                          <span className="font-semibold">{srv.delivery}</span>
                        </div>
                        <div className="flex items-baseline justify-between text-xs border-b border-dashed border-[#1C2D24]/5 pb-1">
                          <span className="text-[#5B7A68] font-mono text-[9px] uppercase">Fokus Hasil</span>
                          <span className="font-semibold text-[#2D5A27]">{srv.speed}</span>
                        </div>
                        <div className="flex items-baseline justify-between text-xs">
                          <span className="text-[#5B7A68] font-mono text-[9px] uppercase">Fitur Kunci</span>
                          <span className="font-mono text-[10px] text-[#1C2D24] text-right truncate max-w-[200px]">{srv.integration}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-t border-[#1C2D24]/5 pt-3 text-[8px] font-mono text-[#5B7A68] uppercase tracking-wider">
                        <span>Mempermudah Operasional</span>
                        <span>Hasil Terukur</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. OVERHAULED SPECIFICATIONS SECTION (Borderless Typographic Spec Columns with non-cliche outcomes) */}
        <section id="spesifikasi" className="py-28 max-w-[1200px] mx-auto px-6 relative">
          <div className="text-left max-w-2xl mb-20">
            <span className="text-[10px] font-semibold tracking-[0.25em] text-[#5B7A68] uppercase block mb-2 font-mono">BANDINGKAN KEBUTUHAN</span>
            <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#1C2D24]">
              Sesuaikan sistem dengan <br />
              <span className="font-serif italic text-[#5B7A68]">skala operasional Anda</span>.
            </h2>
          </div>

          {/* Borderless Typographic 4-Column Layout Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            {SERVICES.map((srv, index) => {
              const Icon = srv.icon;
              return (
                <div key={srv.id} className="space-y-6 flex flex-col justify-between min-h-[440px] p-4 bg-white rounded-2xl border border-[#1C2D24]/5 hover:shadow-md transition-all duration-300">
                  <div className="space-y-5">
                    <div className="flex items-center gap-3 pb-3 border-b border-[#1C2D24]/5">
                      <div className="w-8 h-8 rounded-full bg-[#F9F6F0] flex items-center justify-center">
                        <Icon className="w-4 h-4 text-[#2D5A27]" />
                      </div>
                      <div>
                        <span className="text-[8px] font-mono text-[#8C6239] uppercase font-bold block">Pilar 0{index + 1}</span>
                        <h4 className="font-serif text-base font-semibold text-[#1C2D24]">{srv.name.split(" & ")[0]}</h4>
                      </div>
                    </div>

                    {/* Vertical Typographic Spec List */}
                    <div className="space-y-4 text-xs leading-relaxed">
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-[#5B7A68] uppercase block">Kapan Membutuhkan Ini</span>
                        <p className="text-[#1C2D24] font-light">{srv.suitability}</p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-[#5B7A68] uppercase block">Hasil Utama</span>
                        <p className="text-[#2D5A27] font-semibold">{srv.outcome}</p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-[#5B7A68] uppercase block">Fitur Kunci</span>
                        <p className="text-[#1C2D24] font-light">{srv.integration}</p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-[#5B7A68] uppercase block">Estimasi Pengerjaan</span>
                        <p className="text-[#1C2D24] font-light">{srv.delivery}</p>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setSelectedServiceId(srv.id);
                      setIsSubmitModalOpen(true);
                    }}
                    className="w-full py-3 bg-[#1C2D24] text-[#F9F6F0] hover:bg-[#2D4A3A] transition-all rounded-lg text-[9px] font-bold uppercase tracking-wider font-mono cursor-pointer"
                  >
                    {srv.ctaText}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4.5 PORTFOLIO SECTION (Editorial Showcase Cards) */}
        <section id="portofolio" className="py-28 bg-[#F9F6F0] border-t border-[#1C2D24]/10 relative">
          <div className="max-w-[1200px] mx-auto px-6 mb-16">
            <span className="text-[10px] font-semibold tracking-[0.25em] text-[#5B7A68] uppercase block mb-2 font-mono">PORTOFOLIO</span>
            <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#1C2D24]">
              Telah diuji langsung <br />
              <span className="font-serif italic text-[#5B7A68]">oleh klien kami</span>.
            </h2>
          </div>

          <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Project 1: Joglo Sekar Munduk */}
            <div className="group space-y-6 bg-white p-6 rounded-2xl border border-[#1C2D24]/5 hover:shadow-lg transition-all duration-500">
               <div className="aspect-video w-full rounded-xl bg-[#F9F6F0] overflow-hidden relative border border-[#1C2D24]/5">
                <Image 
                  src="/joglo.webp" 
                  alt="Joglo Sekar Munduk website proof"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority={false}
                />
                {/* Ambient luxury tag overlay */}
                <div className="absolute top-4 right-4 z-10">
                  <span className="text-[8px] font-mono font-bold tracking-widest text-[#2D5A27] bg-[#F9F6F0]/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-[#2D5A27]/10 uppercase">
                    Live Online
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <span className="text-[9px] font-mono text-[#8C6239] uppercase font-bold tracking-wider">01 // Reservasi Vila Mewah</span>
                <h3 className="font-serif text-xl font-normal text-[#1C2D24]">Joglo Sekar Munduk</h3>
                <p className="text-xs text-[#5B7A68] font-light leading-relaxed">
                  Website resmi untuk reservasi vila kayu tradisional mewah di Munduk, Bali. Menampilkan galeri foto dengan estetika editorial tropis sejuk dan sistem navigasi reservasi langsung tanpa friksi.
                </p>
                <div className="pt-2">
                  <a 
                    href="https://joglosekarmunduk.com" 
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-wider text-[#2D5A27] hover:text-[#1C2D24] transition-colors"
                  >
                    Kunjungi Website &rarr;
                  </a>
                </div>
              </div>
            </div>

            {/* Project 2: Berdikari Consultant */}
            <div className="group space-y-6 bg-white p-6 rounded-2xl border border-[#1C2D24]/5 hover:shadow-lg transition-all duration-500">
               <div className="aspect-video w-full rounded-xl bg-white overflow-hidden relative border border-[#1C2D24]/5">
                <Image 
                  src="/berdikari.webp" 
                  alt="Berdikari Consultant website proof"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority={false}
                />
                {/* Ambient luxury tag overlay */}
                <div className="absolute top-4 right-4 z-10">
                  <span className="text-[8px] font-mono font-bold tracking-widest text-[#2D5A27] bg-[#F9F6F0]/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-[#2D5A27]/10 uppercase">
                    Live Online
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <span className="text-[9px] font-mono text-[#8C6239] uppercase font-bold tracking-wider">02 // Profil Bisnis & Legalitas</span>
                <h3 className="font-serif text-xl font-normal text-[#1C2D24]">Berdikari Consultant</h3>
                <p className="text-xs text-[#5B7A68] font-light leading-relaxed">
                  Website profil bisnis dan sistem informasi untuk kantor konsultan hukum dan pendirian usaha di Bali. Dirancang dengan tampilan formal bersih untuk meyakinkan calon klien korporat.
                </p>
                <div className="pt-2">
                  <a 
                    href="https://berdikariconsultant.com" 
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-wider text-[#2D5A27] hover:text-[#1C2D24] transition-colors"
                  >
                    Kunjungi Website &rarr;
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. BRAND PHILOSOPHY (Operating standards, no corporate preaching) */}
        <section id="filosofi" className="mx-auto max-w-[1200px] px-6 py-28 border-t border-[#1C2D24]/10">
          <div className="text-left mb-16">
            <span className="text-[10px] font-semibold tracking-[0.25em] text-[#5B7A68] uppercase block mb-2 font-mono">STANDAR KERJA</span>
            <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#1C2D24]">
              Bagaimana kami <span className="font-serif italic text-[#5B7A68]">bekerja dengan Anda</span>.
            </h2>
          </div>
          <div className="grid gap-12 md:grid-cols-3">
            <div className="space-y-4">
              <span className="font-serif text-4xl text-[#8C6239] font-light italic block">01.</span>
              <h3 className="font-serif text-lg font-normal text-[#1C2D24]">Kode Bersih & Efisien</h3>
              <p className="text-xs text-[#5B7A68] leading-relaxed font-light font-sans">
                Kecepatan load instan untuk kenyamanan pengunjung. Kami tidak menggunakan template berlebih yang mengorbankan pengalaman pengguna di HP.
              </p>
            </div>

            <div className="space-y-4">
              <span className="font-serif text-4xl text-[#8C6239] font-light italic block">02.</span>
              <h3 className="font-serif text-lg font-normal text-[#1C2D24]">Tanpa Biaya Tersembunyi</h3>
              <p className="text-xs text-[#5B7A68] leading-relaxed font-light font-sans">
                Setiap kesepakatan pengerjaan menggunakan satu harga datar terikat kontrak. Tidak ada tagihan susulan untuk lisensi atau konfigurasi server dasar.
              </p>
            </div>

            <div className="space-y-4">
              <span className="font-serif text-4xl text-[#8C6239] font-light italic block">03.</span>
              <h3 className="font-serif text-lg font-normal text-[#1C2D24]">Serah Terima Penuh</h3>
              <p className="text-xs text-[#5B7A68] leading-relaxed font-light font-sans">
                Kepemilikan kode sumber 100% berada di tangan Anda setelah peluncuran. Kami mendaftarkan hosting dan domain atas nama badan usaha Anda secara legal.
              </p>
            </div>
          </div>
        </section>

      </div> {/* Akhir dari container beranimasi */}

      {/* 6. SYMMETRICAL PREMIUM DARK PINE FOOTER (Full-Bleed 100vw Section) */}
      <footer className="w-full bg-[#1C2D24] text-[#F9F6F0] pt-28 pb-16 relative z-10">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-24 items-center">
            <div className="lg:col-span-7">
              <h2 className="font-serif text-3xl sm:text-5xl font-light text-white leading-tight">
                Mari diskusikan <span className="italic text-[#eae3db]">solusi kustom</span> <br />
                untuk masalah bisnis Anda.
              </h2>
            </div>
            <div className="lg:col-span-5 flex lg:justify-end">
              <button 
                onClick={() => {
                  setSelectedServiceId("srv-01");
                  setIsSubmitModalOpen(true);
                }}
                className="px-8 py-4 bg-white text-[#1C2D24] hover:bg-[#F9F6F0] text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all w-full sm:w-auto cursor-pointer shadow-sm"
              >
                Jadwalkan Panggilan
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pb-16 border-b border-white/10">
            <div className="space-y-3">
              <h5 className="text-[10px] font-bold text-white uppercase tracking-widest font-mono">Kontak & Lokasi</h5>
              <div className="space-y-2 text-xs text-[#F9F6F0]/60 font-light font-sans">
                <p>Sanur, Bali, Indonesia</p>
                <p>
                  <a href="tel:+6281805397068" className="hover:text-white transition-colors">+62 818 0539 7068</a>
                </p>
                <p>
                  <a href="mailto:dev@clear.com" className="hover:text-white transition-colors">dev@clear.com</a>
                </p>
              </div>
            </div>

            <div className="space-y-3 md:text-right">
              <h5 className="text-[10px] font-bold text-white uppercase tracking-widest font-mono">Studio Info</h5>
              <ul className="space-y-2 text-xs text-[#F9F6F0]/60 font-light font-sans">
                <li><a href="#filosofi" onClick={(e) => scrollToSection(e, "filosofi")} className="hover:text-white transition-colors">Filosofi Kerja</a></li>
                <li><span className="text-white font-semibold">Tersedia 3 Slot Proyek</span></li>
                <li><span className="opacity-60">GMT+08:00 Bali</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[9px] text-[#F9F6F0]/40 font-mono">
            <p>© 2026 Clear. Hak cipta dilindungi undang-undang.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</a>
              <a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a>
            </div>
          </div>
        </div>
      </footer>

      {/* 7. CALENDAR ONBOARDING MODAL (Rendered at Root Level to avoid Transform Trap) */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg bg-[#F9F6F0] rounded-2xl shadow-2xl p-6 sm:p-8 border border-[#1C2D24]/10 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsSubmitModalOpen(false)}
              className="absolute top-5 right-5 text-[#5B7A68] hover:text-[#1C2D24] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-left pb-4 border-b border-[#1C2D24]/10 mb-6">
              <span className="text-[9px] font-mono text-[#5B7A68] font-bold tracking-widest uppercase block mb-1">MULAI PROYEK DENGAN CLEAR</span>
              <h4 className="font-serif text-2xl font-light text-[#1C2D24]">Detail Diskusi Proyek</h4>
              <p className="text-xs text-[#5B7A68] mt-1">Kami memerlukan informasi dasar untuk menyiapkan draf konsep Anda.</p>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-[#5B7A68] uppercase tracking-wider block font-mono">Nama Anda / Perusahaan</label>
                <input 
                  type="text" 
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Vila Rimba / Bpk. Pandu"
                  className="w-full rounded-xl bg-white px-4 py-3.5 text-xs text-[#1C2D24] border border-[#1C2D24]/10 focus:outline-none focus:border-[#2D5A27]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-[#5B7A68] uppercase tracking-wider block font-mono">Nomor WhatsApp Anda</label>
                <input 
                  type="tel" 
                  value={formWhatsapp}
                  onChange={(e) => setFormWhatsapp(e.target.value)}
                  placeholder="Contoh: 08123456789"
                  className="w-full rounded-xl bg-white px-4 py-3.5 text-xs text-[#1C2D24] border border-[#1C2D24]/10 focus:outline-none focus:border-[#2D5A27]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-[#5B7A68] uppercase tracking-wider block font-mono">Jenis Layanan Yang Dibutuhkan</label>
                <select 
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full rounded-xl bg-white px-4 py-3.5 text-xs text-[#1C2D24] border border-[#1C2D24]/10 focus:outline-none focus:border-[#2D5A27]"
                >
                  {SERVICES.map(srv => (
                    <option key={srv.id} value={srv.id}>
                      {srv.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Apple-like Custom Inline Calendar / Date Picker Grid */}
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-[#5B7A68] uppercase tracking-wider block font-mono">Pilih Tanggal Diskusi</label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x touch-pan-x w-full">
                  {availableDays.map((day) => {
                    const isSelected = selectedDateStr === day.dateStr;
                    return (
                      <button
                        key={day.dateStr}
                        type="button"
                        onClick={() => setSelectedDateStr(day.dateStr)}
                        className={`p-2.5 rounded-lg border text-center flex flex-col items-center justify-center transition-all min-w-[62px] shrink-0 snap-start cursor-pointer ${
                          isSelected 
                            ? "bg-[#1C2D24] border-[#1C2D24] text-[#F9F6F0]" 
                            : "bg-white border-[#1C2D24]/10 text-[#1C2D24] hover:bg-[#1C2D24]/5"
                        }`}
                      >
                        <span className="text-[8px] font-mono uppercase opacity-60 block">{day.dayName.substring(0, 3)}</span>
                        <span className="text-xs font-bold font-serif mt-0.5">{day.label.split(" ")[0]}</span>
                        <span className="text-[8px] font-sans opacity-60 mt-0.5">{day.label.split(" ")[1]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slot Selector */}
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-[#5B7A68] uppercase tracking-wider block font-mono font-semibold">Pilih Jam Diskusi</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const isSelected = selectedTimeSlot === slot.value;
                    return (
                      <button
                        key={slot.value}
                        type="button"
                        onClick={() => setSelectedTimeSlot(slot.value)}
                        className={`py-2 rounded-lg border text-center text-[10px] font-mono transition-all cursor-pointer ${
                          isSelected 
                            ? "bg-[#2D5A27] border-[#2D5A27] text-white" 
                            : "bg-white border-[#1C2D24]/10 text-[#1C2D24] hover:bg-[#1C2D24]/5"
                        }`}
                      >
                        {slot.value}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Warning/Reschedule Notice */}
              <div className="bg-amber-50/60 border border-amber-200/50 rounded-xl p-3 text-[10px] text-amber-900 leading-relaxed font-sans">
                <span className="font-bold">Penting:</span> Jadwal bersifat final setelah dipesan dan tidak ada jadwal ulang. Pastikan Anda bisa hadir pada waktu tersebut.
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-[#5B7A68] uppercase tracking-wider block font-mono">Catatan Rencana Pembahasan (Opsional)</label>
                <textarea 
                  value={formDetail}
                  onChange={(e) => setFormDetail(e.target.value)}
                  placeholder="Tuliskan gambaran singkat sistem atau website yang ingin dibuat..."
                  rows={2}
                  className="w-full rounded-xl bg-white px-4 py-3.5 text-xs text-[#1C2D24] border border-[#1C2D24]/10 focus:outline-none focus:border-[#2D5A27] resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="flex-1 py-3.5 border border-[#1C2D24]/10 text-[#5B7A68] text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-[#1C2D24]/5 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="flex-[2] py-3.5 bg-[#1C2D24] text-[#F9F6F0] text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-[#2D4A3A] transition-colors shadow-sm cursor-pointer"
                >
                  Konfirmasi Slot Call
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. HEADLESS CONFIRMATION MODAL (Rendered at Root Level to avoid Transform Trap) */}
      {activeCheckoutBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-[#1C2D24]/10">
            <button 
              onClick={() => setActiveCheckoutBooking(null)}
              className="absolute top-5 right-5 text-[#5B7A68] hover:text-[#1C2D24] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center pb-4 border-b border-dashed border-[#1C2D24]/10 mb-6">
              <span className="text-[10px] font-mono text-[#2D5A27] font-bold tracking-widest uppercase block mb-1">CLEAR WEB STUDIO</span>
              <h4 className="font-serif text-2xl font-light text-[#1C2D24]">Appointment Booked</h4>
              <p className="text-[11px] text-[#5B7A68] mt-1">Kami telah memverifikasi slot diskusi Anda</p>
            </div>

            <div className="bg-[#F9F6F0] rounded-xl p-4 mb-6 space-y-2.5 text-xs border border-[#1C2D24]/5">
              <div className="flex justify-between">
                <span className="text-[#5B7A68]">Pemohon:</span>
                <span className="text-[#1C2D24] font-bold">{activeCheckoutBooking.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5B7A68]">Layanan:</span>
                <span className="text-[#1C2D24] font-medium">{activeCheckoutBooking.resourceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5B7A68]">Waktu Diskusi:</span>
                <span className="text-[#1C2D24] font-mono font-semibold">
                  {new Date(activeCheckoutBooking.startTime).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })} WIB
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5B7A68]">ID Appointment:</span>
                <span className="text-[#1C2D24] font-mono text-[10px] font-bold">{activeCheckoutBooking.id}</span>
              </div>
            </div>

            <p className="text-[11px] text-[#5B7A68] text-center mb-6 leading-relaxed">
              Silakan klik tombol di bawah untuk membuka obrolan langsung di WhatsApp. Kami akan segera mendiskusikan penawaran kustom Anda hari ini.
            </p>

            <button 
              onClick={() => handleSimulatedPayment(activeCheckoutBooking)}
              className="w-full py-4 bg-[#2D5A27] text-white text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-[#1F3E1B] transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageSquare className="h-4 w-4" />
              Buka Obrolan WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* 9. FLOATING WIDGETS & TOASTS (Rendered at Root Level to avoid Transform Trap) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 font-sans">
        {isChatOpen && (
          <div className="w-[340px] rounded-2xl bg-white shadow-2xl border border-[#1C2D24]/10 overflow-hidden flex flex-col h-[420px] animate-fade-in">
            <div className="bg-[#1C2D24] p-4 text-[#F9F6F0] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                </span>
                <div>
                  <h4 className="text-xs font-bold font-serif tracking-wide">Pramutamu Clear</h4>
                  <span className="text-[8px] text-green-200 uppercase font-mono tracking-widest">Online • Host</span>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-white/60 hover:text-white cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F9F6F0]/40 text-xs">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] p-3 rounded-xl leading-relaxed ${
                    msg.sender === "user" ? "bg-[#1C2D24] text-white rounded-tr-none" : "bg-white border border-[#1C2D24]/5 text-[#1C2D24] rounded-tl-none shadow-sm"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-white border-t border-[#1C2D24]/5">
              <span className="text-[8px] font-mono text-[#5B7A68] block mb-2 uppercase tracking-wider font-bold">Pertanyaan Populer:</span>
              <div className="flex flex-col gap-1.5 mb-3">
                {faqItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleFaqClick(item.q, item.a)}
                    className="w-full text-left text-[9px] text-[#2D5A27] bg-[#2D5A27]/5 hover:bg-[#2D5A27]/10 p-2 rounded-lg transition-colors font-mono uppercase tracking-wider cursor-pointer"
                  >
                    {item.q}
                  </button>
                ))}
              </div>
              <div className="text-[9px] text-[#5B7A68] leading-relaxed border-t border-dashed border-[#1C2D24]/5 pt-2.5">
                <span className="font-bold text-[#8C6239] uppercase text-[7px] tracking-wider block mb-0.5 font-mono">Catatan:</span>
                Punya kebutuhan spesifik yang tidak ada di pilihan di atas? Ajukan panggilan langsung untuk mendiskusikan arsitektur sistem Anda.
              </div>
            </div>
          </div>
        )}

        {/* Direct WhatsApp Contact Bubble */}
        <a 
          href={getWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#2D5A27] text-[#F9F6F0] shadow-2xl transition-all hover:scale-105 duration-200 cursor-pointer"
          title="Hubungi WhatsApp"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.022-.015-.043-.032-.063-.05l-.014-.012c-.23-.115-1.358-.67-1.567-.75-2.093-.79-2.093-.79-2.274-.492-.189.314-.73.914-.897 1.103-.166.188-.333.208-.63.093-1.077-.424-1.928-1.01-2.614-1.696-.686-.686-1.272-1.537-1.696-2.614-.115-.297-.095-.464.093-.63.19-.167.79-.708 1.103-.897.298-.18.298-.18-.492-2.274-.08-.209-.635-1.337-.75-1.567-.018-.02-.035-.041-.05-.063-.166-.333-.333-.333-.63-.333-.297 0-.61.015-.917.052-.906.11-1.62.63-2.03 1.458-.456.915-.25 2.146.49 3.518.91 1.688 2.06 3.03 3.442 4.412 1.382 1.382 2.724 2.532 4.412 3.442 1.372.74 2.603.946 3.518.49.828-.41 1.348-1.124 1.458-2.03.037-.307.052-.62.052-.917 0-.297 0-.464-.333-.63zM12 2C6.477 2 2 6.477 2 12c0 2.01.593 3.88 1.614 5.45L2 22l4.75-1.576c1.558.99 3.41 1.576 5.438 1.576 5.522 0 10-4.478 10-10S17.522 2 12 2z"/>
          </svg>
        </a>

        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#1C2D24] text-[#F9F6F0] shadow-2xl transition-all hover:scale-105 duration-200 cursor-pointer"
        >
          {isChatOpen ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
        </button>
      </div>

      {toast.show && (
        <div className="fixed bottom-6 left-6 z-50">
          <div className={`rounded-xl p-4 shadow-2xl border bg-white flex items-center gap-3 max-w-sm ${
            toast.type === "success" ? "border-green-500" : 
            toast.type === "error" ? "border-red-500" : "border-amber-500"
          }`}>
            <div className={`h-2 w-2 rounded-full ${
              toast.type === "success" ? "bg-green-500" : 
              toast.type === "error" ? "bg-red-500" : "bg-amber-500"
            }`}></div>
            <p className="text-xs font-medium text-[#1C2D24] font-sans">{toast.message}</p>
            <button 
              onClick={() => setToast(prev => ({ ...prev, show: false }))}
              className="text-[#5B7A68] hover:text-[#1C2D24] ml-2 cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
