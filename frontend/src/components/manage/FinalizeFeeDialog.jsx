import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Same dialog-component pattern already used for request rejection
// (RequestDecisionDialog) and returns (ReturnDialog) — reused here
// rather than building a new one, per the plan's own instruction.
const FinalizeFeeDialog = ({ open, onOpenChange, fee, onConfirm, isLoading }) => {
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (fee) setAmount(String(fee.amount));
  }, [fee]);

  const handleConfirm = () => {
    onConfirm(Number(amount));
  };

  const parsedAmount = Number(amount);
  const isValid = amount !== "" && !Number.isNaN(parsedAmount) && parsedAmount >= 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Finalize this fee</DialogTitle>
          <DialogDescription>
            Confirm or adjust the amount before it's charged to the student. They won't be
            notified until you finalize.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="finalize-amount">Amount ($)</Label>
          <Input
            id="finalize-amount"
            type="number"
            min={0}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          {fee?.replacementCost != null && (
            <p className="text-xs text-muted-foreground">
              Prefilled from {fee.book?.title ? "this book's" : "the library's default"}{" "}
              replacement cost (${fee.replacementCost.toFixed(2)}) — adjust if the actual cost
              differs.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading || !isValid} isLoading={isLoading}>
            Finalize & Charge
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FinalizeFeeDialog;
