import { useTrip } from "../lib/TripContext";
import { appTabs, type Screen } from "../lib/types";
export function AppNav({
  activeScreen,
  onNavigate,
}: {
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
}) {
  const trip = useTrip();
  const tabs = appTabs.filter(
    ([id]) =>
      (id !== "shopping" || trip.shopping.length > 0) &&
      (id !== "checklist" || trip.checklist.length > 0),
  );
  return (
    <nav className="app-nav" aria-label="여행 가이드 메뉴">
      <a className="brand" href="#/" aria-label="전체 여행으로 돌아가기">
        OUR HISTORY <i>↗</i>
      </a>
      <div className="navlinks">
        {tabs.map(([id, label]) => (
          <button
            type="button"
            key={id}
            className={activeScreen === id ? "active" : ""}
            aria-current={activeScreen === id ? "page" : undefined}
            aria-label={`${trip.name} ${label} 보기`}
            onClick={() => onNavigate(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <span className="navdate">{trip.englishName.toUpperCase()}</span>
    </nav>
  );
}
