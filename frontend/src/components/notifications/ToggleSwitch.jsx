import { cn } from "@/lib/utils";

const ToggleSwitch = ({ checked, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={cn(
      "relative h-7 w-[54px] shrink-0 overflow-hidden rounded-full border text-[10px] font-bold tracking-wide transition-colors duration-200",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      checked
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border bg-muted text-muted-foreground",
    )}
  >
    <span
      className={cn(
        "absolute inset-y-0 flex items-center transition-all duration-200",
        checked
          ? "left-1.5 right-6 justify-start"
          : "left-6 right-1.5 justify-end",
      )}
      aria-hidden="true"
    >
      {checked ? "ON" : "OFF"}
    </span>

    <span
      className={cn(
        "absolute top-0.5 h-6 w-6 rounded-full bg-background shadow-md ring-1 ring-black/10 transition-[left] duration-200",
        checked ? "left-[26px]" : "left-0.5",
      )}
      aria-hidden="true"
    />
  </button>
);

export default ToggleSwitch;
