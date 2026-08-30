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

const ReportLostDialog = ({ open, onOpenChange, onConfirm, isLoading }) => {
  const [notes, setNotes] = useState("");

  const handleConfirm = () => {
    onConfirm({ notes: notes.trim() || undefined });
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report this copy lost?</DialogTitle>
          <DialogDescription>
            Closes out the loan and generates a replacement-cost fee for the student to
            review — they won't be charged or notified until you finalize it from the Fees
            page.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="lost-notes">Notes (optional)</Label>
          <Textarea
            id="lost-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={300}
            placeholder="e.g. student reported it missing after a move"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
            isLoading={isLoading}
          >
            Report Lost
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportLostDialog;
