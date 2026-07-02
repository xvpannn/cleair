import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const BOOKINGS_FILE = path.join(process.cwd(), "bookings.json");

// Helper to read bookings from JSON file
function readBookings(): any[] {
  try {
    if (!fs.existsSync(BOOKINGS_FILE)) {
      const initialBookings = [
        {
          id: "book-001",
          name: "Pandu Kusuma",
          whatsapp: "081234567890",
          resourceName: "Website Portofolio Vila (Jasa)",
          resourceType: "SLOT",
          startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000).toISOString(),
          status: "CONFIRMED",
          createdAt: new Date().toISOString()
        }
      ];
      fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(initialBookings, null, 2));
      return initialBookings;
    }
    const data = fs.readFileSync(BOOKINGS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading bookings file:", err);
    return [];
  }
}

// Helper to write bookings to JSON file
function writeBookings(bookings: any[]) {
  try {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
  } catch (err) {
    console.error("Error writing bookings file:", err);
  }
}

export async function GET() {
  const bookings = readBookings();
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

    const bookings = readBookings();

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

    // 2. CREATE BOOKING IN CONFIRMED STATE (Free Scheduling Slot)
    const newBooking = {
      id: "book-" + Math.random().toString(36).substr(2, 9),
      name,
      whatsapp,
      resourceName,
      resourceType,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      status: "CONFIRMED",
      createdAt: now.toISOString()
    };

    bookings.push(newBooking);
    writeBookings(bookings);

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

    const bookings = readBookings();
    const index = bookings.findIndex(b => b.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: "Pemesanan tidak ditemukan." },
        { status: 404 }
      );
    }

    bookings[index].status = status;
    writeBookings(bookings);

    return NextResponse.json({
      success: true,
      booking: bookings[index],
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

    const bookings = readBookings();
    const filtered = bookings.filter(b => b.id !== id);

    if (bookings.length === filtered.length) {
      return NextResponse.json(
        { success: false, error: "Pemesanan tidak ditemukan." },
        { status: 404 }
      );
    }

    writeBookings(filtered);

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
