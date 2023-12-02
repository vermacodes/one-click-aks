import { InputHTMLAttributes } from "react";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import Tooltip from "../Tooltip";

type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  tooltipMessage?: string;
  tooltipDelay?: number;
  handleOnChange(args: void): void;
};

export default function DarkModeSwitch({
  id,
  label,
  tooltipMessage,
  tooltipDelay,
  handleOnChange,
  ...rest
}: CheckboxProps) {
  return (
    <Tooltip message={tooltipMessage} delay={tooltipDelay}>
      <div className="flex items-center">
        <label
          htmlFor={id}
          className={`flex h-5 w-10 items-center rounded-full outline outline-1 outline-slate-500 transition-all duration-100 hover:cursor-pointer ${
            rest.checked ? "bg-slate-700" : "bg-slate-300"
          } ${
            rest.disabled &&
            "bg-slate-300 hover:cursor-not-allowed dark:bg-slate-700"
          }
      `}
        >
          <input
            type="checkbox"
            id={id}
            className="sr-only"
            onChange={() => handleOnChange()}
            {...rest}
          />
          <div
            className={`flex h-5 w-5 items-center justify-center rounded-full bg-white text-slate-700 transition-all duration-100 dark:text-slate-300 ${
              rest.checked && "ml-5 dark:bg-slate-900"
            } ${rest.disabled && "dark:bg-slate-600"}`}
          >
            {rest.checked ? <MdDarkMode /> : <MdLightMode />}
          </div>
        </label>
        <span
          className={`text-md text-slate-900 dark:text-slate-200 ${
            rest.disabled && "text-slate-500 dark:text-slate-500"
          } transition-all duration-100`}
        >
          {label}
        </span>
      </div>
    </Tooltip>
  );
}
