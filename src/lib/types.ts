export type Category = "spot" | "food" | "cafe" | "stay" | "shop";
export type Place = {
  id: number;
  name: string;
  category: Category;
  googleMapsUrl: string;
  area: string;
  day: number;
  days: number[];
  isReserve: boolean;
  isSelected: boolean;
  description: string;
  reviewSummary: string;
  imagePath?: string;
  seonghoOpinion: string;
  seinOpinion: string;
  seonghoRating: number | null;
  seinRating: number | null;
  tags: string[];
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  isRainyDayFriendly: boolean;
  mapRegion?: string;
  coordinateNote?: string;
};
export type Day = {
  date: string;
  title: string;
  area: string;
  flow: string;
  food: string;
  tone: string;
  detail: string;
  status: string;
  accent?: string;
  tip?: string;
  schedule?: {
    time: string;
    title: string;
    note: string;
    placeName?: string;
    rainy?: boolean;
  }[];
  image?: string;
};
export type TravelPhrase = {
  id: string;
  situationId: string;
  original: string;
  translation: string;
  pronunciation: string;
  context: string;
  days: number[];
  note?: string;
};
export type Phrasebook = {
  language: string;
  languageCode: string;
  intro: string;
  readingNote: string;
  situations: { id: string; label: string }[];
  phrases: TravelPhrase[];
};
export type Trip = {
  id: string;
  name: string;
  englishName: string;
  theme: string;
  startDate: string;
  endDate: string;
  eyebrow: string;
  headline: string;
  description: string;
  cover: string;
  coverAlt: string;
  days: Day[];
  places: Place[];
  notes: { title: string; body: string }[];
  shopping: { name: string; description: string; picks: string }[];
  checklist: { id: string; label: string; pending?: boolean }[];
  links: { icon: string; label: string; href: string }[];
  verification: string;
  highlights?: { label: string; value: string }[];
  shoppingIntro?: string;
  phrasebook?: Phrasebook;
  geoMap?: {
    center: [number, number];
    zoom: number;
    regions: string[];
  };
};
export const appTabs = [
  ["home", "홈"],
  ["itinerary", "일정"],
  ["phrases", "여행 회화"],
  ["notes", "여행 노트"],
  ["shopping", "쇼핑"],
  ["saved", "저장 장소"],
  ["checklist", "체크리스트"],
] as const;
export type Screen = (typeof appTabs)[number][0];
