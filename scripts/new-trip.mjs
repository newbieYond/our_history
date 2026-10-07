import { mkdir, writeFile, access } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const [id, name, startDate, endDate] = process.argv.slice(2);
if (
  !id ||
  !/^[a-z][a-z0-9-]*$/.test(id) ||
  !name ||
  ![startDate, endDate].every(
    (date) =>
      /^\d{4}-\d{2}-\d{2}$/.test(date ?? "") &&
      !Number.isNaN(Date.parse(date)) &&
      new Date(date).toISOString().slice(0, 10) === date,
  ) ||
  endDate < startDate
) {
  console.error(
    '사용법: pnpm new:trip <영문-id> "여행 이름" <시작일 YYYY-MM-DD> <종료일 YYYY-MM-DD>',
  );
  process.exit(1);
}
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const folder = resolve(root, "src/trips", id);
try {
  await access(folder);
  console.error("이미 존재하는 여행입니다. 기존 여행을 덮어쓰지 않습니다.");
  process.exit(1);
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
await mkdir(folder, { recursive: true });
await mkdir(resolve(root, "public/trips", id), { recursive: true });
const trip = {
  id,
  name,
  englishName: id,
  theme: "winter",
  startDate,
  endDate,
  eyebrow: "A NEW TRAVEL NOTE",
  headline: "다음 이야기도, 함께.",
  description: "이 여행의 소개를 입력하세요.",
  cover: "trips/jeju/jeju-hero-v1.webp",
  coverAlt: "여행 대표 이미지",
  days: [
    {
      date: startDate.slice(5).replace("-", "."),
      title: "여행의 시작",
      area: name,
      flow: "",
      food: "",
      tone: "arrival",
      detail: "첫날의 계획을 입력하세요.",
      status: "계획 중",
    },
  ],
  places: [],
  notes: [],
  shopping: [],
  checklist: [],
  links: [],
  verification: "",
};
await writeFile(
  resolve(folder, "index.ts"),
  `import type { Trip } from "../../lib/types";\nconst trip: Trip = ${JSON.stringify(trip, null, 2)};\nexport default trip;\n`,
  { flag: "wx" },
);
console.log(
  `src/trips/${id}/index.ts에 새 여행을 만들었습니다. 내용과 대표 이미지를 수정하세요. 목록에는 자동으로 등록됩니다.`,
);
