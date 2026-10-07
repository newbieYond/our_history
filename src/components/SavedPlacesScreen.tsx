import { useId, useRef, useState } from "react";
import { useTrip } from "../lib/TripContext";
import { categoryIcon, categoryLabel, ratingDetails } from "../lib/places";
import { TravelMap } from "./TravelMap";
import { filterPlaces } from "../lib/geo";
import { FilterTags } from "./FilterTags";
import { useProgressiveList } from "../lib/useProgressiveList";
import { ListExpansion } from "./ListExpansion";
import type { Place } from "../lib/types";
export function SavedPlacesScreen({
  onOpenPlace,
}: {
  onOpenPlace: (place: Place) => void;
}) {
  const trip = useTrip();
  const [area, setArea] = useState("전체");
  const [category, setCategory] = useState("전체");
  const [query, setQuery] = useState("");
  const [mapSelection, setMapSelection] = useState<number | null>(null);
  const [mapOpen, setMapOpen] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const mapId = useId();
  const openMap = (id?: number) => {
    setMapOpen(true);
    if (id !== undefined) setMapSelection(id);
    requestAnimationFrame(() =>
      mapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  };
  const areas = [
    "전체",
    ...(trip.geoMap?.regions ?? [...new Set(trip.places.map((p) => p.area))]),
  ];
  const places = filterPlaces(trip.places, area, category, query);
  const { visibleItems, showMore, showAll } = useProgressiveList(
    places,
    `${area}|${category}|${query}`,
  );
  return (
    <>
      <section className="places-heading">
        <p className="section-label">SAVED ON MAPS</p>
        <h2>
          {trip.name}에서 만날
          <br />
          <em>{trip.places.length}개의 장소.</em>
        </h2>
        <p>{trip.verification}</p>
      </section>
      <section className="places-browser">
        <div className="place-filters">
          <label>
            장소 검색
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setMapSelection(null);
              }}
              placeholder="이름이나 메모로 찾기"
            />
          </label>
          <FilterTags
            label="권역"
            options={areas.map((value) => ({ value, label: value }))}
            selected={area}
            onChange={(value) => {
              setArea(value);
              setMapSelection(null);
            }}
          />
          <FilterTags
            label="종류"
            options={[
              { value: "전체", label: "전체" },
              ...Object.entries(categoryLabel).map(([value, label]) => ({
                value,
                label,
              })),
            ]}
            selected={category}
            onChange={(value) => {
              setCategory(value);
              setMapSelection(null);
            }}
          />
        </div>
        {trip.geoMap && (
          <div className="saved-map-panel" ref={mapRef}>
            <div className="saved-map-tools">
              <button
                type="button"
                aria-expanded={mapOpen}
                aria-controls={mapId}
                onClick={() => setMapOpen(!mapOpen)}
              >
                {mapOpen ? "지도 접기 ↑" : "지도 펼치기 ↓"}
              </button>
              <button
                type="button"
                onClick={() =>
                  listRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  })
                }
              >
                장소 목록으로 ↓
              </button>
            </div>
            <div id={mapId} hidden={!mapOpen}>
              <TravelMap
                places={places}
                title={
                  area === "전체" ? `${trip.name} 전체 지도` : `${area} 지도`
                }
                selectedId={mapSelection}
                onSelect={setMapSelection}
                onOpenPlace={onOpenPlace}
              />
            </div>
          </div>
        )}
        <div className="place-results" ref={listRef}>
          <p aria-live="polite">{places.length}개의 장소</p>
          {trip.geoMap && (
            <button type="button" onClick={() => openMap()}>
              지도 보기 ↑
            </button>
          )}
        </div>
        <div className="places-grid">
          {visibleItems.map((place) => {
            const rating = ratingDetails(place);
            return (
              <article className="place-browser-card" key={place.id}>
                <p>
                  {categoryIcon[place.category]} {place.mapRegion ?? place.area}{" "}
                  · {categoryLabel[place.category]}
                  {place.isReserve ? " · 예비" : ""}
                </p>
                <h3>{place.name}</h3>
                <span className="place-rating" aria-label={rating.ariaLabel}>
                  {rating.value === null ? "☆" : "★"} {rating.label}
                </span>
                <p className="browser-opinion">
                  {place.seonghoOpinion || place.description}
                </p>
                <div className="place-browser-actions">
                  {trip.geoMap && (
                    <button
                      type="button"
                      aria-label={`${place.name} 지도에서 보기`}
                      onClick={() => openMap(place.id)}
                    >
                      지도에서 보기
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label={`${place.name} 상세 보기`}
                    onClick={() => onOpenPlace(place)}
                  >
                    상세 보기
                  </button>
                  <a
                    href={place.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${place.name} Google 지도에서 보기`}
                  >
                    Google 지도 ↗
                  </a>
                </div>
              </article>
            );
          })}
        </div>
        <ListExpansion
          noun="장소"
          shown={visibleItems.length}
          total={places.length}
          onMore={showMore}
          onAll={showAll}
        />
        {places.length === 0 && (
          <p className="empty-state">
            조건에 맞는 장소가 없어요. 검색어나 필터를 바꿔 보세요.
          </p>
        )}
      </section>
    </>
  );
}
