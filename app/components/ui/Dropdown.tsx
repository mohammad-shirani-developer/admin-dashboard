"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import useOutsideClick from "@/app/hooks/useOutsideClick";
import { withClasses } from "./form-controls";

type DropdownOption = {
  value: string;
  label: string;
};

type DropdownProps = {
  id?: string;
  /** Accessible name for the trigger; omit it when a visible <label htmlFor> points at the trigger. */
  ariaLabel?: string;
  value: string;
  options: ReadonlyArray<DropdownOption>;
  onChange: (value: string) => void;
  disabled?: boolean;
  /** Appended to the trigger button (width/height/typography tweaks). */
  triggerClassName?: string;
  /** Appended to the floating panel (width/alignment tweaks). */
  panelClassName?: string;
};

const selectedOptionClasses =
  "bg-blue-50 font-medium text-blue-600 dark:bg-blue-500/10 dark:text-blue-400";
const activeOptionClasses =
  "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100";
const idleOptionClasses = "text-gray-700 dark:text-gray-300";

/**
 * Themed listbox dropdown that replaces native <select> elements: the OS
 * renders their popups, so they can neither follow the dark theme nor the
 * mockup styling.
 *
 * Keyboard model (combobox-button pattern): focus stays on the trigger while
 * the panel is open; the highlighted option is exposed to screen readers via
 * aria-activedescendant. ArrowUp/Down/Home/End move, Enter/Space commit,
 * Escape/Tab close, outside click closes.
 */
const Dropdown = ({
  id,
  ariaLabel,
  value,
  options,
  onChange,
  disabled = false,
  triggerClassName,
  panelClassName,
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const listboxId = useId();
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const selectedLabel = options[selectedIndex]?.label ?? "";

  useOutsideClick(wrapperRef, () => setIsOpen(false), isOpen);

  const openDropdown = () => {
    setActiveIndex(selectedIndex);
    setIsOpen(true);
  };

  const commitOption = (index: number) => {
    const option = options[index];

    if (option) {
      onChange(option.value);
    }

    setIsOpen(false);
    triggerRef.current?.focus();
  };

  /* Keep the highlighted option visible while arrowing through the list. */
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    listRef.current
      ?.querySelector(`#${CSS.escape(`${listboxId}-${activeIndex}`)}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, isOpen, listboxId]);

  const handleTriggerKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
  ) => {
    if (!isOpen) {
      if (
        event.key === "ArrowDown" ||
        event.key === "ArrowUp" ||
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();
        openDropdown();
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, options.length - 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        commitOption(activeIndex);
        break;
      case "Escape":
        event.preventDefault();
        setIsOpen(false);
        break;
      case "Tab":
        setIsOpen(false);
        break;
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        id={id}
        ref={triggerRef}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={() => (isOpen ? setIsOpen(false) : openDropdown())}
        onKeyDown={handleTriggerKeyDown}
        className={withClasses(
          "flex w-full items-center justify-between gap-2",
          triggerClassName,
        )}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel}
          aria-activedescendant={`${listboxId}-${activeIndex}`}
          className={withClasses(
            "absolute right-0 z-50 mt-2 max-h-72 w-full min-w-40 overflow-y-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg dark:border-gray-800 dark:bg-gray-950",
            panelClassName,
          )}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isActive = index === activeIndex;

            return (
              <li
                key={option.value}
                id={`${listboxId}-${index}`}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => commitOption(index)}
                className={withClasses(
                  "flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                  isSelected
                    ? selectedOptionClasses
                    : isActive
                      ? activeOptionClasses
                      : idleOptionClasses,
                )}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && (
                  <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;
