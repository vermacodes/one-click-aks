import { useState } from "react";

type Props = {
  message?: string;
  children: React.ReactNode;
  delay?: number; // in milliseconds
};

export default function Tooltip({ message, children, delay = 0 }: Props) {
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
          className="absolute top-10 z-50 transform rounded bg-slate-800 p-2 text-xs text-slate-100 transition-all
        dark:bg-slate-100 dark:text-slate-900 
        "
        >
          {message}
        </div>
      )}
    </div>
  );
}
