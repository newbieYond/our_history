import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { parseRoute, routeHash } from "../src/lib/route.ts";
import { ratingDetails } from "../src/lib/places.ts";
import {
  storageKey,
  readChecklist,
  writeChecklist,
} from "../src/lib/storage.ts";
const json = (path: string) =>
  JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8"));
test("여행 URL은 날짜와 여행을 분리하고 잘못된 경로를 안전하게 처리한다", () => {
  assert.deepEqual(parseRoute("#/jeju/itinerary/7", ["jeju", "hokkaido"]), {
    tripId: "jeju",
    screen: "itinerary",
    day: 6,
  });
  assert.deepEqual(parseRoute(routeHash("hokkaido", "saved"), ["hokkaido"]), {
    tripId: "hokkaido",
    screen: "saved",
    day: 0,
  });
  assert.equal(parseRoute("#/unknown/home", ["jeju"]), null);
  for (const day of ["-1", "NaN", "1.5"]) {
    assert.equal(parseRoute(`#/jeju/itinerary/${day}`, ["jeju"])?.day, 0);
  }
  assert.equal(parseRoute("#/jeju/missing", ["jeju"])?.screen, "home");
});
test("null과 0 미평가를 평균에서 제외하고 기존 평점을 보존한다", () => {
  assert.equal(
    ratingDetails({ seonghoRating: 0, seinRating: null }).value,
    null,
  );
  assert.equal(ratingDetails({ seonghoRating: 4, seinRating: 0 }).value, 4);
  assert.equal(ratingDetails({ seonghoRating: 3.8, seinRating: 4.2 }).value, 4);
});
test("마이그레이션한 장소 수, 고유 ID, 지도 링크, 평점 및 이미지가 유효하다", () => {
  for (const [id, count] of [
    ["jeju", 133],
    ["hokkaido", 68],
  ] as const) {
    const places = json(`../src/trips/${id}/places.json`);
    assert.equal(places.length, count);
    assert.equal(new Set(places.map((p: any) => p.id)).size, count);
    for (const p of places) {
      assert.ok(p.name);
      assert.ok(p.googleMapsUrl.startsWith("https://"));
      for (const rating of [p.seonghoRating, p.seinRating])
        assert.ok(rating === null || (rating >= 0 && rating <= 5));
      if (p.imagePath)
        assert.ok(
          existsSync(
            new URL(`../public/trips/${id}/${p.imagePath}`, import.meta.url),
          ),
        );
    }
  }
});
test("기존 일정을 7일 모두 보존하고 제주 다중 날짜 장소를 유지한다", () => {
  for (const id of ["jeju", "hokkaido"]) {
    const days = json(`../src/trips/${id}/days.json`);
    assert.equal(days.length, 7);
    for (const day of days) assert.ok(day.title);
  }
  const jeju = json("../src/trips/jeju/places.json");
  assert.deepEqual(
    jeju
      .find((p: any) => p.name === "제주공항")
      .tags.filter((tag: string) => tag.startsWith("day")),
    ["day1", "day7"],
  );
  assert.ok(
    json("../src/trips/jeju/days.json")[0].schedule.some((item: any) =>
      item.note.includes("기아 EV4 예약 완료"),
    ),
  );
});
test("브라우저 저장소는 여행별로 분리하며 손상되거나 차단되어도 안전하다", () => {
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", {
    value: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    },
    configurable: true,
  });
  assert.equal(writeChecklist("hokkaido", ["tour"]), true);
  assert.deepEqual(readChecklist("hokkaido"), ["tour"]);
  assert.deepEqual(readChecklist("jeju"), []);
  values.set(storageKey("hokkaido"), "not-json");
  assert.deepEqual(readChecklist("hokkaido"), []);
  Object.defineProperty(globalThis, "localStorage", {
    get() {
      throw new Error("blocked");
    },
    configurable: true,
  });
  assert.deepEqual(readChecklist("hokkaido"), []);
  assert.equal(writeChecklist("hokkaido", ["tour"]), false);
});
