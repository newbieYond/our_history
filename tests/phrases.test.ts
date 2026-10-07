import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { filterPhrases } from "../src/lib/phrases.ts";
import { parseRoute, routeHash } from "../src/lib/route.ts";
import type { Phrasebook } from "../src/lib/types.ts";
const book: Phrasebook = JSON.parse(
  readFileSync(
    new URL("../src/trips/hokkaido/phrases.json", import.meta.url),
    "utf8",
  ),
);

test("여행 회화 URL을 직접 열고 새로고침할 수 있다", () => {
  assert.deepEqual(parseRoute(routeHash("hokkaido", "phrases"), ["hokkaido"]), {
    tripId: "hokkaido",
    screen: "phrases",
    day: 0,
  });
});
test("회화는 모든 상황과 7일 일정을 포함하고 원문·해석·독음·맥락이 빠지지 않는다", () => {
  const situations = new Set(book.situations.map((s) => s.id));
  assert.equal(
    new Set(book.phrases.map((p) => p.id)).size,
    book.phrases.length,
  );
  assert.equal(
    new Set(book.phrases.map((p) => p.original)).size,
    book.phrases.length,
  );
  for (const phrase of book.phrases) {
    assert.ok(situations.has(phrase.situationId));
    assert.ok(phrase.original.trim());
    assert.ok(phrase.translation.trim());
    assert.ok(phrase.pronunciation.trim());
    assert.ok(phrase.context.trim());
    assert.ok(phrase.days.length);
    assert.ok(
      phrase.days.every((day) => Number.isInteger(day) && day >= 1 && day <= 7),
    );
  }
  for (const situation of situations)
    assert.ok(book.phrases.some((p) => p.situationId === situation));
  for (let day = 1; day <= 7; day++)
    assert.ok(book.phrases.some((p) => p.days.includes(day)));
  const tour = book.phrases.find((p) => p.id === "tour-booking")!;
  assert.match(tour.note!, /투어 미정/);
});
test("상황·날짜·검색을 함께 적용하고 다른 날짜 표현을 섞지 않는다", () => {
  const results = filterPhrases(book.phrases, "hotel", "2", "송영");
  assert.ok(results.length >= 2);
  assert.ok(
    results.every((p) => p.situationId === "hotel" && p.days.includes(2)),
  );
  assert.equal(filterPhrases(book.phrases, "onsen", "7", "").length, 0);
  assert.deepEqual(
    filterPhrases(book.phrases, "전체", "전체", "南小樽").map((p) => p.id),
    ["minami-otaru-tickets", "minami-otaru-stop"],
  );
  assert.equal(
    filterPhrases(book.phrases, "전체", "전체", "xxx없는표현").length,
    0,
  );
  assert.equal(
    filterPhrases(book.phrases, "전체", "전체", "").length,
    book.phrases.length,
  );
});
