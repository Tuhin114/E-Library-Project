import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Hash, Sparkles, Download, Loader2 } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import RequestStatusBadge from "./RequestStatusBadge";
import { getRequestReceipt } from "../../services/requestService";
import { downloadBlob } from "../../lib/downloadBlob";
import { toast } from "../../hooks/useToast";

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const RequestCard = ({ request, onCancel, isCancelling }) => {
  const canCancel = ["pending", "approved"].includes(request.status);
  const canDownloadReceipt = ["approved", "collected"].includes(request.status);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadReceipt = async () => {
    setIsDownloading(true);
    try {
      const { blob, filename } = await getRequestReceipt(request._id);
      downloadBlob(blob, filename);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className="p-4">
      <CardContent className="p-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <RequestStatusBadge status={request.status} />
              {request.autoApproved && (
                <Badge variant="default" className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Auto-approved
                </Badge>
              )}
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Hash className="h-3 w-3" />
                {request.referenceCode}
              </span>
            </div>

            <Link
              to={`/books/${request.book?._id}`}
              className="mt-2 block truncate font-display text-base font-semibold text-foreground hover:underline"
            >
              {request.book?.title || "Book no longer available"}
            </Link>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Collect {formatDate(request.requestedCollectionDate)}
              </span>
              <span>Return by {formatDate(request.requestedReturnDate)}</span>
            </div>

            {request.status === "rejected" && request.decisionReason && (
              <p className="mt-2 text-xs text-destructive">
                Reason: {request.decisionReason}
              </p>
            )}
            {request.status === "approved" && request.decisionReason && (
              <p className="mt-2 text-xs text-muted-foreground">
                Librarian note: {request.decisionReason}
              </p>
            )}
            {request.status === "collected" && (
              <p className="mt-2 text-xs text-muted-foreground">
                Collected — see{" "}
                <Link to="/loans" className="underline">
                  My Loans
                </Link>{" "}
                for the active due date.
              </p>
            )}
            {request.status === "expired" && (
              <p className="mt-2 text-xs text-muted-foreground">
                This request expired because it wasn't collected in time.
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-start gap-2">
            {canCancel && onCancel && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={() => onCancel(request._id)}
                disabled={isCancelling}
              >
                {isCancelling ? "Cancelling..." : "Cancel"}
              </Button>
            )}

            {canDownloadReceipt && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={handleDownloadReceipt}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                )}
                Receipt
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RequestCard;
