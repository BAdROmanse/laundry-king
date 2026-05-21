// client/context/BookingContext.tsx
// Shared state across the 3-step service booking flow:
// U3 (OfferedServices) → U3.1 (SelectWash) → U3.2 (PickupDelivery)

import { createContext, useContext, useState, ReactNode } from "react";
import type { PaymentMethod } from "@/lib/payments";

export interface BookingState {
  // Step U3
  serviceType: "Full Service" | "Dry and Fold" | "";
  isRushed: boolean;

  // Step U3.1
  packType: "Pack 1" | "Pack 2" | "Pack 3" | "";
  addons: string[]; // e.g. ["Fabric Conditioned", "Stain Removal"]

  // Step U3.2
  deliveryMode: "Delivery" | "Pick up" | "";
  paymentMethod: PaymentMethod | "";
  address: string;

  // Calculated
  weight: number;
}

const DEFAULT: BookingState = {
  serviceType: "",
  isRushed: false,
  packType: "",
  addons: [],
  deliveryMode: "",
  paymentMethod: "",
  address: "",
  weight: 1,
};

interface BookingContextValue {
  booking: BookingState;
  setBooking: React.Dispatch<React.SetStateAction<BookingState>>;
  resetBooking: () => void;
  calcTotal: () => number;
}

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [booking, setBooking] = useState<BookingState>(DEFAULT);

  function resetBooking() {
    setBooking(DEFAULT);
  }

  function calcTotal(): number {
    const BASE: Record<string, number> = {
      "Full Service": 30,
      "Dry and Fold": 20,
    };
    const ADDON: Record<string, number> = {
      "Fabric Conditioned": 30,
      "Stain Removal": 5,
    };
    const DELIVERY_FEE = 20;
    const RUSH_FEE = 20;

    let total = (BASE[booking.serviceType] ?? 30) * Math.max(booking.weight, 1);
    booking.addons.forEach((a) => {
      total += ADDON[a] ?? 0;
    });
    if (booking.isRushed) total += RUSH_FEE;
    if (booking.deliveryMode === "Delivery") total += DELIVERY_FEE;
    return total;
  }

  return (
    <BookingContext.Provider
      value={{ booking, setBooking, resetBooking, calcTotal }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking(): BookingContextValue {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used inside <BookingProvider>");
  return ctx;
}
