import React, { createContext, useContext, useState, useCallback } from "react";
import BookingModal from "@/components/BookingModal";

const BookingContext = createContext({ openBooking: () => {} });

export function BookingProvider({ children }) {
  const [open, setOpen] = useState(false);

  const openBooking = useCallback(() => setOpen(true), []);
  const closeBooking = useCallback(() => setOpen(false), []);

  return (
    <BookingContext.Provider value={{ openBooking, closeBooking }}>
      {children}
      <BookingModal open={open} onOpenChange={setOpen} />
    </BookingContext.Provider>
  );
}

export function useBooking() {
  return useContext(BookingContext);
}
