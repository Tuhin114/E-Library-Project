import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Copy } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import ReturnDialog from "../manage/ReturnDialog";

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const LoanCard = ({ loan, onReturn, isReturning, onRenew, isRenewing }) => {
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);

  const handleConfirmReturn = (payload) => {
    onReturn(loan._id, payload);
    setIsReturnDialogOpen(false);
  };

  return (
    <Card className="p-4">
      <CardContent className="p-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={loan.status === "active" ? "default" : "secondary"} className="capitalize">
                {loan.status}
              </Badge>
              {loan.isOverdue && (
                <Badge variant="destructive">
                  Overdue{loan.daysOverdue ? ` — ${loan.daysOverdue}d` : ""}
                </Badge>
              )}
              {loan.status === "returned" && loan.returnCondition && (
                <Badge variant="secondary" className="capitalize">
                  Returned {loan.returnCondition}
                </Badge>
              )}
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
              {loan.status === "active" ? (
                <span className={loan.isOverdue ? "font-medium text-destructive" : ""}>
                  Due {formatDate(loan.dueDate)}
                </span>
              ) : (
                <span>Returned {formatDate(loan.returnedAt)}</span>
              )}
              {loan.renewalCount > 0 && (
                <span>Renewed {loan.renewalCount}x</span>
              )}
            </div>

            {/* M2 (Phase 7) — shown whenever the loan carries a
                renewalEligibility (attached server-side only for active
                loans, see loanService.listLoansForStudent), so the
                reason a blocked Renew button is disabled is visible
                up front rather than only surfacing after a failed click. */}
            {onRenew && loan.renewalEligibility && !loan.renewalEligibility.canRenew && (
              <p className="mt-1 text-xs text-muted-foreground">
                {loan.renewalEligibility.reason}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {loan.status === "active" && onRenew && (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => onRenew(loan._id)}
                disabled={isRenewing || (loan.renewalEligibility && !loan.renewalEligibility.canRenew)}
              >
                {isRenewing ? "Renewing..." : "Renew"}
              </Button>
            )}

            {loan.status === "active" && onReturn && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setIsReturnDialogOpen(true)}
                disabled={isReturning}
              >
                Process Return
              </Button>
            )}
          </div>
        </div>
      </CardContent>

      <ReturnDialog
        open={isReturnDialogOpen}
        onOpenChange={setIsReturnDialogOpen}
        onConfirm={handleConfirmReturn}
        isLoading={isReturning}
      />
    </Card>
  );
};

export default LoanCard;
