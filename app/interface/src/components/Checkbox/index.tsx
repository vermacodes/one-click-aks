type CheckboxProps = {
  id: string;
  label: string;
  checked: boolean;
  disabled: boolean;
  handleOnChange(args: void): void;
};

export default function Checkbox({
  id,
  label,
  checked,
  disabled,
  handleOnChange,
}: CheckboxProps) {
  return (
    <div className="flex items-center gap-x-2">
      <label
        htmlFor={id}
        className={`flex h-4 w-8 rounded-full transition-all duration-100 hover:cursor-pointer ${
          checked ? "bg-sky-500" : "bg-slate-500"
        } ${
          disabled && "bg-slate-300 hover:cursor-not-allowed dark:bg-slate-800"
        }
             `}
      >
        <input
          type="checkbox"
          id={id}
          className="sr-only"
          checked={checked}
          disabled={disabled}
          onChange={() => handleOnChange()}
        />
        <div
          className={`h-4 w-4 rounded-full bg-white transition-all duration-100 ${
            checked && "ml-4"
          } ${disabled && "dark:bg-slate-600"}`}
        ></div>
      </label>
      <span
        className={`text-md text-slate-900 dark:text-slate-200 ${
          disabled && "text-slate-400 dark:text-slate-600"
        } transition-all duration-100`}
      >
        {label}
      </span>
    </div>
  );
}
