import { useCallback, useEffect, useState } from "react";
import { trips } from "./trips";
import { TripContext } from "./lib/TripContext";
import { parseRoute, routeHash } from "./lib/route";
import type { Place, Screen } from "./lib/types";
import { TravelLibrary } from "./components/TravelLibrary";
import { AppNav } from "./components/AppNav";
import { TripHome } from "./components/TripHome";
import { ItineraryScreen } from "./components/ItineraryScreen";
import { PhrasebookScreen } from "./components/PhrasebookScreen";
import { NotesScreen } from "./components/NotesScreen";
import { ShoppingScreen } from "./components/ShoppingScreen";
import { SavedPlacesScreen } from "./components/SavedPlacesScreen";
import { ChecklistScreen } from "./components/ChecklistScreen";
import { PlaceDetailModal } from "./components/PlaceDetailModal";
import "./themes/collection.css";
import "./themes/trips.css";
const getRoute = () =>
  parseRoute(
    window.location.hash,
    trips.map((trip) => trip.id),
  );
export default function App() {
  const [route, setRoute] = useState(getRoute);
  const [detailPlace, setDetailPlace] = useState<Place | null>(null);
  const closePlaceDetail = useCallback(() => setDetailPlace(null), []);
  useEffect(() => {
    const update = () => {
      setRoute(getRoute());
      setDetailPlace(null);
    };
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [route?.tripId, route?.screen]);
  const trip = trips.find((trip) => trip.id === route?.tripId);
  useEffect(() => {
    document.title = trip
      ? `${trip.name} · Our History`
      : "Our History · 우리의 여행";
  }, [trip]);
  if (!trip || !route) return <TravelLibrary />;
  const screen =
    (route.screen === "phrases" && !trip.phrasebook?.phrases.length) ||
    (route.screen === "shopping" && !trip.shopping.length) ||
    (route.screen === "checklist" && !trip.checklist.length)
      ? "home"
      : route.screen;
  const selected = Math.min(route.day, trip.days.length - 1);
  const navigate = (next: Screen, day = selected) => {
    window.location.hash = routeHash(trip.id, next, day);
  };
  return (
    <TripContext.Provider value={trip}>
      <div className={`app-shell theme-${trip.theme}`} key={trip.id}>
        <AppNav activeScreen={screen} onNavigate={navigate} />
        <main className="screen-content" key={screen}>
          {screen === "home" && (
            <TripHome onOpenDay={(day) => navigate("itinerary", day)} />
          )}
          {screen === "itinerary" && (
            <ItineraryScreen
              key={selected}
              selected={selected}
              onSelectDay={(day) => navigate("itinerary", day)}
              onOpenPlace={setDetailPlace}
            />
          )}
          {screen === "phrases" && <PhrasebookScreen />}
          {screen === "notes" && <NotesScreen />}
          {screen === "shopping" && <ShoppingScreen />}
          {screen === "saved" && (
            <SavedPlacesScreen onOpenPlace={setDetailPlace} />
          )}
          {screen === "checklist" && <ChecklistScreen />}
        </main>
        {detailPlace && (
          <PlaceDetailModal place={detailPlace} onClose={closePlaceDetail} />
        )}
        <footer>
          <span>SEONGHO & SEIN'S TRAVEL NOTE</span>
          <span>
            {trip.englishName.toUpperCase()} · {trip.startDate.slice(0, 4)}
          </span>
        </footer>
      </div>
    </TripContext.Provider>
  );
}
