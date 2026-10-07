import { useRef, useState, type CSSProperties } from "react";
import { useTrip } from "../lib/TripContext";
import { categoryIcon, categoryLabel } from "../lib/places";
import { revealMap } from "../lib/useMapZoom";
import { DayMap } from "./IllustratedMap";
import type { MapPlace, Place } from "../lib/types";
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
  const [showMaybe, setShowMaybe] = useState(true);
  const [mapSelection, setMapSelection] = useState<MapPlace | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const selectedPlace = mapSelection ?? day.places?.[0];
  const dayPlaces = trip.places.filter(
    (p) => p.days.includes(selected + 1) && (showMaybe || !p.isReserve),
  );
  const selectSchedule = (name?: string) => {
    const place = trip.places.find((p) => p.name === name);
    if (place?.mapPosition)
      setMapSelection({
        name: place.name,
        kind: place.category,
        note: place.description,
        ...place.mapPosition,
      });
    revealMap(mapRef.current);
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
        <button
          type="button"
          className="toggle-button"
          role="switch"
          aria-checked={showMaybe}
          aria-label="예비 계획과 장소 표시"
          onClick={() => {
            setShowMaybe((v) => !v);
            setMapSelection(null);
          }}
        >
          <span aria-hidden="true">
            <i />
          </span>
          예비 계획도 보기
        </button>
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
      <div className={trip.map ? "itinerary-detail-grid" : ""}>
        {trip.map && selectedPlace && (
          <DayMap
            key={selected}
            day={day}
            dayIndex={selected}
            selected={selectedPlace}
            onSelect={setMapSelection}
            mapRef={mapRef}
            showReserves={showMaybe}
          />
        )}
        <div>
          {day.schedule && (
            <section className="schedule-panel">
              <h3>추천 흐름</h3>
              {day.schedule.map((item, index) => (
                <article
                  key={`${index}-${item.title}`}
                  role={trip.map ? "button" : undefined}
                  tabIndex={trip.map ? 0 : undefined}
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
              aria-label={`${place.name} 상세 보기`}
              onClick={() => onOpenPlace(place)}
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
