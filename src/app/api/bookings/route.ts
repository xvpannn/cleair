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
      if (b.status === "CONFIRMED") {
        const bStart = new Date(b.startTime);
        const bEnd = new Date(b.endTime);
        const isOverlap = start < bEnd && end > bStart;
        if (isOverlap) {
          // Conflict if it's the same service, or one of them is "Semua Layanan" (global block)
          return b.resourceName === resourceName || b.resourceName === "Semua Layanan" || resourceName === "Semua Layanan";
        }
      }
      return false;
    });

    if (hasConflict) {
      return NextResponse.json(
        { success: false, error: "Jadwal slot waktu ini sudah dipesan atau diblokir. Silakan pilih waktu yang berbeda." },
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
    const { id, status, name, whatsapp, resourceName, startTime, endTime } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID wajib diisi." },
        { status: 400 }
      );
    }

    // If rescheduling, perform conflict checking
    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return NextResponse.json(
          { success: false, error: "Format tanggal tidak valid." },
          { status: 400 }
        );
      }

      if (end <= start) {
        return NextResponse.json(
          { success: false, error: "Waktu selesai harus setelah waktu mulai." },
          { status: 400 }
        );
      }

      const { updateBooking } = await import("@/lib/bookingService");
      const bookings = await readBookings();
      const targetResource = resourceName || bookings.find(b => b.id === id)?.resourceName || "";

      const hasConflict = bookings.some(b => {
        if (b.id !== id && b.status === "CONFIRMED") {
          const bStart = new Date(b.startTime);
          const bEnd = new Date(b.endTime);
          const isOverlap = start < bEnd && end > bStart;
          if (isOverlap) {
            return b.resourceName === targetResource || b.resourceName === "Semua Layanan" || targetResource === "Semua Layanan";
          }
        }
        return false;
      });

      if (hasConflict) {
        return NextResponse.json(
          { success: false, error: "Jadwal slot waktu ini sudah dipesan atau diblokir." },
          { status: 409 }
        );
      }
    }

    const { updateBooking } = await import("@/lib/bookingService");
    const updated = await updateBooking(id, {
      status,
      name,
      whatsapp,
      resourceName,
      startTime,
      endTime
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Pemesanan tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      booking: updated,
      message: "Data pemesanan berhasil diperbarui!"
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
