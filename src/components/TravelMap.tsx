import { useEffect, useRef, useState } from "react";
import type * as Leaflet from "leaflet";
import { useTrip } from "../lib/TripContext";
import { loadMapEngine } from "../lib/mapEngine";
import { hasCoordinates } from "../lib/geo";
import { categoryIcon, categoryLabel } from "../lib/places";
import type { Place } from "../lib/types";
import { PlaceFeedback } from "./PlaceFeedback";
import "../themes/geo-map.css";
export function TravelMap({
  places,
  title,
  selectedId,
  onSelect,
  onOpenPlace,
}: {
  places: Place[];
  title: string;
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  onOpenPlace: (place: Place) => void;
}) {
  const trip = useTrip();
  const container = useRef<HTMLDivElement>(null);
  const runtime = useRef<{
    L: typeof Leaflet;
    map: Leaflet.Map;
    group: Leaflet.MarkerClusterGroup;
    markers: Map<number, Leaflet.Marker>;
    locationLayer?: Leaflet.LayerGroup;
  } | null>(null);
  const selectedRef = useRef(selectedId);
  selectedRef.current = selectedId;
  const selectRef = useRef(onSelect);
  selectRef.current = onSelect;
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [tileError, setTileError] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState("");
  const located = places.filter(hasCoordinates);
  const scope = located
    .map((p) => `${p.id}:${p.latitude}:${p.longitude}`)
    .join("|");
  const visibleRef = useRef(located);
  visibleRef.current = located;
  const selected = places.find((p) => p.id === selectedId);
  const fit = () => {
    const rt = runtime.current;
    if (!rt) return;
    const points = visibleRef.current.map(
      (p) => [p.latitude, p.longitude] as [number, number],
    );
    if (points.length)
      rt.map.fitBounds(rt.L.latLngBounds(points), {
        padding: [36, 36],
        maxZoom: 15,
        animate: false,
      });
    else
      rt.map.setView(trip.geoMap!.center, trip.geoMap!.zoom, {
        animate: false,
      });
  };
  const locate = () => {
    const rt = runtime.current;
    if (!rt || locating) return;
    if (!window.isSecureContext || !navigator.geolocation) {
      setLocationStatus(
        "이 브라우저에서는 위치를 사용할 수 없어요. HTTPS 페이지를 지원하는 브라우저에서 열어 주세요.",
      );
      return;
    }
    setLocating(true);
    setLocationStatus("현재 위치를 찾고 있어요. 위치 권한을 허용해 주세요.");
    const fail = (message: string) => {
      if (runtime.current !== rt) return;
      setLocating(false);
      setLocationStatus(message);
    };
    try {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          if (runtime.current !== rt) return;
          const point: [number, number] = [coords.latitude, coords.longitude];
          rt.locationLayer?.remove();
          const accuracy = rt.L.circle(point, {
            radius: coords.accuracy,
            color: "#2b75d9",
            weight: 1,
            fillColor: "#2b75d9",
            fillOpacity: 0.12,
            interactive: false,
            className: "travel-location-accuracy",
          });
          const marker = rt.L.circleMarker(point, {
            pane: "currentLocation",
            radius: 8,
            color: "#fff",
            weight: 3,
            fillColor: "#2b75d9",
            fillOpacity: 1,
            interactive: false,
            className: "travel-location-marker",
          }).bindTooltip("내 위치", {
            permanent: true,
            direction: "top",
            offset: [0, -12],
          });
          rt.locationLayer = rt.L.layerGroup([accuracy, marker]).addTo(rt.map);
          rt.map.setView(point, Math.max(rt.map.getZoom(), 16), {
            animate: false,
          });
          setLocating(false);
          setLocationStatus(
            `내 위치를 표시했어요 · 정확도 약 ${Math.ceil(coords.accuracy).toLocaleString("ko-KR")}m · 다시 누르면 갱신돼요.`,
          );
        },
        (error) => {
          fail(
            error.code === 1
              ? "위치 권한이 꺼져 있어요. 브라우저의 사이트 설정에서 위치를 허용한 뒤 다시 눌러 주세요."
              : error.code === 3
                ? "위치를 찾는 데 시간이 오래 걸려요. 잠시 후 다시 눌러 주세요."
                : "현재 위치를 확인하지 못했어요. 기기의 위치 서비스를 켠 뒤 다시 눌러 주세요.",
          );
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
      );
    } catch {
      fail(
        "현재 위치를 확인하지 못했어요. 브라우저의 위치 설정을 확인한 뒤 다시 눌러 주세요.",
      );
    }
  };
  useEffect(() => {
    let disposed = false;
    let observer: ResizeObserver | undefined;
    loadMapEngine()
      .then((L) => {
        if (disposed || !container.current) return;
        const map = L.map(container.current, {
          zoomControl: false,
          scrollWheelZoom: true,
          touchZoom: true,
        }).setView(trip.geoMap!.center, trip.geoMap!.zoom);
        const locationPane = map.createPane("currentLocation");
        locationPane.style.zIndex = "625";
        locationPane.style.pointerEvents = "none";
        L.control
          .zoom({
            position: "topright",
            zoomInTitle: "지도 확대",
            zoomOutTitle: "지도 축소",
          })
          .addTo(map);
        L.control.scale({ imperial: false }).addTo(map);
        map.attributionControl.setPrefix(
          '<a href="https://leafletjs.com/" target="_blank" rel="noreferrer">Leaflet</a>',
        );
        const tiles = L.tileLayer(
          "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
            maxZoom: 19,
          },
        ).addTo(map);
        tiles.on("tileerror", () => setTileError(true));
        const group = L.markerClusterGroup({
          showCoverageOnHover: false,
          maxClusterRadius: 46,
          spiderfyOnMaxZoom: true,
          animate: false,
          iconCreateFunction: (cluster) =>
            L.divIcon({
              className: "travel-cluster",
              html: `<span>${cluster.getChildCount()}</span>`,
              iconSize: [44, 44],
            }),
        });
        group.on("layeradd", (e) => {
          const marker = (e as Leaflet.LayerEvent).layer as Leaflet.Marker;
          const el = marker.getElement?.();
          if (el && "getChildCount" in marker)
            el.setAttribute(
              "aria-label",
              `${(marker as Leaflet.MarkerCluster).getChildCount()}개 장소 확대`,
            );
        });
        map.addLayer(group);
        runtime.current = { L, map, group, markers: new Map() };
        observer = new ResizeObserver(() => map.invalidateSize({ pan: false }));
        observer.observe(container.current);
        setReady(true);
      })
      .catch(() => {
        if (!disposed) setFailed(true);
      });
    return () => {
      disposed = true;
      observer?.disconnect();
      runtime.current?.map.remove();
      runtime.current = null;
    };
  }, [trip.id]);
  useEffect(() => {
    const rt = runtime.current;
    if (!ready || !rt) return;
    rt.group.clearLayers();
    rt.markers.clear();
    for (const p of visibleRef.current) {
      const marker = rt.L.marker([p.latitude, p.longitude], {
        title: `${p.name} 지도에서 선택`,
        alt: `${p.name} 지도에서 선택`,
        icon: rt.L.divIcon({
          className: `travel-pin pin-${p.category}`,
          html: `<span>${categoryIcon[p.category]}</span>`,
          iconSize: [36, 40],
          iconAnchor: [18, 36],
        }),
      });
      const label = document.createElement("span");
      label.textContent = p.name;
      marker.bindTooltip(label, { direction: "top", offset: [0, -30] });
      marker.on("click", () => selectRef.current(p.id));
      marker.on("add", () => {
        const el = marker.getElement();
        el?.setAttribute("aria-label", `${p.name} 지도에서 선택`);
        el?.setAttribute("aria-pressed", String(selectedRef.current === p.id));
        el?.classList.toggle("is-selected", selectedRef.current === p.id);
      });
      rt.markers.set(p.id, marker);
      rt.group.addLayer(marker);
    }
    fit();
  }, [ready, scope]);
  useEffect(() => {
    const rt = runtime.current;
    if (!ready || !rt) return;
    for (const [id, marker] of rt.markers) {
      const el = marker.getElement();
      el?.classList.toggle("is-selected", id === selectedId);
      el?.setAttribute("aria-pressed", String(id === selectedId));
    }
    const marker = selectedId === null ? undefined : rt.markers.get(selectedId);
    if (marker) {
      // 접힌 지도를 펼친 직후에도 현재 크기로 선택 장소를 찾아갑니다.
      rt.map.invalidateSize({ pan: false });
      rt.group.zoomToShowLayer(marker, () => {
        if (
          runtime.current !== rt ||
          selectedRef.current !== selectedId ||
          rt.markers.get(selectedId!) !== marker
        )
          return;
        marker.getElement()?.classList.add("is-selected");
        marker.getElement()?.setAttribute("aria-pressed", "true");
        rt.map.panInside(marker.getLatLng(), { padding: [30, 30] });
      });
    }
  }, [ready, selectedId, scope]);
  return (
    <section className="travel-map" aria-label={title}>
      <div className="travel-map-heading">
        <div>
          <p className="section-label">EXPLORE THE PLACES</p>
          <h3>{title}</h3>
        </div>
        <div className="travel-map-actions">
          <button
            type="button"
            onClick={locate}
            disabled={!ready || locating}
            aria-label="현재 내 위치 표시"
            aria-busy={locating}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              aria-hidden="true"
              focusable="false"
            >
              <circle cx="12" cy="12" r="7" />
              <circle cx="12" cy="12" r="2" />
              <path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
            </svg>
            {locating ? "찾는 중…" : "내 위치"}
          </button>
          <button
            type="button"
            onClick={fit}
            disabled={!ready}
            aria-label="필터에 맞는 장소 전체 보기"
          >
            전체 보기 ↗
          </button>
        </div>
      </div>
      <p className="travel-map-help">
        드래그로 이동 · 휠 / 두 손가락으로 확대 · 숫자를 누르면 장소가 펼쳐져요
        <br />내 위치는 버튼을 누르고 위치 권한을 허용하면 표시돼요.
      </p>
      <p className="travel-location-status" role="status">
        {locationStatus}
      </p>
      <div
        className="travel-map-canvas"
        ref={container}
        role="region"
        aria-label={`${title}, 방향키로 이동하고 더하기·빼기로 확대할 수 있습니다`}
      />
      {!ready && (
        <p role="status">
          {failed
            ? "지도를 불러오지 못했어요. 아래 장소 목록을 이용해 주세요."
            : "지도를 준비하고 있어요…"}
        </p>
      )}
      {tileError && (
        <p className="travel-map-notice" role="status">
          배경 지도를 일부 불러오지 못했어요. 장소 선택과 Google 지도 링크는
          사용할 수 있어요.
        </p>
      )}
      <p className="travel-map-count" aria-live="polite">
        지도에 {located.length}곳 표시
        {located.length < places.length
          ? ` · 위치 미등록 ${places.length - located.length}곳`
          : ""}{" "}
        · 지도를 이동해도 목록은 유지돼요
      </p>
      {selected ? (
        <article className="travel-map-selection">
          <div className="travel-selection-heading">
            <div>
              <p>
                {categoryIcon[selected.category]}{" "}
                {selected.mapRegion ?? selected.area} ·{" "}
                {categoryLabel[selected.category]}
                {selected.isReserve ? " · 예비" : ""}
              </p>
              <h4>{selected.name}</h4>
            </div>
            <button
              type="button"
              onClick={() => onSelect(null)}
              aria-label="지도 장소 선택 해제"
            >
              닫기 ×
            </button>
          </div>
          {selected.coordinateNote && (
            <p className="travel-map-notice">{selected.coordinateNote}</p>
          )}
          <p>{selected.description}</p>
          <PlaceFeedback name={selected.name} />
          <div className="travel-selection-actions">
            <button
              type="button"
              onClick={() => onOpenPlace(selected)}
              aria-label={`${selected.name} 상세 보기`}
            >
              상세 보기
            </button>
            <a href={selected.googleMapsUrl} target="_blank" rel="noreferrer">
              Google 지도에서 길 찾기 ↗
            </a>
          </div>
        </article>
      ) : (
        <p className="travel-map-placeholder">
          지도에서 장소를 선택하면 이곳에 메모와 평가가 표시돼요.
        </p>
      )}
    </section>
  );
}
