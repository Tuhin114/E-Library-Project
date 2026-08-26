import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import RequestStatusBadge from "../requests/RequestStatusBadge";
import RequestDecisionDialog from "./RequestDecisionDialog";

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const RequestReviewCard = ({ request, onApprove, onReject, isActing }) => {
  const [dialogMode, setDialogMode] = useState(null); // "approve" | "reject" | null

  const { book, student, conflictContext, studentHistory } = request;
  const isPending = request.status === "pending";

  const handleConfirm = (text) => {
    if (dialogMode === "approve") onApprove(request._id, text);
    if (dialogMode === "reject") onReject(request._id, text);
    setDialogMode(null);
  };

  return (
    <Card className="p-4">
      <CardContent className="space-y-4 p-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <RequestStatusBadge status={request.status} />
              <span className="text-xs text-muted-foreground">{request.referenceCode}</span>
            </div>
            <Link
              to={`/books/${book?._id}`}
              className="mt-1.5 block truncate font-display text-base font-semibold text-foreground hover:underline"
            >
              {book?.title}
            </Link>
            <p className="text-sm text-muted-foreground">
              {student?.name} &middot; {student?.email}
            </p>
          </div>

          {isPending && (
            <div className="flex shrink-0 gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setDialogMode("reject")}
                disabled={isActing}
              >
                Reject
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => setDialogMode("approve")}
                disabled={isActing}
              >
                Approve
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-3 rounded-2xl border border-border bg-secondary/20 p-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Requested window
            </p>
            <p className="mt-1 text-foreground">
              {formatDate(request.requestedCollectionDate)} &rarr;{" "}
              {formatDate(request.requestedReturnDate)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Inventory
            </p>
            <p className="mt-1 text-foreground">
              {book?.physicalCopiesAvailable ?? 0} of {book?.physicalCopiesTotal ?? 0} copies
              currently available
            </p>
          </div>
        </div>

        {conflictContext?.overlappingApprovedCount > 0 && (
          <div className="flex items-start gap-2 rounded-2xl border border-warning/40 bg-warning/10 p-3 text-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <div>
              <p className="font-medium text-foreground">
                {conflictContext.overlappingApprovedCount} other approved{" "}
                {conflictContext.overlappingApprovedCount === 1 ? "request" : "requests"} overlap
                this window
              </p>
              <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                {conflictContext.overlappingApprovedRequests.map((r) => (
                  <li key={r._id}>
                    {r.student?.name} — {formatDate(r.requestedCollectionDate)} to{" "}
                    {formatDate(r.requestedReturnDate)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {studentHistory && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground">Student history:</span>
            <Badge variant="success">{studentHistory.approved} approved</Badge>
            <Badge variant="destructive">{studentHistory.rejected} rejected</Badge>
            <Badge variant="secondary">{studentHistory.cancelled} cancelled</Badge>
          </div>
        )}

        {request.status === "rejected" && request.decisionReason && (
          <p className="text-xs text-destructive">Rejected: {request.decisionReason}</p>
        )}
      </CardContent>

      <RequestDecisionDialog
        open={Boolean(dialogMode)}
        onOpenChange={(open) => !open && setDialogMode(null)}
        mode={dialogMode}
        onConfirm={handleConfirm}
        isLoading={isActing}
      />
    </Card>
  );
};

export default RequestReviewCard;
