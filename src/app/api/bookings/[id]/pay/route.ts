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
    const bookings = readBookings();
    const index = bookings.findIndex(b => b.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: "Booking tidak ditemukan." },
        { status: 404 }
      );
    }

    const booking = bookings[index];

    if (booking.paymentStatus === "PAID") {
      return NextResponse.json(
        { success: false, error: "Booking ini sudah berstatus PAID." },
        { status: 400 }
      );
    }

    // Update status to PAID & CONFIRMED
    booking.status = "CONFIRMED";
    booking.paymentStatus = "PAID";

    bookings[index] = booking;
    writeBookings(bookings);

    return NextResponse.json({
      success: true,
      booking,
      message: "Pembayaran terverifikasi secara aman melalui Headless Gateway!"
    });

  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
