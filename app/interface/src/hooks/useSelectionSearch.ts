import { useEffect, useState } from "react";

type ItemWithToString = {
  toString(): string;
};

// Custom hook for handling selection and search
export function useSelectionSearch<T extends ItemWithToString | undefined>(
  initialItems?: T[]
): [
  T[] | undefined,
  T[],
  React.Dispatch<React.SetStateAction<T[]>>,
  (item: T) => void,
  string,
  React.Dispatch<React.SetStateAction<string>>
] {
  const [uniqueItems, setUniqueItems] = useState<T[] | undefined>(initialItems);
  const [selectedItems, setSelectedItems] = useState<T[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleSelection = (item: T) => {
    setSelectedItems(
      selectedItems.includes(item)
        ? selectedItems.filter((i) => i !== item)
        : [...selectedItems, item]
    );
  };

  useEffect(() => {
    setUniqueItems(
      uniqueItems?.filter((item) =>
        item?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm]);

  return [
    uniqueItems,
    selectedItems,
    setSelectedItems,
    handleSelection,
    searchTerm,
    setSearchTerm,
  ];
}

// Usage
