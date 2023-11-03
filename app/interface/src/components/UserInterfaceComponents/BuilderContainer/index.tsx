import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import Button from "../Button";
import { useState } from "react";

type Props = {
  title: string;
  children: React.ReactNode;
};

export default function BuilderContainer({ title, children }: Props) {
  const [open, setOpen] = useState<boolean>(true);
  return (
    <div
      className={`my-4 flex w-full flex-col rounded border p-2 shadow-sm dark:border-slate-700 dark:shadow-slate-700 `}
    >
      <div className="flex items-center justify-between">
        <p className="text-lg font-bold">{title}</p>
        <div className={`${!open && "rotate-180"} transition-all duration-500`}>
          <Button variant="secondary-icon" onClick={() => setOpen(!open)}>
            <FaChevronUp />
          </Button>
        </div>
      </div>
      <div className={`${!open ? "max-h-0" : "max-h-full"} overflow-hidden`}>
        {children}
      </div>
    </div>
  );
}
