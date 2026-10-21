import { selectClasses, withClasses } from "./form-controls";

type FilterSelectProps<T extends string> = {
  id?: string;
  ariaLabel?: string;
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (value: T) => void;
  className?: string;
  disabled?: boolean;
};

/** Generic styled select used by every table filter bar. */
const FilterSelect = <T extends string>({
  id,
  ariaLabel,
  value,
  options,
  onChange,
  className,
  disabled,
}: FilterSelectProps<T>) => {
  return (
    <select
      id={id}
      aria-label={ariaLabel}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value as T)}
      className={withClasses(selectClasses, className)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default FilterSelect;
