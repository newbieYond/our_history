import { useTrip } from "../lib/TripContext";
import { assetUrl } from "../lib/assets";
export function TripHome({
  onOpenDay,
}: {
  onOpenDay: (index: number) => void;
}) {
  const trip = useTrip();
  return (
    <>
      <section className="hero trip-hero">
        <div className="hero-copy">
          <p className="eyebrow">{trip.eyebrow}</p>
          <h1>
            {trip.headline}
            <br />
            <em>{trip.englishName}.</em>
          </h1>
          <p className="trip-description">{trip.description}</p>
          <div className="hero-bottom">
            <p>
              {trip.startDate.replaceAll("-", ". ")} —{" "}
              {trip.endDate.replaceAll("-", ". ")}
              <br />
              SEONGHO & SEIN · {trip.days.length} DAYS
            </p>
            <button
              className="hero-cta"
              aria-label={`${trip.name} 첫날 일정 보기`}
              onClick={() => onOpenDay(0)}
            >
              여행 살펴보기 <span aria-hidden="true">↓</span>
            </button>
          </div>
        </div>
        <img
          className="trip-cover"
          src={assetUrl(trip.cover)}
          alt={trip.coverAlt}
        />
      </section>
      {trip.highlights && (
        <section className="trip-highlights" aria-label="여행 핵심 정보">
          {trip.highlights.map((item) => (
            <article key={item.label}>
              <small>{item.label}</small>
              <strong>{item.value}</strong>
            </article>
          ))}
        </section>
      )}
      <section className="trip-overview">
        <p className="section-label">DAY BY DAY</p>
        <h2>{trip.days.length}일의 작은 이야기.</h2>
        <div className="overview-grid">
          {trip.days.map((day, index) => (
            <button
              className="overview-card"
              aria-label={`${day.title} DAY ${index + 1} 일정 보기`}
              key={day.date}
              onClick={() => onOpenDay(index)}
            >
              {day.image && (
                <img src={assetUrl(day.image)} alt="" loading="lazy" />
              )}
              <small>
                DAY {index + 1} · {day.date}
              </small>
              <strong>{day.title}</strong>
              <p>{day.detail}</p>
              <span>일정 보기 ↗</span>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
