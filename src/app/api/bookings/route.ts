import { NextResponse } from "next/server";
import { readBookings, createBooking, updateBookingStatus, deleteBooking } from "@/lib/bookingService";

export async function GET() {
  const bookings = await readBookings();
  return NextResponse.json({ success: true, bookings });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, whatsapp, resourceName, startTime, endTime, resourceType } = body;

    // Validate inputs
    if (!name || !whatsapp || !resourceName || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, error: "Semua parameter pemesanan jadwal wajib diisi." },
        { status: 400 }
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { success: false, error: "Format tanggal tidak valid." },
        { status: 400 }
      );
    }

    if (start <= now) {
      return NextResponse.json(
        { success: false, error: "Waktu diskusi harus di masa depan." },
        { status: 400 }
      );
    }

    if (end <= start) {
      return NextResponse.json(
        { success: false, error: "Waktu selesai harus setelah waktu mulai." },
        { status: 400 }
      );
    }

    const bookings = await readBookings();

    // 1. TEMPORAL VALIDATION: Prevent double booking for slot resources at the same time
    const hasConflict = bookings.some(b => {
      if (b.resourceName === resourceName && b.status === "CONFIRMED") {
        const bStart = new Date(b.startTime);
        const bEnd = new Date(b.endTime);
        // Overlap condition: start < bEnd && end > bStart
        return start < bEnd && end > bStart;
      }
      return false;
    });

    if (hasConflict) {
      return NextResponse.json(
        { success: false, error: "Jadwal slot waktu ini sudah dipesan untuk diskusi lain. Silakan pilih waktu yang berbeda." },
        { status: 409 } // 409 Conflict
      );
    }

    // 2. CREATE BOOKING
    const newBooking = await createBooking({
      name,
      whatsapp,
      resourceName,
      resourceType: resourceType || "SLOT",
      startTime: start.toISOString(),
      endTime: end.toISOString()
    });

    // Send push / email notification to admin
    try {
      const { sendAdminNotification } = await import("@/lib/notification");
      const formattedTime = `${new Date(newBooking.startTime).toLocaleDateString("id-ID", { dateStyle: "medium" })} pukul ${new Date(newBooking.startTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB`;
      await sendAdminNotification({
        title: "Booking Slot Diskusi Baru!",
        name: newBooking.name,
        whatsapp: newBooking.whatsapp,
        service: newBooking.resourceName,
        timeDetails: formattedTime
      });
    } catch (notifErr) {
      console.error("Failed to send admin notification:", notifErr);
    }

    return NextResponse.json({
      success: true,
      booking: newBooking,
      message: "Jadwal diskusi Anda berhasil diajukan dan terkonfirmasi!"
    });

  } catch (err: any) {
    console.error("POST Booking Error:", err);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "ID dan status wajib diisi." },
        { status: 400 }
      );
    }

    const updated = await updateBookingStatus(id, status);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Pemesanan tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      booking: updated,
      message: "Status pemesanan berhasil diperbarui!"
    });
  } catch (err: any) {
    console.error("PUT Booking Error:", err);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID wajib disertakan." },
        { status: 400 }
      );
    }

    const success = await deleteBooking(id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: "Pemesanan tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Pemesanan berhasil dihapus!"
    });
  } catch (err: any) {
    console.error("DELETE Booking Error:", err);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
