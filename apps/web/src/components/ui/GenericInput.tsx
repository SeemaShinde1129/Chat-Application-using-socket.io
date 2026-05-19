import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";

type GenericInputProps = {
  error?: string;
  helperText?: string;
  label: string;
  leftAdornment?: ReactNode;
  rightAdornment?: ReactNode;
  wrapperClassName?: string;
} & InputHTMLAttributes<HTMLInputElement>;

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const GenericInput = forwardRef<HTMLInputElement, GenericInputProps>(function GenericInput(
  {
    className,
    error,
    helperText,
    id,
    label,
    leftAdornment,
    rightAdornment,
    type = "text",
    wrapperClassName,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const resolvedId = id ?? generatedId;

  return (
    <label
      className={joinClasses("flex w-full flex-col gap-2 text-left", wrapperClassName)}
      htmlFor={resolvedId}
    >
      <span className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">
        {label}
      </span>

      <span
        className={joinClasses(
          "flex items-center gap-3 rounded-[1.35rem] border bg-white/90 px-4 py-3 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.32)] backdrop-blur-sm transition duration-200",
          error
            ? "border-rose-300 ring-4 ring-rose-100/70"
            : "border-stone-200 focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-100/80",
        )}
      >
        {leftAdornment ? (
          <span className="shrink-0 text-sm font-semibold text-stone-400 [&_svg]:h-4 [&_svg]:w-4">
            {leftAdornment}
          </span>
        ) : null}

        <input
          {...props}
          ref={ref}
          className={joinClasses(
            "min-w-0 flex-1 border-none bg-transparent text-base text-stone-900 outline-none placeholder:text-stone-400",
            className,
          )}
          id={resolvedId}
          type={type}
        />

        {rightAdornment ? (
          <span className="shrink-0 text-sm font-medium text-stone-400 [&_svg]:h-4 [&_svg]:w-4">
            {rightAdornment}
          </span>
        ) : null}
      </span>

      {error ? (
        <span className="text-sm font-medium text-rose-600">{error}</span>
      ) : helperText ? (
        <span className="text-sm text-stone-500">{helperText}</span>
      ) : null}
    </label>
  );
});

export { GenericInput };
