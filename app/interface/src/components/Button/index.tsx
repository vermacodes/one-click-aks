type ButtonProps = {
    variant: string;
    label: string;
    onClick?(args: void): void;
    disabled?: boolean;
};
export const successButtonClassName =
    "bg-green-500 py-1 px-5 rounded-2xl text-bold text-white hover:bg-green-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 dark:disabled:text-slate-500";
export const successOutlineButtonClassName =
    "bg-transparent py-1 px-5 rounded-full text-bold text-green-500 border-2 border-green-500 hover:bg-green-500 hover:text-slate-100 disabled:border-slate-300 disabled:dark:border-slate-700 disabled:text-slate-300 disabled:hover:bg-transparent";
export const primaryButtonClassName =
    "bg-sky-500 py-1 px-5 rounded-2xl text-bold text-white hover:bg-sky-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 dark:disabled:text-slate-500";
export const primaryOutlineButtonClassName =
    "bg-transparent py-1 px-5 rounded-full text-bold text-sky-500 border-2 border-sky-500 hover:bg-sky-500 hover:text-slate-100 disabled:border-slate-300 disabled:dark:border-slate-700 disabled:text-slate-300 disabled:hover:bg-transparent";

export const secondaryButtonClassName =
    "bg-slate-500 py-1 px-5 rounded-2xl text-bold text-white hover:bg-slate-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 dark:disabled:text-slate-500";
export const secondaryOutlineButtonClassName =
    "bg-transparent py-1 px-5 rounded-full text-bold text-slate-500 border-2 border-slate-500 hover:bg-slate-500 hover:text-slate-100 disabled:border-slate-300 disabled:dark:border-slate-700 disabled:text-slate-300 disabled:hover:bg-transparent";

export const dangerButtonClassName =
    "bg-red-500 py-1 px-5 rounded-2xl text-bold text-white hover:bg-red-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 dark:disabled:text-slate-500";
export const dangerOutlineButtonClassName =
    "bg-transparent py-1 px-5 rounded-full text-bold text-red-500 border-2 border-red-500 hover:bg-red-500 hover:text-slate-100 disabled:border-slate-300 disabled:dark:border-slate-700 disabled:text-slate-300 disabled:hover:bg-transparent";

export function Button({ variant, label, onClick, disabled }: ButtonProps) {
    // Defaults to primary.
    var className: string = primaryButtonClassName;
    switch (variant) {
        case "primary":
            break;
        case "success":
            className = successButtonClassName;
            break;
        case "secondary":
            className = secondaryButtonClassName;
            break;
        case "danger":
            className = dangerButtonClassName;
            break;
        default:
            break;
    }

    return (
        <button className={className} onClick={() => onClick} disabled={disabled}>
            {label}
        </button>
    );
}
