// src/lib/bookingService.ts
import { prisma } from "./db";
import fs from "fs";
import path from "path";

const BOOKINGS_FILE = path.join(process.cwd(), "bookings.json");

export interface BookingItem {
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

// Read all bookings
export async function readBookings(): Promise<BookingItem[]> {
  try {
    const bookings = await prisma.simpleBooking.findMany({
      orderBy: { createdAt: "desc" },
    });
    return bookings.map((b) => ({
      id: b.id,
      name: b.name,
      whatsapp: b.whatsapp,
      resourceName: b.resourceName,
      resourceType: b.resourceType,
      startTime: b.startTime.toISOString(),
      endTime: b.endTime.toISOString(),
      status: b.status,
      createdAt: b.createdAt.toISOString(),
    }));
  } catch (err) {
    console.warn("Prisma read failed, falling back to bookings.json:", err);
    try {
      if (!fs.existsSync(BOOKINGS_FILE)) return [];
      const data = fs.readFileSync(BOOKINGS_FILE, "utf-8");
      return JSON.parse(data);
    } catch (fsErr) {
      return [];
    }
  }
}

// Write bookings fallback (for JSON file only)
function writeBookingsJson(bookings: BookingItem[]) {
  try {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
  } catch (err) {
    console.error("Failed to write to local bookings.json:", err);
  }
}

// Create a new booking
export async function createBooking(data: Omit<BookingItem, "id" | "createdAt" | "status">): Promise<BookingItem> {
  const now = new Date();
  const id = "book-" + Math.random().toString(36).substr(2, 9);
  
  const newBooking: BookingItem = {
    id,
    ...data,
    status: "CONFIRMED",
    createdAt: now.toISOString(),
  };

  try {
    const b = await prisma.simpleBooking.create({
      data: {
        id,
        name: data.name,
        whatsapp: data.whatsapp,
        resourceName: data.resourceName,
        resourceType: data.resourceType,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        status: "CONFIRMED",
        createdAt: now,
      },
    });
    return {
      id: b.id,
      name: b.name,
      whatsapp: b.whatsapp,
      resourceName: b.resourceName,
      resourceType: b.resourceType,
      startTime: b.startTime.toISOString(),
      endTime: b.endTime.toISOString(),
      status: b.status,
      createdAt: b.createdAt.toISOString(),
    };
  } catch (err) {
    console.warn("Prisma create failed, falling back to bookings.json:", err);
    const bookings = await readBookings();
    bookings.push(newBooking);
    writeBookingsJson(bookings);
    return newBooking;
  }
}

// Update booking status
export async function updateBookingStatus(id: string, status: string): Promise<BookingItem | null> {
  return updateBooking(id, { status });
}

// Generic update booking for full CRUD / rescheduling
export async function updateBooking(
  id: string,
  data: Partial<Omit<BookingItem, "id" | "createdAt">>
): Promise<BookingItem | null> {
  try {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.whatsapp !== undefined) updateData.whatsapp = data.whatsapp;
    if (data.resourceName !== undefined) updateData.resourceName = data.resourceName;
    if (data.resourceType !== undefined) updateData.resourceType = data.resourceType;
    if (data.startTime !== undefined) updateData.startTime = new Date(data.startTime);
    if (data.endTime !== undefined) updateData.endTime = new Date(data.endTime);
    if (data.status !== undefined) updateData.status = data.status;

    const b = await prisma.simpleBooking.update({
      where: { id },
      data: updateData,
    });
    return {
      id: b.id,
      name: b.name,
      whatsapp: b.whatsapp,
      resourceName: b.resourceName,
      resourceType: b.resourceType,
      startTime: b.startTime.toISOString(),
      endTime: b.endTime.toISOString(),
      status: b.status,
      createdAt: b.createdAt.toISOString(),
    };
  } catch (err) {
    console.warn("Prisma update failed, falling back to bookings.json:", err);
    const bookings = await readBookings();
    const index = bookings.findIndex((b) => b.id === id);
    if (index === -1) return null;
    
    if (data.name !== undefined) bookings[index].name = data.name;
    if (data.whatsapp !== undefined) bookings[index].whatsapp = data.whatsapp;
    if (data.resourceName !== undefined) bookings[index].resourceName = data.resourceName;
    if (data.resourceType !== undefined) bookings[index].resourceType = data.resourceType;
    if (data.startTime !== undefined) bookings[index].startTime = data.startTime;
    if (data.endTime !== undefined) bookings[index].endTime = data.endTime;
    if (data.status !== undefined) bookings[index].status = data.status;

    writeBookingsJson(bookings);
    return bookings[index];
  }
}

// Cancel booking
export async function cancelBooking(id: string): Promise<boolean> {
  try {
    await prisma.simpleBooking.update({
      where: { id },
      data: { status: "CANCELLED" },
    });
    return true;
  } catch (err) {
    console.warn("Prisma cancel failed, falling back to bookings.json:", err);
    const bookings = await readBookings();
    const index = bookings.findIndex((b) => b.id === id);
    if (index === -1) return false;
    bookings[index].status = "CANCELLED";
    writeBookingsJson(bookings);
    return true;
  }
}

// Delete booking
export async function deleteBooking(id: string): Promise<boolean> {
  try {
    await prisma.simpleBooking.delete({
      where: { id },
    });
    return true;
  } catch (err) {
    console.warn("Prisma delete failed, falling back to bookings.json:", err);
    const bookings = await readBookings();
    const filtered = bookings.filter((b) => b.id !== id);
    if (bookings.length === filtered.length) return false;
    writeBookingsJson(filtered);
    return true;
  }
}
