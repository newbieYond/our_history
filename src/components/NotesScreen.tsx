import { useTrip } from "../lib/TripContext";
export function NotesScreen() {
  const trip = useTrip();
  return (
    <section className="notes">
      <header className="notes-heading">
        <p className="section-label">KEEP IN MIND</p>
        <h2>
          여행을 더 가볍게
          <br />
          만드는 작은 메모.
        </h2>
      </header>
      <div className="notes-content">
        <div className="note-grid">
          {trip.notes.map((note, index) => (
            <article key={note.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{note.title}</h3>
              <p>{note.body}</p>
            </article>
          ))}
        </div>
        {trip.links.length > 0 && (
          <div className="official-links">
            {trip.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
              >
                {link.icon} {link.label} ↗
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
