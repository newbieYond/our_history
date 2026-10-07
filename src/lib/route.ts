import { appTabs, type Screen } from "./types.ts";
export type Route = { tripId: string; screen: Screen; day: number } | null;
export function parseRoute(hash: string, tripIds: string[]): Route {
  const [tripId, screen = "home", day = "1"] = hash
    .replace(/^#\/?/, "")
    .split("/");
  if (!tripIds.includes(tripId)) return null;
  const number = Number(day);
  return {
    tripId,
    screen: appTabs.some(([id]) => id === screen) ? (screen as Screen) : "home",
    day: Number.isInteger(number) && number > 0 ? number - 1 : 0,
  };
}
export const routeHash = (tripId: string, screen: Screen, day = 0) =>
  `#/${tripId}/${screen}${screen === "itinerary" ? `/${day + 1}` : ""}`;
