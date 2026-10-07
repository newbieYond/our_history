import rawPlaces from "./places.json";
import rawDays from "./days.json";
import schedulePlaces from "./schedule-places.json";
import type { Category, Trip } from "../../lib/types";
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
    places: d.places.map((p) => ({ ...p, kind: p.kind as Category })),
    image: `trips/jeju/${["day-1-gimnyeong.jpg", "day-2-udo.jpg", "day-3-bijarim.jpg", "day-4-hallasan.jpg", "day-5-west-coast.jpg", "day-6-tangerines.jpg", "day-7-waterfall.jpg"][index]}`,
  })),
  places: rawPlaces.map((p) => {
    const days = p.tags
      .filter((t) => /^day\d+$/.test(t))
      .map((t) => Number(t.slice(3)));
    return {
      ...p,
      category: p.category as Category,
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
  verification: "기존 제주 여행계획의 저장 장소와 평가를 그대로 옮겼습니다.",
  map: {
    mainland: "trips/jeju/jeju-map-detail-v1.webp",
    inset: "trips/jeju/udo-map-detail-v1.webp",
    insetDay: 2,
    insetLabel: "우도",
    insetSafePositions: {
      종달리엔: { x: 76, y: 46 },
      "소금바치 순이네": { x: 84, y: 56 },
      목화식당휴게소: { x: 93, y: 46 },
    },
  },
};
export default trip;
