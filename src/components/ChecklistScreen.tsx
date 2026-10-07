import { useState } from "react";
import { useTrip } from "../lib/TripContext";
import { readChecklist, writeChecklist } from "../lib/storage";
export function ChecklistScreen() {
  const trip = useTrip();
  const [checked, setChecked] = useState(() => readChecklist(trip.id));
  const [saved, setSaved] = useState(true);
  const completed = trip.checklist.filter((item) =>
    checked.includes(item.id),
  ).length;
  const toggle = (id: string) => {
    const next = checked.includes(id)
      ? checked.filter((item) => item !== id)
      : [...checked, id];
    setChecked(next);
    setSaved(writeChecklist(trip.id, next));
  };
  return (
    <section className="checklist">
      <p className="section-label">NEXT TO DO</p>
      <h2>출발 전, 하나씩.</h2>
      <div className="checklist-progress">
        <p aria-live="polite">
          {completed} / {trip.checklist.length} 완료
        </p>
        <progress
          value={completed}
          max={trip.checklist.length}
          aria-label="여행 준비 완료"
        />
      </div>
      <div className="check-items">
        {trip.checklist.map((item) => (
          <label
            key={item.id}
            className={checked.includes(item.id) ? "done" : ""}
          >
            <input
              type="checkbox"
              checked={checked.includes(item.id)}
              onChange={() => toggle(item.id)}
            />
            <span>
              {item.label}
              {item.pending && <small> · 검토</small>}
            </span>
          </label>
        ))}
      </div>
      <p className="checklist-note">
        체크 상태는 이 브라우저에 여행별로 저장됩니다. 운영 정보는 출발 직전에
        공식 안내로 다시 확인합니다.
      </p>
      {!saved && (
        <p role="status">
          브라우저 저장소를 사용할 수 없어 새로고침하면 체크 상태가 사라집니다.
        </p>
      )}
    </section>
  );
}
