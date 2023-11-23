import React, { useState } from "react";
import { FaChevronDown, FaTimes } from "react-icons/fa";

type ItemProps<T> = {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  heading: React.ReactNode;
  onItemClick(args: T): void;
};

type Props = {
  searchEnabled?: boolean;
  width?: number | string;
  minWidth?: number | string;
  height?: number | string;
};

export default function DropdownSelect<T extends { toString(): string }>({
  heading,
  searchEnabled = false,
  items,
  renderItem,
  onItemClick,
  height = "h-32",
}: ItemProps<T> & Props) {
  const [menu, setMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = items.filter((item) =>
    item.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`${menu ? "relative" : ""} inline-block w-full text-left`}>
      <div
        className={`flex w-full items-center justify-between rounded border border-slate-500 px-2 py-1`}
        onClick={(e) => {
          setMenu(!menu);
          e.stopPropagation();
        }}
      >
        <p>{heading}</p>
        <p>
          <FaChevronDown />
        </p>
      </div>
      <div
        className={`absolute right-0 z-10 mt-1 ${height} w-full origin-top-right overflow-y-auto overflow-x-hidden scrollbar-thin  scrollbar-thumb-slate-400 dark:scrollbar-thumb-slate-600 ${
          !menu && "hidden"
        } items-center gap-y-2 rounded border border-slate-500 bg-slate-100 p-2 dark:bg-slate-800`}
        onMouseLeave={() => setMenu(false)}
      >
        {menu && searchEnabled && (
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded px-2 py-1 dark:bg-slate-700 dark:text-slate-100"
            />
            {searchTerm && (
              <FaTimes
                className="absolute right-2 top-1/2 -translate-y-1/2 transform cursor-pointer"
                onClick={() => setSearchTerm("")}
              />
            )}
          </div>
        )}
        {filteredItems.map((item, index) => (
          <div
            key={index}
            className="rounded py-2 px-1 hover:bg-slate-500 hover:bg-opacity-20"
            onClick={() => onItemClick(item)}
          >
            {renderItem(item)}
          </div>
        ))}
      </div>
    </div>
  );
}
