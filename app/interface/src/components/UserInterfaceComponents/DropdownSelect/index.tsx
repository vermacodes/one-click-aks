import React, { useEffect, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import Tooltip from "../Tooltip";

type ItemProps<T> = {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  heading: React.ReactNode;
  onItemClick(args: T): void;
  search?: React.ReactNode;
  disabled?: boolean;
  width?: number | string;
  height?: string; // Height of the dropdown menu
  tooltipMessage?: string;
  tooltipDirection?: "top" | "bottom" | "left" | "right" | undefined;
  tooltipDelay?: number;
  closeMenuOnSelect?: boolean;
};

export default function DropdownSelect<T>({
  disabled = false,
  heading,
  search,
  items,
  renderItem,
  onItemClick,
  height = "h-32",
  tooltipMessage,
  tooltipDirection = "top",
  tooltipDelay,
  closeMenuOnSelect = true,
}: ItemProps<T>) {
  // State to track whether the dropdown menu is open
  const [isMenuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className={`${
        isMenuOpen ? "relative" : ""
      } inline-block w-full text-left`}
    >
      <Tooltip
        message={tooltipMessage}
        direction={tooltipDirection}
        delay={tooltipDelay}
      >
        <div
          className={`${
            disabled && "cursor-not-allowed text-slate-500 "
          } flex w-full cursor-pointer items-center justify-between gap-4 rounded border border-slate-500 px-2 py-1`}
          onClick={(e) => {
            if (disabled) {
              return;
            }
            setMenuOpen(!isMenuOpen);
            e.stopPropagation();
          }}
        >
          <div>{heading}</div>
          <p>
            <FaChevronDown />
          </p>
        </div>
      </Tooltip>
      {isMenuOpen && (
        <DropdownMenu
          heading={heading}
          setMenuOpen={setMenuOpen}
          renderItem={renderItem}
          items={items}
          onItemClick={onItemClick}
          search={search}
          height={height}
          closeMenuOnSelect={closeMenuOnSelect}
        />
      )}
    </div>
  );
}

type DropdownMenuProps = {
  height: string;
  setMenuOpen: (isOpen: boolean) => void;
};

// Dropdown menu component
const DropdownMenu = <T,>({
  items,
  renderItem,
  onItemClick,
  search,
  height,
  setMenuOpen,
  closeMenuOnSelect,
}: ItemProps<T> & DropdownMenuProps) => {
  const [didMouseEnter, setDidMouseEnter] = useState(false);

  //if no mouse enter in 5 seconds, close the menu
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!didMouseEnter) {
        setMenuOpen(false);
      }
    }, 5000);
    if (didMouseEnter) {
      clearTimeout(timeoutId);
    }
    return () => clearTimeout(timeoutId);
  }, [didMouseEnter]);

  return (
    <div
      className={`absolute right-0 z-10 mt-1 ${height} w-full origin-top-right items-center gap-y-2 overflow-y-auto  rounded border border-slate-500 bg-slate-100 p-2 overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-400 dark:bg-slate-800 dark:scrollbar-thumb-slate-600`}
      onMouseLeave={() => setMenuOpen(false)}
      onMouseEnter={() => setDidMouseEnter(true)}
    >
      {search && search}
      {items.map((item, index) => (
        <div
          key={index}
          onClick={(e) => {
            if (closeMenuOnSelect) {
              setMenuOpen(false);
            }
            onItemClick(item);
            e.stopPropagation();
          }}
        >
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
};
