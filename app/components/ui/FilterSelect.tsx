"use client";

import Dropdown from "./Dropdown";
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

/**
 * Generic filter select used by every table filter bar and form section.
 * Same props API as before, but backed by the themed Dropdown listbox so the
 * open panel follows the dark/light theme instead of the OS select popup.
 * A visible <label htmlFor> still works: the trigger is a real <button>,
 * which is a labelable element.
 */
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
    <Dropdown
      id={id}
      ariaLabel={ariaLabel}
      value={value}
      options={options}
      onChange={(nextValue) => onChange(nextValue as T)}
      disabled={disabled}
      triggerClassName={withClasses(selectClasses, className)}
    />
  );
};

export default FilterSelect;
