import React from "react";
import { ButtonVariant } from "../../../dataStructures";
import Tooltip from "../Tooltip";

type Props = {
  variant: ButtonVariant;
  hidden?: boolean;
  children?: React.ReactNode;
  onClick?(args: any): any;
  onDoubleClick?(args: any): any;
  disabled?: boolean;
  tooltipMessage?: string;
  tooltipDelay?: number;
  tooltipDirection?: "top" | "bottom" | "left" | "right";
};

export default function Button({
  variant,
  hidden,
  onClick,
  onDoubleClick,
  disabled,
  tooltipMessage,
  tooltipDelay,
  tooltipDirection,
  children,
}: Props) {
  return (
    <Tooltip
      message={tooltipMessage}
      delay={tooltipDelay}
      direction={tooltipDirection}
    >
      <button
        className={`${
          hidden && "hidden "
        } text-bold flex items-center gap-2 rounded border px-3 outline-none ${
          variant === "primary" &&
          " border-1 border-sky-600 bg-sky-600 py-1 text-white disabled:border-slate-400 disabled:bg-slate-400 hover:border-sky-700 hover:bg-sky-700 disabled:hover:border-slate-400 disabled:hover:bg-slate-400 dark:disabled:border-slate-700 dark:disabled:bg-slate-700 dark:disabled:text-slate-500 "
        } ${
          variant === "secondary" &&
          " border-1 border-slate-500 bg-slate-500 py-1 text-white disabled:border-slate-400 disabled:bg-slate-400 hover:border-slate-700 hover:bg-slate-700 disabled:hover:border-slate-400 disabled:hover:bg-slate-400 dark:disabled:border-slate-700 dark:disabled:bg-slate-700 dark:disabled:text-slate-500 "
        } ${
          variant === "danger" &&
          " border-1 border-rose-500 bg-rose-500 py-1 text-white disabled:border-slate-400 disabled:bg-slate-400 hover:border-rose-700 hover:bg-rose-700 disabled:hover:border-slate-400 disabled:hover:bg-slate-400 dark:disabled:border-slate-700 dark:disabled:bg-slate-700 dark:disabled:text-slate-500 "
        } ${
          variant === "success" &&
          " border-1 border-green-500 bg-green-500 py-1 text-white disabled:border-slate-400 disabled:bg-slate-400 hover:border-green-700 hover:bg-green-700 disabled:hover:border-slate-400 disabled:hover:bg-slate-400 dark:disabled:border-slate-700 dark:disabled:bg-slate-700 dark:disabled:text-slate-500 "
        } ${
          variant === "primary-outline" &&
          " border-1 border-sky-500 py-1 text-sky-500 disabled:border-slate-400 disabled:text-slate-400 hover:border-sky-700 hover:bg-sky-700  hover:text-slate-100 disabled:hover:border-slate-400 disabled:hover:bg-inherit disabled:hover:text-slate-400 dark:disabled:border-slate-700 dark:disabled:text-slate-500 "
        } ${
          variant === "secondary-outline" &&
          " border-1 border-slate-500 py-1 text-slate-500 disabled:border-slate-400 disabled:text-slate-400 hover:border-slate-500 hover:bg-slate-500  hover:text-slate-100 disabled:hover:border-slate-400 disabled:hover:bg-inherit disabled:hover:text-slate-400 dark:disabled:border-slate-700 dark:disabled:text-slate-500 "
        } ${
          variant === "danger-outline" &&
          " border-1 border-rose-500 py-1 text-rose-500 disabled:border-slate-400 disabled:text-slate-400 hover:border-rose-500 hover:bg-rose-500  hover:text-slate-100 disabled:hover:border-slate-400 disabled:hover:bg-inherit disabled:hover:text-slate-400 dark:disabled:border-slate-700 dark:disabled:text-slate-500 "
        } ${
          variant === "success-outline" &&
          " border-1 border-green-500 py-1 text-green-500 disabled:border-slate-400 disabled:text-slate-400 hover:border-green-500 hover:bg-green-500  hover:text-slate-100 disabled:hover:border-slate-400 disabled:hover:bg-inherit disabled:hover:text-slate-400 dark:disabled:border-slate-700 dark:disabled:text-slate-500 "
        } ${
          variant === "primary-text" &&
          " border-1 border-slate-50 py-1 disabled:text-slate-400 hover:border-sky-500 hover:bg-sky-500 hover:bg-opacity-20 disabled:hover:border-slate-50 disabled:hover:bg-slate-50 dark:border-slate-900 dark:hover:border-sky-500 dark:disabled:hover:border-slate-900 dark:disabled:hover:bg-slate-900"
        } ${
          variant === "secondary-text" &&
          " border-1 border-slate-50 py-1 disabled:text-slate-400 hover:border-slate-500 hover:bg-slate-500 hover:bg-opacity-20 disabled:hover:border-slate-50 disabled:hover:bg-slate-50 dark:border-slate-900 dark:hover:border-slate-500 dark:disabled:hover:border-slate-900 dark:disabled:hover:bg-slate-900"
        } ${
          variant === "danger-text" &&
          " border-1 border-slate-50 py-1 disabled:text-slate-400 hover:border-rose-500 hover:bg-rose-500 hover:bg-opacity-20 disabled:hover:border-slate-50 disabled:hover:bg-slate-50 dark:border-slate-900 dark:hover:border-rose-500 dark:disabled:hover:border-slate-900 dark:disabled:hover:bg-slate-900"
        } ${
          variant === "success-text" &&
          " border-1 border-slate-50 py-1 disabled:text-slate-400 hover:border-green-500 hover:bg-green-500 hover:bg-opacity-20 disabled:hover:border-slate-50 disabled:hover:bg-slate-50 dark:border-slate-900 hover:dark:border-green-500 dark:disabled:hover:border-slate-900 dark:disabled:hover:bg-slate-900"
        } ${
          variant === "primary-icon" &&
          " border-1 rounded-full border-slate-50 py-3 hover:bg-sky-500 hover:bg-opacity-20 dark:border-slate-900"
        } ${
          variant === "secondary-icon" &&
          " border-1 rounded-full border-slate-50 py-3 hover:bg-slate-500 hover:bg-opacity-20 dark:border-slate-900"
        }`}
        disabled={disabled}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
      >
        {children}
      </button>
    </Tooltip>
  );
}
