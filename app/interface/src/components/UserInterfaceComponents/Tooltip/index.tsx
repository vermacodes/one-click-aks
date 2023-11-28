import { useEffect, useState } from "react";

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
  const [mouseOn, setMouseOn] = useState(false);
  let timer: NodeJS.Timeout;

  useEffect(() => {
    console.log("Mouse On : ", message, mouseOn);
    if (mouseOn) {
      timer = setTimeout(() => setVisible(true), delay);
    }

    return () => {
      clearTimeout(timer);
      setVisible(false);
    };
  }, [mouseOn]);

  return (
    <div
      className="relative flex"
      onMouseEnter={() => setMouseOn(true)}
      onMouseLeave={() => setMouseOn(false)}
    >
      {children}
      {message && visible && (
        <div
          className={`
          absolute z-10 transform rounded bg-slate-800 p-2 text-xs text-slate-100 transition-all
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
