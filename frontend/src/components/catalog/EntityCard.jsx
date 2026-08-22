import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";

/**
 * Shared grid tile for Categories/Authors/Publishers list pages — same
 * name + count + optional description shape across all three, kept in
 * one place instead of three near-identical Card blocks.
 */
const EntityCard = ({ to, title, countLabel, description }) => (
  <Link to={to}>
    <Card interactive className="h-full">
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <CardTitle className="font-display text-base">{title}</CardTitle>
        {countLabel && (
          <Badge variant="secondary" className="shrink-0">
            {countLabel}
          </Badge>
        )}
      </CardHeader>
      {description && (
        <CardContent className="line-clamp-3 text-sm text-muted-foreground">
          {description}
        </CardContent>
      )}
    </Card>
  </Link>
);

export default EntityCard;
