import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";

const RequestDecisionDialog = ({ open, onOpenChange, mode, onConfirm, isLoading }) => {
  const [text, setText] = useState("");

  const isReject = mode === "reject";

  const handleConfirm = () => {
    onConfirm(text.trim());
    setText("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isReject ? "Reject this request?" : "Approve this request?"}</DialogTitle>
          <DialogDescription>
            {isReject
              ? "The student will see this reason on their request."
              : "You can leave an optional note for the student's records."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="decision-text">
            {isReject ? "Reason (required)" : "Note (optional)"}
          </Label>
          <Textarea
            id="decision-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={300}
            placeholder={isReject ? "e.g. all copies are already promised for that period" : ""}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant={isReject ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isLoading || (isReject && text.trim().length < 5)}
            isLoading={isLoading}
          >
            {isReject ? "Reject" : "Approve"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RequestDecisionDialog;
