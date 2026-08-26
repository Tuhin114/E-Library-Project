import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Boxes, Trash2 } from "lucide-react";
import {
  fetchCopies,
  addCopies,
  editCopy,
  removeCopy,
  clearCopies,
} from "../../store/slices/copiesSlice";
import {
  COPY_STATUS_OPTIONS,
  COPY_CONDITION_OPTIONS,
} from "../../constants/copyStatus";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../ui/table";
import { Skeleton } from "../ui/skeleton";
import EmptyState from "../common/EmptyState";
import ConfirmDialog from "../common/ConfirmDialog";
import CopyStatusBadge from "./CopyStatusBadge";

const InventoryPanel = ({ bookId }) => {
  const dispatch = useDispatch();
  const { items: copies, summary, status } = useSelector((state) => state.copies);

  const [addCount, setAddCount] = useState(1);
  const [addCondition, setAddCondition] = useState("new");
  const [isAdding, setIsAdding] = useState(false);
  const [pendingCopyId, setPendingCopyId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    dispatch(fetchCopies(bookId));
    return () => dispatch(clearCopies());
  }, [dispatch, bookId]);

  const handleAddCopies = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    await dispatch(
      addCopies({ bookId, payload: { count: Number(addCount), condition: addCondition } }),
    );
    setIsAdding(false);
    setAddCount(1);
  };

  const handleStatusChange = async (copyId, newStatus) => {
    setPendingCopyId(copyId);
    await dispatch(editCopy({ copyId, bookId, payload: { status: newStatus } }));
    setPendingCopyId(null);
  };

  const handleConditionChange = async (copyId, newCondition) => {
    setPendingCopyId(copyId);
    await dispatch(editCopy({ copyId, bookId, payload: { condition: newCondition } }));
    setPendingCopyId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setPendingCopyId(deleteTarget);
    await dispatch(removeCopy({ copyId: deleteTarget, bookId }));
    setPendingCopyId(null);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6 border-t border-border pt-6">
      <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
        Physical Inventory
      </h2>

      {summary && (
        <div className="flex flex-wrap gap-2 text-xs">
          {COPY_STATUS_OPTIONS.map(({ value, label }) => (
            <span
              key={value}
              className="rounded-full border border-border bg-secondary/30 px-3 py-1 font-medium text-muted-foreground"
            >
              {label}: <span className="text-foreground">{summary.breakdown[value] ?? 0}</span>
            </span>
          ))}
        </div>
      )}

      <form
        onSubmit={handleAddCopies}
        className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-secondary/20 p-4"
      >
        <div className="space-y-1.5">
          <Label htmlFor="add-copy-count">Copies to add</Label>
          <Input
            id="add-copy-count"
            type="number"
            min={1}
            max={50}
            value={addCount}
            onChange={(e) => setAddCount(e.target.value)}
            className="w-24"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="add-copy-condition">Condition</Label>
          <Select value={addCondition} onValueChange={setAddCondition}>
            <SelectTrigger id="add-copy-condition" className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COPY_CONDITION_OPTIONS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" isLoading={isAdding} size="sm">
          Add Copies
        </Button>
      </form>

      {status === "loading" && copies.length === 0 ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : copies.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title="No physical copies yet"
          description="Add copies above to start tracking physical inventory for this title."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Copy #</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {copies.map((copy) => (
              <TableRow key={copy._id}>
                <TableCell className="font-medium">{copy.copyNumber}</TableCell>
                <TableCell>
                  <Select
                    value={copy.status}
                    onValueChange={(value) => handleStatusChange(copy._id, value)}
                    disabled={pendingCopyId === copy._id}
                  >
                    <SelectTrigger className="h-8 w-32">
                      <SelectValue>
                        <CopyStatusBadge status={copy.status} />
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {COPY_STATUS_OPTIONS.map(({ value, label }) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={copy.condition}
                    onValueChange={(value) => handleConditionChange(copy._id, value)}
                    disabled={pendingCopyId === copy._id}
                  >
                    <SelectTrigger className="h-8 w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COPY_CONDITION_OPTIONS.map(({ value, label }) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(copy._id)}
                    disabled={pendingCopyId === copy._id}
                    aria-label="Remove copy"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Remove this copy?"
        description="This permanently removes the copy from inventory. Issued or reserved copies can't be removed."
        confirmLabel="Remove"
        onConfirm={handleDeleteConfirm}
        isLoading={pendingCopyId === deleteTarget}
      />
    </div>
  );
};

export default InventoryPanel;
