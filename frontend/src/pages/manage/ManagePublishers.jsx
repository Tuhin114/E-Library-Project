import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Pencil, Trash2, Building2 } from "lucide-react";
import {
  fetchPublishers,
  createPublisher,
  updatePublisher,
  deletePublisher,
} from "../../store/slices/publishersSlice";
import { Button } from "../../components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import TableSkeleton from "../../components/common/TableSkeleton";
import PublisherForm from "../../components/forms/PublisherForm";

const ManagePublishers = () => {
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.publishers);

  const [formOpen, setFormOpen] = useState(false);
  const [editingPublisher, setEditingPublisher] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchPublishers());
  }, [dispatch]);

  const openCreateForm = () => {
    setEditingPublisher(null);
    setFormOpen(true);
  };

  const openEditForm = (publisher) => {
    setEditingPublisher(publisher);
    setFormOpen(true);
  };

  const handleSubmit = async (payload) => {
    setIsSubmitting(true);
    const action = editingPublisher
      ? updatePublisher({ id: editingPublisher._id, payload })
      : createPublisher(payload);
    const result = await dispatch(action);
    setIsSubmitting(false);
    if (!result.error) {
      setFormOpen(false);
      setEditingPublisher(null);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    await dispatch(deletePublisher(deleteTarget._id));
    setIsSubmitting(false);
    setDeleteTarget(null);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          Manage Publishers
        </h1>
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          New Publisher
        </Button>
      </div>

      {status === "failed" && (
        <ErrorState
          message="Couldn't load publishers."
          onRetry={() => dispatch(fetchPublishers())}
        />
      )}

      {status !== "failed" && status === "succeeded" && items.length === 0 && (
        <EmptyState
          icon={Building2}
          title="No publishers yet"
          description="Create your first publisher to start building the catalog."
          action={
            <Button onClick={openCreateForm} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Publisher
            </Button>
          }
        />
      )}

      {status !== "failed" && (status === "loading" || items.length > 0) && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Country</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          {status === "loading" ? (
            <TableSkeleton rows={5} columns={3} />
          ) : (
            <TableBody>
              {items.map((publisher) => (
                <TableRow key={publisher._id}>
                  <TableCell className="font-medium">
                    {publisher.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {publisher.country || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditForm(publisher)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(publisher)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPublisher ? "Edit Publisher" : "New Publisher"}
            </DialogTitle>
          </DialogHeader>
          <PublisherForm
            defaultValues={editingPublisher}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel={
              editingPublisher ? "Update Publisher" : "Create Publisher"
            }
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete publisher?"
        description={`This will permanently delete "${deleteTarget?.name}". This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default ManagePublishers;
