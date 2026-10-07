import { useRef, useState, type CSSProperties } from "react";
import { useTrip } from "../lib/TripContext";
import { categoryIcon, categoryLabel } from "../lib/places";
import { TravelMap } from "./TravelMap";
import { FilterTags } from "./FilterTags";
import type { Place } from "../lib/types";
export function ItineraryScreen({
  selected,
  onSelectDay,
  onOpenPlace,
}: {
  selected: number;
  onSelectDay: (index: number) => void;
  onOpenPlace: (place: Place) => void;
}) {
  const trip = useTrip();
  const day = trip.days[selected];
  const [mapSelection, setMapSelection] = useState<number | null>(null);
  const [mapRegion, setMapRegion] = useState("전체");
  const mapRef = useRef<HTMLDivElement>(null);
  const dayPlaces = trip.places.filter((p) => p.days.includes(selected + 1));
  const mapPlaces = dayPlaces.filter(
    (p) => mapRegion === "전체" || p.mapRegion === mapRegion,
  );
  const regions =
    trip.geoMap?.regions.filter((r) =>
      dayPlaces.some((p) => p.mapRegion === r),
    ) ?? [];
  const selectSchedule = (name?: string) => {
    const place = trip.places.find((p) => p.name === name);
    if (!place) return;
    setMapRegion("전체");
    setMapSelection(place.id);
    mapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <section className="itinerary">
      <div className="section-head">
        <div>
          <p className="section-label">THE PLAN · {trip.name}</p>
          <h2>
            {trip.days.length} days
            <br />
            of small stories.
          </h2>
        </div>
      </div>
      <div className="day-selector" role="group" aria-label="일정 날짜 선택">
        {trip.days.map((item, index) => (
          <button
            type="button"
            aria-pressed={selected === index}
            className={selected === index ? "active" : ""}
            key={item.date}
            onClick={() => onSelectDay(index)}
          >
            <small>{item.date}</small>
            <strong>DAY {index + 1}</strong>
            <span>{item.title}</span>
          </button>
        ))}
      </div>
      <article
        className={`day-card day-detail ${day.tone}`}
        style={
          { "--active-accent": day.accent ?? "var(--rust)" } as CSSProperties
        }
      >
        <div className="card-number" aria-hidden="true">
          {String(selected + 1).padStart(2, "0")}
        </div>
        <p>
          {day.date} · {day.area}
        </p>
        <h3>{day.title}</h3>
        <span className={day.status.includes("미정") ? "pending" : "confirmed"}>
          {day.status}
        </span>
        <div className="route">
          {day.flow.split(" · ").map((stop, index) => (
            <span key={`${index}-${stop}`}>
              {stop}
              {index < day.flow.split(" · ").length - 1 && (
                <b aria-hidden="true">→</b>
              )}
            </span>
          ))}
        </div>
        <p className="detail">{day.detail}</p>
        {day.food && (
          <div className="food">
            <span>오늘의 맛</span>
            <strong>{day.food}</strong>
          </div>
        )}
      </article>
      <div
        className={trip.geoMap && day.schedule ? "itinerary-detail-grid" : ""}
      >
        {trip.geoMap && (
          <div ref={mapRef} className="day-map-wrapper">
            <a className="all-regions-link" href={`#/${trip.id}/saved`}>
              전체·권역별 지도 보기 →
            </a>
            {regions.length > 1 && (
              <FilterTags
                label="지도 권역"
                options={["전체", ...regions].map((value) => ({
                  value,
                  label: value,
                }))}
                selected={mapRegion}
                onChange={(value) => {
                  setMapRegion(value);
                  setMapSelection(null);
                }}
              />
            )}
            <TravelMap
              places={mapPlaces}
              title={`DAY ${selected + 1} · ${mapRegion === "전체" ? "오늘의 장소 지도" : mapRegion}`}
              selectedId={mapSelection}
              onSelect={setMapSelection}
              onOpenPlace={onOpenPlace}
            />
          </div>
        )}
        <div>
          {day.schedule && (
            <section className="schedule-panel">
              <h3>추천 흐름</h3>
              {day.schedule.map((item, index) => (
                <article
                  key={`${index}-${item.title}`}
                  role={trip.geoMap && item.placeName ? "button" : undefined}
                  tabIndex={trip.geoMap && item.placeName ? 0 : undefined}
                  onClick={() => selectSchedule(item.placeName)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      selectSchedule(item.placeName);
                    }
                  }}
                >
                  <time>{item.time}</time>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.note}</p>
                  </div>
                  {item.rainy && (
                    <span aria-label="비 오는 날에도 좋아요">☂</span>
                  )}
                </article>
              ))}
              {day.tip && <p className="day-tip">{day.tip}</p>}
            </section>
          )}
        </div>
      </div>
      <section className="day-places">
        <h3>
          오늘의 장소 <small>{dayPlaces.length}곳</small>
        </h3>
        <div className="day-place-grid">
          {dayPlaces.map((place) => (
            <button
              key={place.id}
              type="button"
              aria-label={`${place.name} ${trip.geoMap ? "지도에서 보기" : "상세 보기"}`}
              onClick={() =>
                trip.geoMap ? selectSchedule(place.name) : onOpenPlace(place)
              }
            >
              <span>
                {categoryIcon[place.category]} {categoryLabel[place.category]}
                {place.isReserve ? " · 예비" : ""}
              </span>
              <strong>{place.name}</strong>
              <small>{place.seonghoOpinion || place.description}</small>
            </button>
          ))}
        </div>
      </section>
      <div className="common-day-pager">
        <button
          type="button"
          disabled={selected === 0}
          aria-label="이전 날짜 일정 보기"
          onClick={() => onSelectDay(selected - 1)}
        >
          ← 이전 날
        </button>
        <span>
          {selected + 1} / {trip.days.length}
        </span>
        <button
          type="button"
          disabled={selected === trip.days.length - 1}
          aria-label="다음 날짜 일정 보기"
          onClick={() => onSelectDay(selected + 1)}
        >
          다음 날 →
        </button>
      </div>
    </section>
  );
}
