import coordinates from "./coordinates.json";
import type { CoordinateRecord } from "../../lib/geo";
import rawPlaces from "./places.json";
import rawDays from "./days.json";
import shops from "./shops.json";
import type { Category, Trip } from "../../lib/types";
const locations: Record<string, CoordinateRecord> = coordinates;
const mapRegion = (lat: number, lng: number) =>
  lat > 43.6 && lng > 142.8
    ? "소운쿄"
    : lng > 142
      ? "비에이·후라노"
      : lat < 42.85
        ? "신치토세"
        : lng < 141.08
          ? "오타루"
          : lat < 43 && lng < 141.25
            ? "조잔케이"
            : "삿포로";
const trip: Trip = {
  id: "hokkaido",
  name: "홋카이도",
  englishName: "Hokkaido",
  theme: "winter",
  startDate: "2026-11-18",
  endDate: "2026-11-24",
  eyebrow: "A WINTER TRAVEL NOTE",
  headline: "눈이 오기 전,",
  description:
    "삿포로를 베이스로 조잔케이의 객실 노천탕, 오타루의 푸른 운하, 비에이의 겨울 풍경을 만나는 두 사람의 첫 홋카이도 여행.",
  cover: "trips/hokkaido/places/otaru-canal-summary.webp",
  coverAlt: "겨울 오타루 운하를 표현한 이미지",
  days: rawDays,
  places: rawPlaces.map((p) => ({
    ...p,
    category: p.category as Category,
    days: p.id === 7 ? [1, 7] : [p.day],
    description: p.reviewSummary,
    imagePath: `trips/hokkaido/${p.imagePath}`,
    tags: [],
    latitude: locations[p.id].latitude,
    longitude: locations[p.id].longitude,
    googleMapsUrl: locations[p.id].googleMapsUrl ?? p.googleMapsUrl,
    mapRegion: mapRegion(locations[p.id].latitude, locations[p.id].longitude),
    coordinateNote: (
      {
        21: "저장 링크는 삿포로 매장입니다. 공항 방문 계획과 구분해 확인해 주세요.",
        61: "저장 링크는 오타루 본점입니다. 공항 방문 계획과 구분해 확인해 주세요.",
        5: "소운쿄의 폭포입니다. 비에이·후라노와 떨어진 예비 장소입니다.",
        59: "공항 대표 위치입니다. 실내 위치는 공항 층별 안내를 확인해 주세요.",
      } as Record<number, string>
    )[p.id],
    address: null,
    isRainyDayFriendly: false,
    isSelected: "isSelected" in p && p.isSelected === true,
  })),
  notes: [
    {
      title: "숙소 & 짐",
      body: "게이큐 엑스 호텔 1박, 스이잔테이 클럽 조잔케이 1박, Y’s Sapporo 에어비앤비 4박. 조잔케이 복귀 버스의 승차장은 체크인 때 확인한다.",
    },
    {
      title: "겨울의 밤",
      body: "11/20 화이트 일루미네이션과 뮌헨 크리스마스 마켓, 11/21 오타루 푸른 운하는 여행의 고정된 야간 장면이다.",
    },
    {
      title: "고독한 미식가",
      body: "오타루 하츠하나는 운하 다음 저녁 후보. 작은 가게라 예약과 현금 준비가 필요하다. 니쿠노 아사쿠라는 징기스칸 대안으로 둔다.",
    },
    {
      title: "출발 전",
      body: "비에이 버스투어, 에어비앤비 사전체크인, 여행자보험·eSIM, 폭설·강풍과 로프웨이 운휴 여부만 출발 직전에 다시 확인한다.",
    },
  ],
  highlights: [
    { label: "TRAVELLERS", value: "02" },
    { label: "NIGHTS", value: "06" },
    { label: "CITIES & TOWNS", value: "05" },
    { label: "CASH TO PREPARE", value: "¥50K" },
  ],
  shoppingIntro:
    "시내에서 특별한 선물을 먼저 고르고, 공항에서 회사용 대량 과자를 마무리하는 순서가 가장 편하다.",
  shopping: shops.map(([name, description, picks]) => ({
    name,
    description,
    picks,
  })),
  checklist: [
    { id: "checkin", label: "OneStay 에어비앤비 사전체크인" },
    { id: "tour", label: "11월 22일 비에이 버스투어 예약", pending: true },
    { id: "bus", label: "조잔케이 복귀버스 정확한 승차장 확인" },
    { id: "essentials", label: "여행자보험·eSIM 및 직전 날씨 확인" },
  ],
  geoMap: {
    center: [43.16, 141.8],
    zoom: 8,
    regions: [
      "삿포로",
      "오타루",
      "조잔케이",
      "비에이·후라노",
      "신치토세",
      "소운쿄",
    ],
  },
  links: [],
  verification: "기존 공유 목록·평가 보존 · 지도 위치 확인 2026.10.07",
};
export default trip;
