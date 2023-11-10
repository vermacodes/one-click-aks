import { useState } from "react";

type Props = {
  message?: string;
  children: React.ReactNode;
  delay?: number; // in milliseconds
  direction?: "top" | "bottom" | "left" | "right";
};

export default function Tooltip({
  message,
  children,
  delay = 0,
  direction = "bottom",
}: Props) {
  const [visible, setVisible] = useState(false);
  let timer: NodeJS.Timeout;

  const handleMouseEnter = () => {
    timer = setTimeout(() => setVisible(true), delay);
  };

  const handleMouseLeave = () => {
    clearTimeout(timer);
    setVisible(false);
  };

  return (
    <div
      className="relative flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {message && visible && (
        <div
          className={`
          absolute z-50 transform rounded bg-slate-800 p-2 text-xs text-slate-100 transition-all
          dark:bg-slate-100 dark:text-slate-900 
          ${direction === "top" ? "bottom-10" : ""}
          ${direction === "bottom" ? "top-10" : ""}
          ${direction === "left" ? "right-10" : ""}
          ${direction === "right" ? "left-10" : ""}
        `}
        >
          {message}
        </div>
      )}
    </div>
  );
}
