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
      className={`${
        !open && "overflow-hidden"
      } mt-4 flex w-full flex-col gap-x-2 gap-y-2 rounded border p-4 shadow-sm transition-all duration-100 dark:border-slate-700 dark:shadow-slate-700`}
    >
      <div className="flex justify-between p-1">
        <p className="text-lg font-bold">{title}</p>
        <div className={`${!open && "rotate-180"} transition-all duration-500`}>
          <Button variant="primary-icon" onClick={() => setOpen(!open)}>
            <FaChevronUp />
          </Button>
        </div>
      </div>
      <div className={`${!open ? "max-h-0" : "max-h-full"}`}>{children}</div>
    </div>
  );
}
