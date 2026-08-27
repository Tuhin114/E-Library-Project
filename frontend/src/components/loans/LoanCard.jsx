import { Link } from "react-router-dom";
import { Calendar, Copy } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const LoanCard = ({ loan }) => (
  <Card className="p-4">
    <CardContent className="p-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={loan.status === "active" ? "default" : "secondary"} className="capitalize">
              {loan.status}
            </Badge>
            {loan.isOverdue && <Badge variant="destructive">Overdue</Badge>}
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Copy className="h-3 w-3" />
              Copy {loan.copy?.copyNumber}
            </span>
          </div>

          <Link
            to={`/books/${loan.book?._id}`}
            className="mt-2 block truncate font-display text-base font-semibold text-foreground hover:underline"
          >
            {loan.book?.title || "Book no longer available"}
          </Link>

          {loan.student?.name && (
            <p className="text-sm text-muted-foreground">
              {loan.student.name} &middot; {loan.student.email}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Collected {formatDate(loan.collectedAt)}
            </span>
            <span className={loan.isOverdue ? "font-medium text-destructive" : ""}>
              Due {formatDate(loan.dueDate)}
            </span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default LoanCard;
