import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const WaiveFeeDialog = ({ open, onOpenChange, onConfirm, isLoading }) => {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    onConfirm(reason.trim());
    setReason("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Waive this fee?</DialogTitle>
          <DialogDescription>
            The student will see this reason on their account. This can't be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="waive-reason">Reason (required)</Label>
          <Textarea
            id="waive-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={300}
            placeholder="e.g. damage predates this loan, confirmed against prior condition photos"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading || reason.trim().length < 5}
            isLoading={isLoading}
          >
            Waive Fee
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WaiveFeeDialog;
