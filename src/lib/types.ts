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
  mapPosition?: { x: number; y: number };
};
export type MapPlace = {
  name: string;
  kind: Category;
  note: string;
  x: number;
  y: number;
  rainy?: boolean;
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
  places?: MapPlace[];
  image?: string;
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
  map?: {
    mainland: string;
    inset: string;
    insetDay: number;
    insetLabel: string;
    insetSafePositions?: Record<string, { x: number; y: number }>;
  };
};
export const appTabs = [
  ["home", "홈"],
  ["itinerary", "일정"],
  ["notes", "여행 노트"],
  ["shopping", "쇼핑"],
  ["saved", "저장 장소"],
  ["checklist", "체크리스트"],
] as const;
export type Screen = (typeof appTabs)[number][0];
