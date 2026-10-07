import { useEffect, useRef } from "react";
import { categoryLabel, opinionRating, ratingDetails } from "../lib/places";

import type { Place } from "../lib/types";
import { useTrip } from "../lib/TripContext";
import { assetUrl } from "../lib/assets";

type PlaceDetailModalProps = {
  place: Place;
  onClose: () => void;
};

export function PlaceDetailModal({ place, onClose }: PlaceDetailModalProps) {
  const modalRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const trip = useTrip();
  const rating = ratingDetails(place);
  const imageUrl = place.imagePath ? assetUrl(place.imagePath) : null;

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !modalRef.current) return;
      const focusableElements = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])",
        ),
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [onClose]);

  return (
    <div
      className="place-detail-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={modalRef}
        className="place-detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="place-detail-title"
        aria-describedby="place-detail-summary"
      >
        <button
          ref={closeButtonRef}
          type="button"
          className="place-detail-close"
          aria-label="상세 팝업 닫기"
          onClick={onClose}
        >
          ×
        </button>
        <p className="section-label">PLACE NOTE</p>
        <div className="place-detail-heading">
          <div>
            <h2 id="place-detail-title">{place.name}</h2>
            <p>
              {place.isSelected
                ? `일정 추가 · ${categoryLabel[place.category]}`
                : categoryLabel[place.category]}
            </p>
          </div>
          <span className="place-detail-rating" aria-label={rating.ariaLabel}>
            {rating.value === null ? "☆" : "★"}
            <small>
              {rating.label}
              {rating.value === null ? "" : " / 5.0"}
            </small>
          </span>
        </div>
        <div className={`place-image-frame${imageUrl ? "" : " has-no-image"}`}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`${place.name} 대표 여행 이미지`}
              width="1200"
              height="600"
            />
          ) : (
            <div className="place-image-empty">
              <span>PLACE IMAGE</span>
              <strong>대표 이미지 준비 중</strong>
              <p>
                이 장소를 떠올릴 수 있는 한 장의 이미지를 추가할 예정입니다.
              </p>
            </div>
          )}
        </div>
        <article className="place-summary">
          <h3>후기 종합</h3>
          <p id="place-detail-summary">{place.reviewSummary}</p>
        </article>
        <article className="place-itinerary">
          <h3>우리 일정에서</h3>
          <p>
            {place.days.length
              ? place.days
                  .map(
                    (number) =>
                      `DAY ${number} · ${trip.days[number - 1]?.title ?? ""}`,
                  )
                  .join(" / ")
              : "일정 주변 예비 후보"}{" "}
            ·{" "}
            {place.isReserve
              ? "시간과 컨디션에 맞춰 고를 예비 장소입니다."
              : "현재 여행 일정에 포함된 장소입니다."}
          </p>
        </article>
        <article className="place-opinions">
          <div>
            <section>
              <strong>
                <span>성호의견</span>
                <em>{opinionRating(place.seonghoRating)}</em>
              </strong>
              <p>{place.seonghoOpinion}</p>
            </section>
            <section>
              <strong>
                <span>세인의 의견</span>
                <em>{opinionRating(place.seinRating)}</em>
              </strong>
              <p>{place.seinOpinion}</p>
            </section>
          </div>
        </article>
        <a href={place.googleMapsUrl} target="_blank" rel="noreferrer">
          Google 지도에서 보기 ↗
        </a>
      </section>
    </div>
  );
}
