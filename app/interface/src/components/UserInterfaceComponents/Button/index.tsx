import { ButtonHTMLAttributes } from "react";
import { ButtonVariant } from "../../../dataStructures";
import Tooltip from "../Tooltip";

type VariantStyles = {
  [key in ButtonVariant]: string;
};

const variantStyles: VariantStyles = {
  primary:
    "border-1 border-sky-600 bg-sky-600 py-1 px-3 text-white disabled:border-slate-400 disabled:bg-slate-400 hover:border-sky-700 hover:bg-sky-700 disabled:hover:border-slate-400 disabled:hover:bg-slate-400 dark:disabled:border-slate-700 dark:disabled:bg-slate-700 dark:disabled:text-slate-500",
  secondary:
    "border-1 border-slate-500 bg-slate-500 py-1 px-3 text-white disabled:border-slate-400 disabled:bg-slate-400 hover:border-slate-700 hover:bg-slate-700 disabled:hover:border-slate-400 disabled:hover:bg-slate-400 dark:disabled:border-slate-700 dark:disabled:bg-slate-700 dark:disabled:text-slate-500",
  danger:
    "border-1 border-rose-500 bg-rose-500 py-1 px-3 text-white disabled:border-slate-400 disabled:bg-slate-400 hover:border-rose-700 hover:bg-rose-700 disabled:hover:border-slate-400 disabled:hover:bg-slate-400 dark:disabled:border-slate-700 dark:disabled:bg-slate-700 dark:disabled:text-slate-500",
  success:
    "border-1 border-green-500 bg-green-500 py-1 px-3 text-white disabled:border-slate-400 disabled:bg-slate-400 hover:border-green-700 hover:bg-green-700 disabled:hover:border-slate-400 disabled:hover:bg-slate-400 dark:disabled:border-slate-700 dark:disabled:bg-slate-700 dark:disabled:text-slate-500 ",
  "primary-outline":
    "border-1 border-sky-500 py-1 px-3 text-sky-500 disabled:border-slate-400 disabled:text-slate-400 hover:border-sky-700 hover:bg-sky-700  hover:text-slate-100 disabled:hover:border-slate-400 disabled:hover:bg-inherit disabled:hover:text-slate-400 dark:disabled:border-slate-700 dark:disabled:text-slate-500 ",
  "secondary-outline":
    "border-1 border-slate-500 py-1 px-3 text-slate-500 disabled:border-slate-400 disabled:text-slate-400 hover:border-slate-500 hover:bg-slate-500  hover:text-slate-100 disabled:hover:border-slate-400 disabled:hover:bg-inherit disabled:hover:text-slate-400 dark:disabled:border-slate-700 dark:disabled:text-slate-500 ",
  "danger-outline":
    "border-1 border-rose-500 py-1 px-3 text-rose-500 disabled:border-slate-400 disabled:text-slate-400 hover:border-rose-500 hover:bg-rose-700  hover:text-slate-100 disabled:hover:border-slate-400 disabled:hover:bg-inherit disabled:hover:text-slate-400 dark:disabled:border-slate-700 dark:disabled:text-slate-500 ",
  "success-outline":
    "border-1 border-green-500 py-1 px-3 text-green-500 disabled:border-slate-400 disabled:text-slate-400 hover:border-green-500 hover:bg-green-700  hover:text-slate-100 disabled:hover:border-slate-400 disabled:hover:bg-inherit disabled:hover:text-slate-400 dark:disabled:border-slate-700 dark:disabled:text-slate-500 ",
  "primary-text":
    "border-1 border-slate-50 py-1 px-3 disabled:text-slate-400 hover:border-sky-500 hover:bg-sky-500 hover:bg-opacity-20 disabled:hover:border-slate-50 disabled:hover:bg-slate-50 dark:border-slate-900 dark:hover:border-sky-500 dark:disabled:hover:border-slate-900 dark:disabled:hover:bg-slate-900",
  "secondary-text":
    "border-1 border-slate-50 py-1 px-3 disabled:text-slate-400 hover:border-slate-500 hover:bg-slate-500 hover:bg-opacity-20 disabled:hover:border-slate-50 disabled:hover:bg-slate-50 dark:border-slate-900 dark:hover:border-slate-500 dark:disabled:hover:border-slate-900 dark:disabled:hover:bg-slate-900",
  "danger-text":
    "border-1 border-slate-50 py-1 px-3 disabled:text-slate-400 hover:border-rose-500 hover:bg-rose-500 hover:bg-opacity-20 disabled:hover:border-slate-50 disabled:hover:bg-slate-50 dark:border-slate-900 dark:hover:border-rose-500 dark:disabled:hover:border-slate-900 dark:disabled:hover:bg-slate-900",
  "success-text":
    "border-1 border-slate-50 py-1 px-3 disabled:text-slate-400 hover:border-green-500 hover:bg-green-500 hover:bg-opacity-20 disabled:hover:border-slate-50 disabled:hover:bg-slate-50 dark:border-slate-900 hover:dark:border-green-500 dark:disabled:hover:border-slate-900 dark:disabled:hover:bg-slate-900",
  text: "border-0 px-3 disabled:cursor-not-allowed  disabled:text-slate-400 hover:text-sky-500  disabled:hover:text-slate-400 dark:hover:text-sky-500 dark:disabled:hover:text-slate-400 ",
  "primary-icon":
    "border-1 rounded-full border-slate-50 py-2 px-2 hover:bg-sky-500 hover:bg-opacity-20 dark:border-slate-900",
  "secondary-icon":
    "border-1 rounded-full border-slate-50 py-2 px-2 hover:bg-slate-500 hover:bg-opacity-20 dark:border-slate-900",
  "danger-icon":
    "border-0 rounded-full border-slate-50 py-2 px-2 hover:bg-rose-500 hover:bg-opacity-50 dark:border-slate-900",
};

function getClassName(variant: ButtonVariant, hidden?: boolean) {
  let className =
    "text-bold flex items-center gap-2 rounded border outline-none";
  if (hidden) className += " hidden";
  className += " " + variantStyles[variant];
  return className;
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  hidden?: boolean;
  tooltipMessage?: string;
  tooltipDelay?: number;
  tooltipDirection?: "top" | "bottom" | "left" | "right";
};

export default function Button({
  variant = "text",
  hidden,
  tooltipMessage,
  tooltipDelay,
  tooltipDirection,
  children,
  ...rest
}: Props) {
  const className = getClassName(variant, hidden);

  return (
    <Tooltip
      message={tooltipMessage}
      delay={tooltipDelay}
      direction={tooltipDirection}
    >
      <button className={className} {...rest}>
        {children}
      </button>
    </Tooltip>
  );
}
