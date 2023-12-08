import { FaFilter } from "react-icons/fa";

type Props = {
  placeHolderText?: string;
  value: string;
  onChange: (value: string) => void;
};

export default function FilterTextBox({
  placeHolderText = "Filter",
  value,
  onChange,
}: Props) {
  return (
    <div className="relative mb-4 w-full">
      <input
        type="text"
        aria-label="Search"
        placeholder={placeHolderText}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border bg-slate-50 p-2 pl-10 text-lg shadow focus:outline-none focus:ring-2 focus:ring-sky-500 hover:border-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-sky-500"
      />
      <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400" />
    </div>
  );
}
