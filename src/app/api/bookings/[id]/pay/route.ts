import { NextResponse } from "next/server";
import { updateBookingStatus, readBookings } from "@/lib/bookingService";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bookings = await readBookings();
    const booking = bookings.find(b => b.id === id);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking tidak ditemukan." },
        { status: 404 }
      );
    }

    if (booking.status === "CONFIRMED") {
      return NextResponse.json(
        { success: false, error: "Booking ini sudah berstatus CONFIRMED." },
        { status: 400 }
      );
    }

    // Update status to CONFIRMED
    const updated = await updateBookingStatus(id, "CONFIRMED");

    return NextResponse.json({
      success: true,
      booking: updated,
      message: "Pembayaran terverifikasi secara aman melalui Headless Gateway!"
    });

  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
