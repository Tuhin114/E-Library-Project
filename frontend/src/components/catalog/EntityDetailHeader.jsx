import { Badge } from "../ui/badge";

/**
 * Shared header for Category/Author/Publisher detail pages: display
 * title, status/count badges, an optional meta row (links, extra
 * facts) and an optional description — keeps the three detail pages
 * visually identical without duplicating the markup three times.
 */
const EntityDetailHeader = ({ title, badges = [], meta, description }) => (
  <div className="mb-10 border-b border-border pb-8">
    <div className="flex flex-wrap items-center gap-3">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {title}
      </h1>
      {badges.map((badge) => (
        <Badge key={badge.label} variant={badge.variant || "secondary"}>
          {badge.label}
        </Badge>
      ))}
    </div>
    {meta && (
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        {meta}
      </div>
    )}
    {description && (
      <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
        {description}
      </p>
    )}
  </div>
);

export default EntityDetailHeader;
