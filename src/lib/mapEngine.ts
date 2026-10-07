import type * as Leaflet from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
let engine: Promise<typeof Leaflet> | undefined;
export function loadMapEngine() {
  return (engine ??= (async () => {
    // Markercluster extends a mutable global namespace; ES module exports are read-only.
    const L = { ...(await import("leaflet")) };
    (window as unknown as { L: typeof Leaflet }).L = L;
    await import("leaflet.markercluster");
    return L;
  })());
}
