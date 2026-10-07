import { createContext, useContext } from "react";
import type { Trip } from "./types";
export const TripContext = createContext<Trip | null>(null);
export function useTrip() {
  const trip = useContext(TripContext);
  if (!trip) throw new Error("여행 컨텍스트가 필요합니다.");
  return trip;
}
