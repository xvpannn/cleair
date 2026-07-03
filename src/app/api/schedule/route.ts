import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, whatsapp, date, topic } = body;

    // Validate fields
    if (!name || !whatsapp || !date || !topic) {
      return NextResponse.json(
        { success: false, error: "Semua kolom wajib diisi." },
        { status: 400 }
      );
    }

    // Output submission details to the server console (Infrastructure CTO visibility)
    console.log("=== NEW MEETING SCHEDULE REQUEST ===");
    console.log(`Nama: ${name}`);
    console.log(`WhatsApp: ${whatsapp}`);
    console.log(`Tanggal Rencana: ${date}`);
    console.log(`Topik Bahasan: ${topic}`);
    console.log("====================================");

    // Send push / email notification to admin
    try {
      const { sendAdminNotification } = await import("@/lib/notification");
      await sendAdminNotification({
        title: "Pengajuan Jadwal Diskusi Baru (Form)",
        name,
        whatsapp: whatsapp,
        service: topic,
        timeDetails: date
      });
    } catch (notifErr) {
      console.error("Failed to send admin notification:", notifErr);
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "Jadwal diskusi Anda berhasil diajukan. Tim Cleaire akan menghubungi Anda via WhatsApp dalam waktu maksimal 2 jam." 
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("API Schedule Error:", err);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
