import coordinates from "./coordinates.json";
import type { CoordinateRecord } from "../../lib/geo";
import rawPlaces from "./places.json";
import rawDays from "./days.json";
import schedulePlaces from "./schedule-places.json";
import type { Category, Trip } from "../../lib/types";
const locations: Record<string, CoordinateRecord> = coordinates;
const mapRegion = (lat: number, lng: number) =>
  lng > 126.94 && lat > 33.48
    ? "우도"
    : lng > 126.72
      ? "동부"
      : lng < 126.4
        ? "서부"
        : lat < 33.32
          ? "서귀포·남부"
          : lat > 33.43
            ? "제주시·북부"
            : "중산간·한라산";
const trip: Trip = {
  id: "jeju",
  name: "제주",
  englishName: "Jeju",
  theme: "autumn",
  startDate: "2026-10-30",
  endDate: "2026-11-05",
  eyebrow: "AN AUTUMN TRAVEL NOTE",
  headline: "잘 먹고, 천천히 걷는",
  description:
    "김녕의 바다부터 우도, 비자림과 한라산 자락까지. 매일 하나의 좋은 장면만 기억해도 충분한 두 사람의 가을 제주.",
  cover: "trips/jeju/jeju-hero-v1.webp",
  coverAlt: "제주 가을 바다와 풍경을 표현한 이미지",
  days: rawDays.map((d, index) => ({
    date: `${d.date} ${d.weekday}`,
    title: d.title,
    area: d.eyebrow,
    flow: d.places.map((p) => p.name).join(" · "),
    food: "",
    tone: "autumn",
    detail: d.summary,
    status: "여행 계획",
    accent: d.accent,
    tip: d.tip,
    schedule: d.schedule.map((item, scheduleIndex) => ({
      ...item,
      placeName: schedulePlaces[index][scheduleIndex],
    })),
    image: `trips/jeju/${["day-1-gimnyeong.jpg", "day-2-udo.jpg", "day-3-bijarim.jpg", "day-4-hallasan.jpg", "day-5-west-coast.jpg", "day-6-tangerines.jpg", "day-7-waterfall.jpg"][index]}`,
  })),
  places: rawPlaces.map((p) => {
    const days = p.tags
      .filter((t) => /^day\d+$/.test(t))
      .map((t) => Number(t.slice(3)));
    return {
      ...p,
      category: p.category as Category,
      latitude: locations[p.id].latitude,
      longitude: locations[p.id].longitude,
      googleMapsUrl: locations[p.id].googleMapsUrl ?? p.googleMapsUrl,
      mapRegion: mapRegion(locations[p.id].latitude, locations[p.id].longitude),
      coordinateNote: (
        {
          30: "체험농장은 미확정입니다. 저장 링크의 후보 농장 위치를 표시합니다.",
          142: "저장 링크는 바로 옆 카멜커피와 같습니다. 행원점의 정확한 위치는 방문 전에 확인해 주세요.",
        } as Record<number, string>
      )[p.id],
      days,
      day: days[0] ?? 1,
      area: days.length ? `DAY ${days[0]}` : "예비 장소",
      description: p.description,
      reviewSummary: p.description,
      isSelected: !p.isReserve,
    };
  }),
  highlights: [
    { label: "FLIGHT", value: "김포 14:20 → 제주 15:35" },
    { label: "STAY", value: "예그리나 10/30~11/1 → 더웰테라스 11/1~11/5" },
    { label: "PACE", value: "하루 핵심 경험 1~2개" },
    { label: "MOOD", value: "바다 · 숲 · 산책 · 향토음식" },
  ],
  notes: rawDays.map((d) => ({ title: d.title, body: d.tip })),
  shopping: [],
  checklist: [],
  links: [
    {
      icon: "☀️",
      label: "제주 날씨",
      href: "https://www.weather.go.kr/w/index.do",
    },
    { icon: "⛴️", label: "우도 배편", href: "https://udoship.com/" },
    { icon: "🌿", label: "비짓제주", href: "https://www.visitjeju.net/" },
    {
      icon: "⛰️",
      label: "한라산 통제",
      href: "https://visithalla.jeju.go.kr/main/main.do",
    },
  ],
  verification: "기존 여행계획·평가 보존 · 지도 위치 확인 2026.10.07",
  geoMap: {
    center: [33.38, 126.55],
    zoom: 10,
    regions: [
      "제주시·북부",
      "동부",
      "서부",
      "서귀포·남부",
      "중산간·한라산",
      "우도",
    ],
  },
};
export default trip;
