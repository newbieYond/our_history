import type { Place } from "./types.ts";
export type CoordinateRecord = {
  latitude: number;
  longitude: number;
  sourceUrl: string;
  sourceName: string;
  checkedAt: string;
  match: string;
  googleMapsUrl?: string;
};
export function hasCoordinates<T extends Pick<Place, "latitude" | "longitude">>(
  p: T,
): p is T & { latitude: number; longitude: number } {
  return (
    typeof p.latitude === "number" &&
    Number.isFinite(p.latitude) &&
    Math.abs(p.latitude) <= 90 &&
    typeof p.longitude === "number" &&
    Number.isFinite(p.longitude) &&
    Math.abs(p.longitude) <= 180
  );
}
export function filterPlaces(
  places: Place[],
  region: string,
  category: string,
  query: string,
) {
  const search = query.trim().toLocaleLowerCase();
  return places.filter(
    (p) =>
      (region === "전체" || (p.mapRegion ?? p.area) === region) &&
      (category === "전체" || p.category === category) &&
      `${p.name} ${p.description} ${p.seonghoOpinion} ${p.seinOpinion}`
        .toLocaleLowerCase()
        .includes(search),
  );
}
