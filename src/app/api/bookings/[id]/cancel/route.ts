import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const BOOKINGS_FILE = path.join(process.cwd(), "bookings.json");

function readBookings(): any[] {
  try {
    if (!fs.existsSync(BOOKINGS_FILE)) return [];
    const data = fs.readFileSync(BOOKINGS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function writeBookings(bookings: any[]) {
  try {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
  } catch (err) {}
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { reason } = body;

    if (!reason) {
      return NextResponse.json(
        { success: false, error: "Alasan pembatalan harus disertakan." },
        { status: 400 }
      );
    }

    const bookings = readBookings();
    const index = bookings.findIndex(b => b.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: "Data booking tidak ditemukan." },
        { status: 404 }
      );
    }

    // Since this is a free scheduling slot calendar, we delete the entry from the database 
    // to keep the customer list clean and immediately free up the slot time.
    bookings.splice(index, 1);
    writeBookings(bookings);

    return NextResponse.json({
      success: true,
      message: "Jadwal diskusi berhasil dibatalkan dan dihapus sepenuhnya dari sistem."
    });

  } catch (err: any) {
    console.error("Cancel Booking Error:", err);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
