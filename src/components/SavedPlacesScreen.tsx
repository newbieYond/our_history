import { useState } from "react";
import { useTrip } from "../lib/TripContext";
import { categoryIcon, categoryLabel, ratingDetails } from "../lib/places";
import { TravelMap } from "./TravelMap";
import { filterPlaces } from "../lib/geo";
import { FilterTags } from "./FilterTags";
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
  const areas = [
    "전체",
    ...(trip.geoMap?.regions ?? [...new Set(trip.places.map((p) => p.area))]),
  ];
  const places = filterPlaces(trip.places, area, category, query);
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
          <TravelMap
            places={places}
            title={area === "전체" ? `${trip.name} 전체 지도` : `${area} 지도`}
            selectedId={mapSelection}
            onSelect={setMapSelection}
            onOpenPlace={onOpenPlace}
          />
        )}
        <p aria-live="polite">{places.length}개의 장소</p>
        <div className="places-grid">
          {places.map((place) => {
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
                <div>
                  {trip.geoMap && (
                    <button
                      type="button"
                      aria-label={`${place.name} 지도에서 보기`}
                      onClick={() => {
                        setMapSelection(place.id);
                        document
                          .querySelector(".travel-map")
                          ?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                      }}
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
        {places.length === 0 && (
          <p className="empty-state">
            조건에 맞는 장소가 없어요. 검색어나 필터를 바꿔 보세요.
          </p>
        )}
      </section>
    </>
  );
}
