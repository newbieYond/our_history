export const storageKey = (tripId: string) =>
  `our-history:${tripId}:checklist:v1`;
export function readChecklist(tripId: string): string[] {
  try {
    const data: unknown = JSON.parse(
      localStorage.getItem(storageKey(tripId)) ?? "[]",
    );
    return Array.isArray(data)
      ? data.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}
export function writeChecklist(tripId: string, ids: string[]) {
  try {
    localStorage.setItem(storageKey(tripId), JSON.stringify(ids));
    return true;
  } catch {
    return false;
  }
}
