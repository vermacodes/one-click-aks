import React from "react";
import { ButtonVariant } from "../../dataStructures";

type Props = {
  variant: ButtonVariant;
  hidden?: boolean;
  children?: React.ReactNode;
  onClick?(args: any): any;
  onDoubbleClick?(args: any): any;
  disabled?: boolean;
};

export default function Button({
  variant,
  hidden,
  onClick,
  onDoubbleClick,
  disabled,
  children,
}: Props) {
  return (
    <button
      className={`${
        hidden && "hidden "
      } text-bold flex items-center gap-2 rounded px-3 outline ${
        variant === "primary" &&
        " bg-sky-600 py-1 text-white outline-1 outline-sky-600 disabled:bg-slate-400 disabled:outline-slate-400 hover:bg-sky-700 hover:outline-sky-700 disabled:hover:bg-slate-400 disabled:hover:outline-slate-400 dark:disabled:bg-slate-700 dark:disabled:text-slate-500 dark:disabled:outline-slate-700 "
      } ${
        variant === "secondary" &&
        " bg-slate-500 py-1 text-white outline-1 outline-slate-500 disabled:bg-slate-400 disabled:outline-slate-400 hover:bg-slate-700 hover:outline-slate-700 disabled:hover:bg-slate-400 disabled:hover:outline-slate-400 dark:disabled:bg-slate-700 dark:disabled:text-slate-500 dark:disabled:outline-slate-700 "
      } ${
        variant === "danger" &&
        " bg-rose-500 py-1 text-white outline-1 outline-rose-500 disabled:bg-slate-400 disabled:outline-slate-400 hover:bg-rose-700 hover:outline-rose-700 disabled:hover:bg-slate-400 disabled:hover:outline-slate-400 dark:disabled:bg-slate-700 dark:disabled:text-slate-500 dark:disabled:outline-slate-700 "
      } ${
        variant === "success" &&
        " bg-green-500 py-1 text-white outline-1 outline-green-500 disabled:bg-slate-400 disabled:outline-slate-400 hover:bg-green-700 hover:outline-green-700 disabled:hover:bg-slate-400 disabled:hover:outline-slate-400 dark:disabled:bg-slate-700 dark:disabled:text-slate-500 dark:disabled:outline-slate-700 "
      } ${
        variant === "primary-outline" &&
        " py-1 text-sky-500 outline-1 outline-sky-500 disabled:text-slate-400 disabled:outline-slate-400 hover:bg-sky-500 hover:text-slate-100  hover:outline-sky-500 disabled:hover:bg-inherit disabled:hover:text-slate-400 disabled:hover:outline-slate-400 dark:disabled:text-slate-500 dark:disabled:outline-slate-700 "
      } ${
        variant === "secondary-outline" &&
        " py-1 text-slate-500 outline-1 outline-slate-500 disabled:text-slate-400 disabled:outline-slate-400 hover:bg-slate-500 hover:text-slate-100  hover:outline-slate-500 disabled:hover:bg-inherit disabled:hover:text-slate-400 disabled:hover:outline-slate-400 dark:disabled:text-slate-500 dark:disabled:outline-slate-700 "
      } ${
        variant === "danger-outline" &&
        " py-1 text-rose-500 outline-1 outline-rose-500 disabled:text-slate-400 disabled:outline-slate-400 hover:bg-rose-500 hover:text-slate-100  hover:outline-rose-500 disabled:hover:bg-inherit disabled:hover:text-slate-400 disabled:hover:outline-slate-400 dark:disabled:text-slate-500 dark:disabled:outline-slate-700 "
      } ${
        variant === "success-outline" &&
        " py-1 text-green-500 outline-1 outline-green-500 disabled:text-slate-400 disabled:outline-slate-400 hover:bg-green-500 hover:text-slate-100  hover:outline-green-500 disabled:hover:bg-inherit disabled:hover:text-slate-400 disabled:hover:outline-slate-400 dark:disabled:text-slate-500 dark:disabled:outline-slate-700 "
      } ${
        variant === "primary-outline-animate" &&
        " py-1 text-sky-500 outline-sky-500 transition-all duration-300 disabled:text-slate-400 disabled:outline-slate-400  hover:bg-sky-500 hover:text-slate-100 hover:outline-sky-500 disabled:hover:bg-inherit disabled:hover:text-slate-400 disabled:hover:outline-slate-400 dark:disabled:text-slate-500 dark:disabled:outline-slate-700"
      } ${
        variant === "primary-text" &&
        " py-1 outline-1 outline-slate-50 hover:bg-sky-500 hover:bg-opacity-20 hover:outline-sky-500 dark:outline-slate-900"
      } ${
        variant === "secondary-text" &&
        " py-1 outline-1 outline-slate-50 hover:bg-slate-500 hover:bg-opacity-20 hover:outline-slate-500 dark:outline-slate-900"
      } ${
        variant === "danger-text" &&
        " py-1 outline-1 outline-slate-50 hover:bg-rose-500 hover:bg-opacity-20 hover:outline-rose-500 dark:outline-slate-900"
      } ${
        variant === "success-text" &&
        " py-1 outline-1 outline-slate-50 hover:bg-green-500 hover:bg-opacity-20 hover:outline-green-500 dark:outline-slate-900"
      } ${
        variant === "primary-icon" &&
        " rounded-full py-3 outline-1 outline-slate-50 hover:bg-sky-500 hover:bg-opacity-20 dark:outline-slate-900"
      }`}
      disabled={disabled}
      onClick={onClick}
      onDoubleClick={onDoubbleClick}
    >
      {children}
    </button>
  );
}
