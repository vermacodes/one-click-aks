import { useState } from "react";
import { FaChevronUp } from "react-icons/fa";
import Button from "../Button";

type Props = {
  title?: string;
  collapsible?: boolean;
  collapsed?: boolean;
  hoverEffect?: boolean;
  additionalClasses?: string;
  additionalContainerBodyClasses?: string;
  children: React.ReactNode;
};

export default function Container({
  title,
  children,
  collapsible = false,
  collapsed = false,
  hoverEffect = true,
  additionalClasses,
  additionalContainerBodyClasses,
}: Props) {
  const [open, setOpen] = useState<boolean>(!collapsed);
  return (
    <div
      className={`${additionalClasses && additionalClasses} ${
        hoverEffect &&
        "hover:shadow-lg hover:outline hover:outline-sky-500 dark:bg-slate-900 dark:outline-slate-600 dark:hover:outline-sky-500 "
      } flex w-full flex-col justify-between gap-4 rounded bg-slate-50 p-4 shadow-md outline-1 outline-slate-400 dark:bg-slate-900 dark:outline-slate-600`}
    >
      <div
        className="flex items-center justify-between "
        onClick={() => {
          collapsible && setOpen(!open);
        }}
      >
        <p className="text-lg">{title}</p>
        {collapsible && (
          <div
            className={`${
              !open && "rotate-180"
            } transition-transform duration-100`}
          >
            <Button variant="secondary-icon" onClick={() => setOpen(!open)}>
              <FaChevronUp />
            </Button>
          </div>
        )}
      </div>
      <div
        key={title}
        className={`${
          additionalContainerBodyClasses && additionalContainerBodyClasses
        } ${!open ? "max-h-0 overflow-hidden" : "max-h-fit"} `}
      >
        {children}
      </div>
    </div>
  );
}
