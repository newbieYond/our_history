import type { Place } from "./types.ts";
export const categoryLabel: Record<string, string> = {
  cafe: "카페",
  food: "식당",
  shop: "쇼핑",
  spot: "명소",
  stay: "숙소",
};
export const categoryIcon: Record<string, string> = {
  cafe: "☕",
  food: "🍽",
  shop: "🛍",
  spot: "📍",
  stay: "🛏",
};
export function ratingDetails(
  place: Pick<Place, "seonghoRating" | "seinRating">,
) {
  const ratings = [
    { name: "성호", value: place.seonghoRating },
    { name: "세인", value: place.seinRating },
  ];
  const rated = ratings.filter(
    (item): item is { name: string; value: number } =>
      item.value !== null && item.value > 0,
  );
  const value = rated.length
    ? rated.reduce((sum, item) => sum + item.value, 0) / rated.length
    : null;
  return {
    value,
    label:
      value === null
        ? "아직 평가 없음"
        : rated.length === 1
          ? `${rated[0].name} 평가 ${value.toFixed(1)}`
          : `평균 ${value.toFixed(1)}`,
    ariaLabel: ratings
      .map(
        (item) =>
          `${item.name} ${item.value ? `${item.value.toFixed(1)}점` : "미평가"}`,
      )
      .join(", "),
  };
}
export const opinionRating = (rating: number | null) =>
  rating && rating > 0 ? `${rating.toFixed(1)} / 5.0` : "미평가";
