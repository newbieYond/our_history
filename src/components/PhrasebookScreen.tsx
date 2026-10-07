import { useState } from "react";
import { useTrip } from "../lib/TripContext";
import { filterPhrases } from "../lib/phrases";
import { FilterTags } from "./FilterTags";
import { useProgressiveList } from "../lib/useProgressiveList";
import { ListExpansion } from "./ListExpansion";
import "../themes/phrases.css";
export function PhrasebookScreen() {
  const trip = useTrip();
  const book = trip.phrasebook;
  const [situation, setSituation] = useState("전체");
  const [day, setDay] = useState("전체");
  const [query, setQuery] = useState("");
  const [copyStatus, setCopyStatus] = useState<{
    id: string;
    message: string;
  } | null>(null);
  const phrases = filterPhrases(book?.phrases ?? [], situation, day, query);
  const { visibleItems, showMore, showAll } = useProgressiveList(
    phrases,
    `${situation}|${day}|${query}`,
  );
  if (!book) return null;
  const reset = () => {
    setSituation("전체");
    setDay("전체");
    setQuery("");
    setCopyStatus(null);
  };
  return (
    <section className="phrasebook">
      <header className="phrasebook-heading">
        <p className="section-label">WORDS FOR OUR JOURNEY · {trip.name}</p>
        <h2>
          우리 여행에 필요한
          <br />
          <em>{book.language} 한마디.</em>
        </h2>
        <p>{book.intro}</p>
        <details className="phrase-reading-guide">
          <summary>독음 읽는 방법</summary>
          <p className="phrase-reading-note">{book.readingNote}</p>
        </details>
      </header>
      <div className="phrase-filters">
        <label className="phrase-search">
          표현 검색
          <input
            type="search"
            value={query}
            placeholder="예약, 라멘, 버스, 면세…"
            onChange={(e) => {
              setQuery(e.target.value);
              setCopyStatus(null);
            }}
          />
        </label>
        <FilterTags
          label="상황"
          options={[
            { value: "전체", label: "전체" },
            ...book.situations.map((s) => ({ value: s.id, label: s.label })),
          ]}
          selected={situation}
          onChange={(value) => {
            setSituation(value === situation ? "전체" : value);
            setCopyStatus(null);
          }}
        />
        <details
          className="phrase-day-filter"
          open={day !== "전체" ? true : undefined}
        >
          <summary>
            {day === "전체"
              ? "일정으로 좁혀 보기"
              : `DAY ${day} 일정으로 보는 중`}
          </summary>
          <FilterTags
            label="일정"
            options={[
              { value: "전체", label: "전체 일정" },
              ...trip.days.map((_, i) => ({
                value: String(i + 1),
                label: `DAY ${i + 1}`,
              })),
            ]}
            selected={day}
            onChange={(value) => {
              setDay(value === day ? "전체" : value);
              setCopyStatus(null);
            }}
          />
          {day !== "전체" && (
            <p className="phrase-day-context">
              DAY {day} · {trip.days[Number(day) - 1].title}
            </p>
          )}
        </details>
      </div>
      <div className="phrase-results">
        <p aria-live="polite">{phrases.length}개의 표현</p>
        {(situation !== "전체" || day !== "전체" || query) && (
          <button
            type="button"
            onClick={reset}
            aria-label="회화 필터와 검색 초기화"
          >
            전체 표현 보기 ↗
          </button>
        )}
      </div>
      <div className="phrase-grid">
        {visibleItems.map((phrase) => (
          <article className="phrase-card" key={phrase.id}>
            <div className="phrase-card-top">
              <span>
                {
                  book.situations.find((s) => s.id === phrase.situationId)
                    ?.label
                }
              </span>
              <small>
                {phrase.days.length === trip.days.length
                  ? "여행 내내"
                  : phrase.days.map((d) => `DAY ${d}`).join(" · ")}
              </small>
            </div>
            <h3>{phrase.translation}</h3>
            <div className="phrase-original-row">
              <p className="phrase-original" lang={book.languageCode}>
                {phrase.original}
              </p>
              <button
                type="button"
                className="phrase-copy-button"
                aria-label={`${phrase.translation} ${book.language} 문장 복사`}
                title={`${book.language} 문장 복사`}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(phrase.original);
                    setCopyStatus({
                      id: phrase.id,
                      message: `${book.language} 문장을 복사했어요.`,
                    });
                  } catch {
                    setCopyStatus({
                      id: phrase.id,
                      message: `${book.language} 문장을 길게 눌러 복사해 주세요.`,
                    });
                  }
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  <rect x="8" y="8" width="12" height="12" rx="2" />
                  <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
                </svg>
              </button>
            </div>
            <p className="phrase-copy-status" role="status">
              {copyStatus?.id === phrase.id ? copyStatus.message : ""}
            </p>
            <p className="phrase-pronunciation">
              <span>독음</span>
              {phrase.pronunciation}
            </p>
            <p className="phrase-context">{phrase.context}</p>
            {phrase.note && <p className="phrase-note">{phrase.note}</p>}
          </article>
        ))}
      </div>
      <ListExpansion
        noun="표현"
        shown={visibleItems.length}
        total={phrases.length}
        onMore={showMore}
        onAll={showAll}
      />
      {phrases.length === 0 && (
        <p className="empty-state">
          조건에 맞는 표현이 없어요. 다른 상황을 고르거나 검색어를 바꿔 보세요.
        </p>
      )}
    </section>
  );
}
