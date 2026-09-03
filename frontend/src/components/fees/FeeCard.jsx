import { useState } from "react";
import { Link } from "react-router-dom";
import { Hash, Download, Loader2 } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  FEE_STATUS_BADGE_VARIANT,
  FEE_STATUS_LABEL,
  FEE_TYPE_LABEL,
  PAYMENT_METHOD_LABEL,
} from "../../constants/feeStatus";
import { getFeeReceipt } from "../../services/feeService";
import { downloadBlob } from "../../lib/downloadBlob";
import { toast } from "../../hooks/useToast";

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const FeeCard = ({ fee, onPay, isPaying, onFinalize, onWaive, isActing }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadReceipt = async () => {
    setIsDownloading(true);
    try {
      const { blob, filename } = await getFeeReceipt(fee._id);
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
            <Badge variant={FEE_STATUS_BADGE_VARIANT[fee.status]}>
              {FEE_STATUS_LABEL[fee.status] ?? fee.status}
            </Badge>
            <Badge variant="outline">{FEE_TYPE_LABEL[fee.type] ?? fee.type}</Badge>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Hash className="h-3 w-3" />
              {fee.receiptReference}
            </span>
          </div>

          <Link
            to={`/books/${fee.book?._id}`}
            className="mt-2 block truncate font-display text-base font-semibold text-foreground hover:underline"
          >
            {fee.book?.title || "Book no longer available"}
          </Link>

          {fee.student?.name && (
            <p className="text-sm text-muted-foreground">
              {fee.student.name} &middot; {fee.student.email}
            </p>
          )}

          <p className="mt-2 text-sm text-muted-foreground">
            {fee.type === "late" ? (
              <>
                {fee.daysLate} {fee.daysLate === 1 ? "day" : "days"} late &middot;{" "}
              </>
            ) : null}
            <span className="font-semibold text-foreground">${fee.amount.toFixed(2)}</span>
          </p>

          {fee.status === "paid" && fee.paidAt && (
            <p className="mt-1 text-xs text-muted-foreground">
              {PAYMENT_METHOD_LABEL[fee.paymentMethod]} on {formatDate(fee.paidAt)}
            </p>
          )}

          {fee.status === "waived" && fee.waivedReason && (
            <p className="mt-1 text-xs text-muted-foreground">
              Waived on {formatDate(fee.waivedAt)}: {fee.waivedReason}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          {fee.status === "outstanding" && onPay && (
            <Button
              type="button"
              size="sm"
              onClick={() => onPay(fee._id)}
              disabled={isPaying}
              isLoading={isPaying}
            >
              Pay Now
            </Button>
          )}

          {fee.status === "pending_review" && onFinalize && (
            <Button
              type="button"
              size="sm"
              onClick={() => onFinalize(fee)}
              disabled={isActing}
            >
              Finalize
            </Button>
          )}

          {["pending_review", "outstanding"].includes(fee.status) && onWaive && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onWaive(fee)}
              disabled={isActing}
            >
              Waive
            </Button>
          )}

          {fee.status === "paid" && (
            <Button
              type="button"
              size="sm"
              variant="outline"
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

export default FeeCard;
