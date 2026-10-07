import type { Trip } from "../lib/types";
const modules = import.meta.glob<{ default: Trip }>("./*/index.ts", {
  eager: true,
});
export const trips = Object.values(modules)
  .map((module) => module.default)
  .sort((a, b) => a.startDate.localeCompare(b.startDate));
if (new Set(trips.map((trip) => trip.id)).size !== trips.length)
  throw new Error("여행 ID는 중복될 수 없습니다.");
