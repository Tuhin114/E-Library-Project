import { Link } from "react-router-dom";
import { Hash } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  FEE_STATUS_BADGE_VARIANT,
  PAYMENT_METHOD_LABEL,
} from "../../constants/feeStatus";

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const FeeCard = ({ fee, onPay, isPaying }) => (
  <Card className="p-4">
    <CardContent className="p-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={FEE_STATUS_BADGE_VARIANT[fee.status]} className="capitalize">
              {fee.status}
            </Badge>
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
            {fee.daysLate} {fee.daysLate === 1 ? "day" : "days"} late &middot;{" "}
            <span className="font-semibold text-foreground">${fee.amount.toFixed(2)}</span>
          </p>

          {fee.status === "paid" && fee.paidAt && (
            <p className="mt-1 text-xs text-muted-foreground">
              {PAYMENT_METHOD_LABEL[fee.paymentMethod]} on {formatDate(fee.paidAt)}
            </p>
          )}
        </div>

        {fee.status === "outstanding" && onPay && (
          <Button
            type="button"
            size="sm"
            className="shrink-0"
            onClick={() => onPay(fee._id)}
            disabled={isPaying}
            isLoading={isPaying}
          >
            Pay Now
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
);

export default FeeCard;
