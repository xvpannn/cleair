import { NextResponse } from "next/server";
import { cancelBooking } from "@/lib/bookingService";

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

    const success = await cancelBooking(id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: "Data booking tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Jadwal diskusi berhasil dibatalkan."
    });

  } catch (err: any) {
    console.error("Cancel Booking Error:", err);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
