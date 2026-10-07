import { useEffect, useRef, useState } from "react";
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
  const linksRef = useRef<HTMLDivElement>(null);
  const [scroll, setScroll] = useState({ previous: false, next: false });
  useEffect(() => {
    const links = linksRef.current;
    if (!links) return;
    const update = () =>
      setScroll({
        previous: links.scrollLeft > 1,
        next: links.scrollLeft + links.clientWidth < links.scrollWidth - 1,
      });
    const active = links.querySelector<HTMLButtonElement>(
      '[aria-current="page"]',
    );
    const reveal = () => {
      if (!active) return;
      links.scrollLeft =
        active.offsetLeft - (links.clientWidth - active.offsetWidth) / 2;
    };
    reveal();
    update();
    const observer = new ResizeObserver(() => {
      reveal();
      update();
    });
    observer.observe(links);
    links.addEventListener("scroll", update);
    return () => {
      observer.disconnect();
      links.removeEventListener("scroll", update);
    };
  }, [activeScreen, trip.id]);
  const scrollMenu = (direction: number) => {
    linksRef.current?.scrollBy({
      left: direction * linksRef.current.clientWidth * 0.75,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  };
  const tabs = appTabs.filter(
    ([id]) =>
      (id !== "phrases" || !!trip.phrasebook?.phrases.length) &&
      (id !== "shopping" || trip.shopping.length > 0) &&
      (id !== "checklist" || trip.checklist.length > 0),
  );
  return (
    <nav className="app-nav" aria-label="여행 가이드 메뉴">
      <a className="brand" href="#/" aria-label="전체 여행으로 돌아가기">
        OUR HISTORY <i>↗</i>
      </a>
      <div className="nav-menu">
        <button
          className="nav-scroll nav-scroll-previous"
          type="button"
          aria-label="앞쪽 메뉴 보기"
          onClick={() => scrollMenu(-1)}
          disabled={!scroll.previous}
          hidden={!scroll.previous && !scroll.next}
        >
          ‹
        </button>
        <div className="navlinks" ref={linksRef}>
          {tabs.map(([id, label]) => (
            <button
              type="button"
              key={id}
              className={activeScreen === id ? "active" : ""}
              aria-current={activeScreen === id ? "page" : undefined}
              aria-label={`${trip.name} ${id === "phrases" ? `${trip.phrasebook?.language} 회화` : label} 보기`}
              onClick={() => onNavigate(id)}
            >
              {id === "phrases" ? `${trip.phrasebook?.language} 회화` : label}
            </button>
          ))}
        </div>
        <button
          className="nav-scroll nav-scroll-next"
          type="button"
          aria-label="뒤쪽 메뉴 보기"
          onClick={() => scrollMenu(1)}
          disabled={!scroll.next}
          hidden={!scroll.previous && !scroll.next}
        >
          ›
        </button>
      </div>
      <span className="navdate">{trip.englishName.toUpperCase()}</span>
    </nav>
  );
}
