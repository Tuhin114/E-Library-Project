import { useState } from "react";
import { useDispatch } from "react-redux";
import { submitRequest } from "../../store/slices/requestsSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

const todayIso = () => new Date().toISOString().split("T")[0];

const RequestForm = ({ open, onOpenChange, book }) => {
  const dispatch = useDispatch();

  const [collectionDate, setCollectionDate] = useState(todayIso());
  const [returnDate, setReturnDate] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await dispatch(
      submitRequest({
        book: book._id,
        requestedCollectionDate: collectionDate,
        requestedReturnDate: returnDate,
        studentNote: note,
      }),
    );
    setIsSubmitting(false);
    if (submitRequest.fulfilled.match(result)) {
      onOpenChange(false);
      setNote("");
      setReturnDate("");
      setCollectionDate(todayIso());
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request a physical copy</DialogTitle>
          <DialogDescription>
            {book?.title} — choose when you'll collect it and when you plan to return it.
            A librarian will review and approve your request.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="collection-date">Collection date</Label>
            <Input
              id="collection-date"
              type="date"
              min={todayIso()}
              value={collectionDate}
              onChange={(e) => setCollectionDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="return-date">Return date</Label>
            <Input
              id="return-date"
              type="date"
              min={collectionDate}
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="student-note">Note (optional)</Label>
            <Textarea
              id="student-note"
              placeholder="e.g. needed for a lab session"
              maxLength={300}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Submit request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RequestForm;
