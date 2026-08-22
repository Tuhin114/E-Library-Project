import { cn } from "../../lib/utils";

/**
 * Consistent page-level heading: a display title, an optional short
 * description, and an optional actions slot (buttons, etc.) aligned to
 * the right on wider screens. Used across catalog, library and
 * management pages so heading scale/spacing never drifts per-page.
 */
const PageHeader = ({ title, description, actions, className }) => (
  <div
    className={cn(
      "mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
      className,
    )}
  >
    <div className="space-y-1.5">
      <div className="flex items-center gap-3">
        <span className="h-6 w-1.5 rounded-full bg-primary" aria-hidden="true" />
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
      </div>
      {description && (
        <p className="max-w-2xl pl-4 text-sm text-muted-foreground">{description}</p>
      )}
    </div>
    {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
  </div>
);

export default PageHeader;
