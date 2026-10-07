import { useTrip } from "../lib/TripContext";
import { opinionRating } from "../lib/places";
export function PlaceFeedback({ name }: { name: string }) {
  const place = useTrip().places.find((p) => p.name === name);
  if (!place) return null;
  return (
    <div
      className="place-feedback"
      role="group"
      aria-label={`${name}의 평점과 평가`}
    >
      <div className="place-feedback-heading">
        <span>우리의 평점 · 평가</span>
        <small>5점 만점</small>
      </div>
      {[
        {
          person: "성호",
          rating: place.seonghoRating,
          opinion: place.seonghoOpinion,
        },
        {
          person: "세인",
          rating: place.seinRating,
          opinion: place.seinOpinion,
        },
      ].map((p) => (
        <div className="place-feedback-person" key={p.person}>
          <div>
            <b>{p.person}</b>
            <span>{opinionRating(p.rating)}</span>
          </div>
          <p>{p.opinion.trim() || "아직 평가를 남기지 않았어요."}</p>
        </div>
      ))}
    </div>
  );
}
