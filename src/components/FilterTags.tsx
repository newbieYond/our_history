type FilterTagsProps = {
  label: string;
  options: { value: string; label: string }[];
  selected: string;
  onChange: (value: string) => void;
};

export function FilterTags({
  label,
  options,
  selected,
  onChange,
}: FilterTagsProps) {
  return (
    <fieldset className="filter-tag-group">
      <legend>{label}</legend>
      <div className="filter-tags">
        {options.map((option) => (
          <button
            type="button"
            key={option.value}
            aria-label={`${label} ${option.label} 선택`}
            aria-pressed={selected === option.value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
