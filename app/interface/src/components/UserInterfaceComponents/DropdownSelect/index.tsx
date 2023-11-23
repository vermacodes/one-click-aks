import React, { useEffect, useState } from "react";
import { FaChevronDown } from "react-icons/fa";

type ItemProps<T> = {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  heading: React.ReactNode;
  onItemClick(args: T): void;
  search?: React.ReactNode;
};

type DropdownSelectProps = {
  disabled?: boolean;
  searchEnabled?: boolean;
  width?: number | string;
  minWidth?: number | string;
  height?: string; // Height of the dropdown menu
};

export default function DropdownSelect<T>({
  disabled = false,
  heading,
  search,
  items,
  renderItem,
  onItemClick,
  height = "h-32",
}: ItemProps<T> & DropdownSelectProps) {
  // State to track whether the dropdown menu is open
  const [isMenuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className={`${
        isMenuOpen ? "relative" : ""
      } inline-block w-full text-left`}
    >
      <div
        className={`${
          disabled && "cursor-not-allowed text-slate-500 "
        } flex w-full cursor-pointer items-center justify-between rounded border border-slate-500 px-2 py-1`}
        onClick={(e) => {
          if (disabled) {
            return;
          }
          setMenuOpen(!isMenuOpen);
          e.stopPropagation();
        }}
      >
        <p>{heading}</p>
        <p>
          <FaChevronDown />
        </p>
      </div>
      {isMenuOpen && (
        <DropdownMenu
          heading={heading}
          setMenuOpen={setMenuOpen}
          renderItem={renderItem}
          items={items}
          onItemClick={onItemClick}
          search={search}
          height={height}
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
        <div key={index} onClick={() => onItemClick(item)}>
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
};
