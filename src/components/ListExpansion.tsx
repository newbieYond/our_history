export function ListExpansion({
  noun,
  shown,
  total,
  onMore,
  onAll,
}: {
  noun: string;
  shown: number;
  total: number;
  onMore: () => void;
  onAll: () => void;
}) {
  if (shown >= total) return null;
  return (
    <div className="list-expansion">
      <p aria-live="polite">
        {total}개 중 {shown}개 표시
      </p>
      <div>
        <button type="button" onClick={onMore}>
          {noun} {Math.min(24, total - shown)}개 더 보기
        </button>
        <button
          type="button"
          onClick={onAll}
          aria-label={`필터에 맞는 ${noun} ${total}개 모두 펼치기`}
        >
          {noun} 모두 보기
        </button>
      </div>
    </div>
  );
}
