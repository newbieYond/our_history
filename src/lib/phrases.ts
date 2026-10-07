import type { TravelPhrase } from "./types.ts";
export function filterPhrases(
  phrases: TravelPhrase[],
  situation: string,
  day: string,
  query: string,
) {
  const search = query.trim().toLocaleLowerCase();
  return phrases.filter(
    (phrase) =>
      (situation === "전체" || phrase.situationId === situation) &&
      (day === "전체" || phrase.days.includes(Number(day))) &&
      `${phrase.original} ${phrase.translation} ${phrase.pronunciation} ${phrase.context} ${phrase.note ?? ""}`
        .toLocaleLowerCase()
        .includes(search),
  );
}
