import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
export const revealMap = (target: HTMLElement | null) =>
  requestAnimationFrame(() =>
    target?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "center",
    }),
  );
export const focusMarker = (
  viewport: HTMLDivElement | null,
  marker: HTMLElement | null,
) =>
  requestAnimationFrame(() => {
    if (!viewport || !marker) return;
    const viewportRect = viewport.getBoundingClientRect();
    const markerRect = marker.getBoundingClientRect();
    viewport.scrollTo({
      left:
        viewport.scrollLeft +
        markerRect.left -
        viewportRect.left +
        markerRect.width / 2 -
        viewport.clientWidth / 2,
      top:
        viewport.scrollTop +
        markerRect.top -
        viewportRect.top +
        markerRect.height / 2 -
        viewport.clientHeight / 2,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  });

export function useMapZoom() {
  const [zoom, setZoom] = useState(1);
  const [viewportVersion, setViewportVersion] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({
    active: false,
    moved: false,
    x: 0,
    y: 0,
    left: 0,
    top: 0,
  });
  const changeZoom = (next: number) => {
    const target = Math.max(1, Math.min(3, next));
    const viewport = viewportRef.current;
    const centerX = viewport
      ? (viewport.scrollLeft + viewport.clientWidth / 2) / viewport.scrollWidth
      : 0.5;
    const centerY = viewport
      ? (viewport.scrollTop + viewport.clientHeight / 2) / viewport.scrollHeight
      : 0.5;
    setZoom(target);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const current = viewportRef.current;
        if (!current) return;
        current.scrollLeft =
          centerX * current.scrollWidth - current.clientWidth / 2;
        current.scrollTop =
          centerY * current.scrollHeight - current.clientHeight / 2;
      }),
    );
  };
  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (zoom === 1 || event.button !== 0) return;
    const viewport = viewportRef.current;
    if (!viewport) return;
    dragRef.current = {
      active: true,
      moved: false,
      x: event.clientX,
      y: event.clientY,
      left: viewport.scrollLeft,
      top: viewport.scrollTop,
    };
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    const drag = dragRef.current;
    if (!viewport || !drag.active) return;
    const deltaX = event.clientX - drag.x;
    const deltaY = event.clientY - drag.y;
    if (!drag.moved && Math.hypot(deltaX, deltaY) < 8) return;
    if (!drag.moved) event.currentTarget.setPointerCapture(event.pointerId);
    drag.moved = true;
    viewport.scrollLeft = drag.left - deltaX;
    viewport.scrollTop = drag.top - deltaY;
  };
  const stopDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const moved = dragRef.current.moved;
    dragRef.current.active = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    if (moved)
      window.setTimeout(() => {
        dragRef.current.moved = false;
      }, 0);
  };
  const consumeDrag = () => {
    const moved = dragRef.current.moved;
    dragRef.current.moved = false;
    return moved;
  };
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || zoom === 1) return;
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;
      event.preventDefault();
      event.stopPropagation();
      viewport.scrollBy({
        left: event.deltaX + (event.shiftKey ? event.deltaY : 0),
        top: event.shiftKey ? 0 : event.deltaY,
      });
    };
    viewport.addEventListener("wheel", onWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", onWheel);
  }, [zoom]);
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const updateViewport = () => setViewportVersion((version) => version + 1);
    viewport.addEventListener("scroll", updateViewport, { passive: true });
    return () => viewport.removeEventListener("scroll", updateViewport);
  }, []);
  return {
    zoom,
    viewportRef,
    viewportVersion,
    changeZoom,
    onPointerDown,
    onPointerMove,
    onPointerUp: stopDrag,
    onPointerCancel: stopDrag,
    consumeDrag,
  };
}

export function MapZoomControls({
  zoom,
  onChange,
}: {
  zoom: number;
  onChange: (zoom: number) => void;
}) {
  return (
    <div className="map-zoom-controls" aria-label="지도 확대 및 축소">
      <button
        type="button"
        onClick={() => onChange(zoom - 0.5)}
        disabled={zoom <= 1}
        aria-label="지도 축소"
      >
        −
      </button>
      <button
        type="button"
        className="zoom-value"
        onClick={() => onChange(1)}
        disabled={zoom === 1}
        aria-label={`현재 ${Math.round(zoom * 100)}%, 원래 크기로`}
      >
        {Math.round(zoom * 100)}%
      </button>
      <button
        type="button"
        onClick={() => onChange(zoom + 0.5)}
        disabled={zoom >= 3}
        aria-label="지도 확대"
      >
        +
      </button>
    </div>
  );
}
