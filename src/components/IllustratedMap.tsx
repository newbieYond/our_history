import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import { assetUrl } from "../lib/assets";
import { useTrip } from "../lib/TripContext";
import { categoryLabel } from "../lib/places";
import {
  useMapZoom,
  MapZoomControls,
  revealMap,
  focusMarker,
} from "../lib/useMapZoom";
import { PlaceIcon } from "./PlaceIcon";
import { PlaceFeedback } from "./PlaceFeedback";
import type {
  Day,
  Place as StoredPlace,
  MapPlace as Place,
} from "../lib/types";
import "../themes/maps.css";
type IndexedPlace = Place & StoredPlace & { dayIndex: number };
type ReservePlace = IndexedPlace & { reserve: true };
type OverviewPlace = IndexedPlace | ReservePlace;
const normalizePlace = (place: StoredPlace): IndexedPlace => ({
  ...place,
  kind: place.category,
  note: place.description,
  x: place.mapPosition?.x ?? 50,
  y: place.mapPosition?.y ?? 50,
  rainy: place.isRainyDayFriendly,
  dayIndex: place.day - 1,
});
function useMapPlaces() {
  const trip = useTrip();
  const allPlaces = trip.places.filter((p) => !p.isReserve).map(normalizePlace);
  const reservePlaces: ReservePlace[] = trip.places
    .filter((p) => p.isReserve)
    .map((p) => ({ ...normalizePlace(p), reserve: true }));
  const googleMapsUrlForPlace = (name: string) =>
    trip.places.find((p) => p.name === name)?.googleMapsUrl ??
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + " " + trip.name)}`;
  return { trip, allPlaces, reservePlaces, googleMapsUrlForPlace };
}
function MapPlaceDetails({
  name,
  kind,
  label,
  note,
  href,
  visible,
  onVisibilityChange,
}: {
  name: string;
  kind: Place["kind"];
  label: string;
  note: string;
  href: string;
  visible: boolean;
  onVisibilityChange: (visible: boolean) => void;
}) {
  const toggleRef = useRef<HTMLButtonElement>(null);
  const toggle = () => {
    onVisibilityChange(!visible);
    requestAnimationFrame(() => toggleRef.current?.focus());
  };
  return visible ? (
    <div className="map-popover map-popover-detail" role="status">
      <div className="map-popover-heading">
        <span className={`place-kind kind-${kind}`}>{label}</span>
        <button
          ref={toggleRef}
          type="button"
          className="map-detail-hide"
          onClick={toggle}
          aria-label={`${name} 상세 숨기기`}
        >
          숨기기
        </button>
      </div>
      <strong>{name}</strong>
      <p>{note}</p>
      <PlaceFeedback name={name} />
      <a
        className="map-google-link"
        href={href}
        target="_blank"
        rel="noreferrer"
      >
        Google Maps 링크 ↗
      </a>
    </div>
  ) : (
    <button
      ref={toggleRef}
      type="button"
      className="map-detail-reopen"
      onClick={toggle}
      aria-label={`${name} 상세 보기`}
    >
      상세 보기 ↑
    </button>
  );
}

export function DayMap({
  day,
  dayIndex,
  selected,
  onSelect,
  mapRef,
  showReserves = true,
}: {
  day: Day;
  dayIndex: number;
  selected: Place;
  onSelect: (place: Place) => void;
  mapRef: RefObject<HTMLDivElement | null>;
  showReserves?: boolean;
}) {
  const { trip, allPlaces, reservePlaces, googleMapsUrlForPlace } =
    useMapPlaces();
  const isUdo = dayIndex + 1 === trip.map?.insetDay;
  const [showDetails, setShowDetails] = useState(true);
  const mapZoom = useMapZoom();
  const places: OverviewPlace[] = [
    ...allPlaces.filter((place) => place.days.includes(dayIndex + 1)),
    ...(showReserves
      ? reservePlaces.filter((place) => place.days.includes(dayIndex + 1))
      : []),
  ];
  const isReserve = (place: OverviewPlace): place is ReservePlace =>
    "reserve" in place;
  useEffect(() => {
    focusMarker(
      mapZoom.viewportRef.current,
      mapZoom.viewportRef.current?.querySelector<HTMLElement>(
        ".map-pin.active",
      ) ?? null,
    );
  }, [selected, mapZoom.zoom]);
  useEffect(() => {
    setShowDetails(true);
  }, [selected]);
  return (
    <div className="illustrated-map">
      <div className="map-card" aria-label={`${day.title} 약도`} ref={mapRef}>
        <div className="map-head">
          <div>
            <span className="map-kicker">TODAY&apos;S MAP</span>
            <strong>{day.date} 약도</strong>
          </div>
          <div className="map-legend">
            <span>● 장소</span>
            <span>● 맛</span>
          </div>
        </div>
        <div className="map-stage-shell">
          <div
            className={`map-stage ${isUdo ? "udo-map" : ""} ${mapZoom.zoom > 1 ? "zoomed" : ""}`}
            ref={mapZoom.viewportRef}
            onPointerDown={mapZoom.onPointerDown}
            onPointerMove={mapZoom.onPointerMove}
            onPointerUp={mapZoom.onPointerUp}
            onPointerCancel={mapZoom.onPointerCancel}
          >
            <div
              className="map-scroll-space"
              style={{
                width: `${mapZoom.zoom * 100}%`,
                height: `${mapZoom.zoom * 100}%`,
              }}
            >
              <div
                className="map-zoom-canvas"
                style={
                  {
                    width: `${100 / mapZoom.zoom}%`,
                    height: `${100 / mapZoom.zoom}%`,
                    transform: `scale(${mapZoom.zoom})`,
                    "--map-marker-scale": 1 / mapZoom.zoom,
                  } as CSSProperties
                }
              >
                <img
                  className="map-background"
                  draggable={false}
                  src={assetUrl(isUdo ? trip.map!.inset : trip.map!.mainland)}
                  alt=""
                  aria-hidden="true"
                  width={1536}
                  height={1024}
                  loading="lazy"
                  decoding="async"
                />
                {places.map((place, index) => (
                  <button
                    key={place.id}
                    className={`map-pin pin-${place.kind} ${isReserve(place) ? "reserve" : ""} ${selected.name === place.name ? "active" : ""}`}
                    style={{
                      left: `${place.x}%`,
                      top: `${place.y}%`,
                      animationDelay: `${index * 60}ms`,
                    }}
                    onClick={() => {
                      if (!mapZoom.consumeDrag()) {
                        onSelect(place);
                        setShowDetails(true);
                      }
                    }}
                    onDoubleClick={(event) => {
                      event.preventDefault();
                      window.open(
                        place.googleMapsUrl,
                        "_blank",
                        "noopener,noreferrer",
                      );
                    }}
                    aria-label={`${place.name} 정보 보기`}
                    aria-pressed={selected.name === place.name}
                  >
                    <span>
                      <PlaceIcon kind={place.kind} />
                    </span>
                    <em className="marker-name">{place.name}</em>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <MapPlaceDetails
            name={selected.name}
            kind={selected.kind}
            label={categoryLabel[selected.kind]}
            note={selected.note}
            href={googleMapsUrlForPlace(selected.name)}
            visible={showDetails}
            onVisibilityChange={setShowDetails}
          />
          <MapZoomControls zoom={mapZoom.zoom} onChange={mapZoom.changeZoom} />
        </div>
        <p className="map-caption">
          마커를 누르면 장소 정보가 보여요 · 링크로 Google Maps 장소 정보를 열
          수 있어요.
        </p>
      </div>
    </div>
  );
}

export function AllPlacesMap() {
  const { trip, allPlaces, reservePlaces } = useMapPlaces();
  const [selected, setSelected] = useState<OverviewPlace>(
    allPlaces[0] ?? reservePlaces[0],
  );
  const [showDetails, setShowDetails] = useState(true);
  const [showIndex, setShowIndex] = useState(false);
  const [visiblePlaceIds, setVisiblePlaceIds] = useState<number[]>(
    [...allPlaces, ...reservePlaces].map((place) => place.id),
  );
  const mapZoom = useMapZoom();
  const mainland: OverviewPlace[] = [...allPlaces, ...reservePlaces].filter(
    (place) => place.dayIndex !== (trip.map?.insetDay ?? 2) - 1,
  );
  const udo = [...allPlaces, ...reservePlaces].filter(
    (place) => place.dayIndex === (trip.map?.insetDay ?? 2) - 1,
  );
  const mapPlaces: OverviewPlace[] = [...allPlaces, ...reservePlaces];
  const visiblePlaces = mapPlaces.filter((place) =>
    visiblePlaceIds.includes(place.id),
  );
  const isReserve = (place: OverviewPlace): place is ReservePlace =>
    "reserve" in place;
  useEffect(() => {
    focusMarker(
      mapZoom.viewportRef.current,
      mapZoom.viewportRef.current?.querySelector<HTMLElement>(
        ".all-map-pin.active",
      ) ?? null,
    );
  }, [selected, mapZoom.zoom]);
  useEffect(() => {
    setShowDetails(true);
  }, [selected]);
  useEffect(() => {
    const viewport = mapZoom.viewportRef.current;
    if (!viewport) return;
    const updateVisiblePlaces = () => {
      const viewportRect = viewport.getBoundingClientRect();
      const next = [
        ...viewport.querySelectorAll<HTMLElement>("[data-place-id]"),
      ]
        .filter((marker) => {
          const rect = marker.getBoundingClientRect();
          return (
            rect.right >= viewportRect.left &&
            rect.left <= viewportRect.right &&
            rect.bottom >= viewportRect.top &&
            rect.top <= viewportRect.bottom
          );
        })
        .map((marker) => Number(marker.dataset.placeId));
      setVisiblePlaceIds((current) =>
        current.length === next.length &&
        current.every((id) => next.includes(id))
          ? current
          : next,
      );
    };
    updateVisiblePlaces();
    const observer = new ResizeObserver(updateVisiblePlaces);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [mapZoom.zoom, mapZoom.viewportVersion]);
  const selectAndReveal = (place: OverviewPlace) => {
    setSelected(place);
    setShowDetails(true);
    revealMap(mapZoom.viewportRef.current);
  };
  const pin = (place: OverviewPlace, compact = false) => {
    const position = !compact
      ? (trip.map?.insetSafePositions?.[place.name] ?? place)
      : place;
    return (
      <button
        key={`${isReserve(place) ? "reserve" : place.dayIndex}-${place.name}`}
        data-place-id={place.id}
        className={`map-pin all-map-pin pin-${place.kind} ${isReserve(place) ? "reserve" : ""} ${selected.id === place.id ? "active" : ""} ${compact ? "compact" : ""}`}
        style={{ left: `${position.x}%`, top: `${position.y}%` }}
        onFocus={() => {
          setSelected(place);
          setShowDetails(true);
        }}
        onClick={() => {
          if (!mapZoom.consumeDrag()) {
            setSelected(place);
            setShowDetails(true);
          }
        }}
        onDoubleClick={(event) => {
          event.preventDefault();
          window.open(place.googleMapsUrl, "_blank", "noopener,noreferrer");
        }}
        aria-label={`${place.name} 정보 보기`}
        aria-pressed={selected.id === place.id}
      >
        <span>
          <PlaceIcon kind={place.kind} />
        </span>
        <em className="marker-name">{place.name}</em>
      </button>
    );
  };
  return (
    <div className="illustrated-map">
      <section className="all-map-wrap">
        <div className="all-map-head">
          <div>
            <span>OUR PLACES AT A GLANCE</span>
            <h2>{visiblePlaces.length}개의 장소를 한 장에</h2>
          </div>
          <div className="all-map-actions">
            <div className="all-map-legend">
              <span>
                <i className="legend-spot" />
                가볼 곳
              </span>
              <span>
                <i className="legend-food" />
                먹을 곳
              </span>
              <span>
                <i className="legend-cafe" />
                카페
              </span>
              <span>
                <i className="legend-reserve" />
                예비
              </span>
            </div>
          </div>
        </div>
        <div className="map-stage-shell all-map-stage-shell">
          <div
            className={`map-stage all-map-stage ${mapZoom.zoom > 1 ? "zoomed" : ""}`}
            ref={mapZoom.viewportRef}
            onPointerDown={mapZoom.onPointerDown}
            onPointerMove={mapZoom.onPointerMove}
            onPointerUp={mapZoom.onPointerUp}
            onPointerCancel={mapZoom.onPointerCancel}
          >
            <div
              className="map-scroll-space"
              style={{
                width: `${mapZoom.zoom * 100}%`,
                height: `${mapZoom.zoom * 100}%`,
              }}
            >
              <div
                className="map-zoom-canvas"
                style={
                  {
                    width: `${100 / mapZoom.zoom}%`,
                    height: `${100 / mapZoom.zoom}%`,
                    transform: `scale(${mapZoom.zoom})`,
                    "--map-marker-scale": 1 / mapZoom.zoom,
                  } as CSSProperties
                }
              >
                <img
                  className="map-background"
                  draggable={false}
                  src={assetUrl(trip.map!.mainland)}
                  alt=""
                  aria-hidden="true"
                  width={1536}
                  height={1024}
                  loading="lazy"
                  decoding="async"
                />
                {mainland.map((place) => pin(place))}
                <div className="udo-inset">
                  <div className="udo-inset-title">
                    <strong>{trip.map?.insetLabel}</strong>
                    <span>확대 약도</span>
                  </div>
                  <img
                    src={assetUrl(trip.map!.inset)}
                    draggable={false}
                    alt=""
                    aria-hidden="true"
                    width={1536}
                    height={1024}
                    loading="lazy"
                    decoding="async"
                  />
                  {udo.map((place) => pin(place, true))}
                </div>
              </div>
            </div>
          </div>
          <MapPlaceDetails
            name={selected.name}
            kind={selected.kind}
            label={`${isReserve(selected) ? "예비 장소" : `DAY ${selected.dayIndex + 1}`} · ${categoryLabel[selected.kind]}`}
            note={selected.note}
            href={selected.googleMapsUrl}
            visible={showDetails}
            onVisibilityChange={setShowDetails}
          />
          <MapZoomControls zoom={mapZoom.zoom} onChange={mapZoom.changeZoom} />
        </div>
        <p className="map-caption">
          처음에는 전체 장소가 보여요 · 확대하거나 지도를 이동하면 현재 지도
          영역의 장소만 아래 목록에 표시돼요
        </p>
        <button
          className="index-toggle"
          type="button"
          aria-expanded={showIndex}
          aria-controls="all-place-index"
          onClick={() => setShowIndex((current) => !current)}
        >
          <span>현재 지도 영역 장소 {visiblePlaces.length}개</span>
          <b>{showIndex ? "접기 ↑" : "펼쳐보기 ↓"}</b>
        </button>
        <div
          id="all-place-index"
          className={`all-place-index ${showIndex ? "open" : ""}`}
        >
          {visiblePlaces.map((place) => (
            <article
              key={`${isReserve(place) ? "reserve" : place.dayIndex}-${place.name}`}
              className={`all-place-card ${isReserve(place) ? "reserve" : ""} ${selected.id === place.id ? "selected" : ""}`}
              role="button"
              tabIndex={0}
              onFocus={() => {
                setSelected(place);
                setShowDetails(true);
              }}
              onClick={() => selectAndReveal(place)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  selectAndReveal(place);
                }
              }}
            >
              <span className={`choice-icon kind-${place.kind}`}>
                <PlaceIcon kind={place.kind} />
              </span>
              <div>
                <small>
                  {isReserve(place) ? "예비" : `DAY ${place.dayIndex + 1}`} ·{" "}
                  {categoryLabel[place.kind]}{" "}
                  {place.rainy && (
                    <span className="rain-label" title="비 오는 날에도 좋아요">
                      ☂
                    </span>
                  )}
                </small>
                <strong>{place.name}</strong>
                <p>{place.note}</p>
              </div>
              <a
                className="external"
                href={place.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(event) => event.stopPropagation()}
                aria-label={`${place.name} Google Maps에서 보기`}
              >
                ↗
              </a>
              <PlaceFeedback name={place.name} />
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
