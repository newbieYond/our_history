import { trips } from "../trips";
import { assetUrl } from "../lib/assets";
import { routeHash } from "../lib/route";
export function TravelLibrary() {
  return (
    <div className="library">
      <header className="library-nav">
        <a href="#/">
          OUR HISTORY <span>성호 · 세인</span>
        </a>
        <span>OUR TRAVEL COLLECTION</span>
      </header>
      <main>
        <section className="library-intro">
          <p>A COLLECTION OF OUR DAYS</p>
          <h1>
            우리의 시간은,
            <br />
            <em>여행이 된다.</em>
          </h1>
          <div>
            <p>
              잘 먹고, 천천히 걷고, 오래 기억하기.
              <br />
              함께 떠나는 여행의 작은 이야기를 모았어요.
            </p>
            <span>
              {String(trips.length).padStart(2, "0")} TRAVEL STORIES ↘
            </span>
          </div>
        </section>
        <section className="travel-collection" aria-label="여행 선택">
          {trips.map((trip, index) => (
            <a
              className={`travel-card theme-${trip.theme}`}
              key={trip.id}
              href={routeHash(trip.id, "home")}
              aria-label={`${trip.name} 여행 열기`}
            >
              <div className="travel-card-art">
                <img src={assetUrl(trip.cover)} alt={trip.coverAlt} />
                <span>{String(index + 1).padStart(2, "0")}</span>
                <b>{trip.eyebrow}</b>
              </div>
              <div className="travel-card-body">
                <small>
                  {trip.startDate.replaceAll("-", ".")} —{" "}
                  {trip.endDate.replaceAll("-", ".")}
                </small>
                <h2>
                  {trip.englishName}
                  <span>{trip.name}</span>
                </h2>
                <p>{trip.description}</p>
                <div>
                  <span>
                    {trip.days.length}일 · {trip.places.length}개의 장소
                  </span>
                  <strong>여행 열기 ↗</strong>
                </div>
              </div>
            </a>
          ))}
        </section>
        <p className="collection-end">다음 이야기도, 함께.</p>
      </main>
      <footer>
        <span>SEONGHO & SEIN'S TRAVEL NOTE</span>
        <span>OUR HISTORY</span>
      </footer>
    </div>
  );
}
