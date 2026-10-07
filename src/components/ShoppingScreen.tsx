import { useTrip } from "../lib/TripContext";
export function ShoppingScreen() {
  const trip = useTrip();
  return (
    <section className="shopping">
      <div className="shop-title">
        <p className="section-label">SOUVENIR EDIT</p>
        <h2>
          좋아하는 사람에게
          <br />
          <em>{trip.name}를 담아.</em>
        </h2>
        {trip.shoppingIntro && <p>{trip.shoppingIntro}</p>}
      </div>
      <div className="shop-list">
        {trip.shopping.map((shop, index) => (
          <article key={shop.name}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <h3>{shop.name}</h3>
              <p>{shop.description}</p>
            </div>
            <div className="shop-picks" aria-label="추천 상품">
              {shop.picks.split(" · ").map((pick) => (
                <span key={pick}>{pick}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
