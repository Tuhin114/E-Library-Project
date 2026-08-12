// FILE PATH: frontend/src/pages/manage/ManageAuthors.jsx
// STATUS: MODIFIED — replaces the Milestone 1 version of this file.
// WHAT CHANGED: same pattern as ManageCategories.jsx — TableSkeleton while
// loading, ErrorState with retry on failure.

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import {
  fetchAuthors,
  createAuthor,
  updateAuthor,
  deleteAuthor,
} from "../../store/slices/authorsSlice";
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
import AuthorForm from "../../components/forms/AuthorForm";

const ManageAuthors = () => {
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.authors);

  const [formOpen, setFormOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchAuthors());
  }, [dispatch]);

  const openCreateForm = () => {
    setEditingAuthor(null);
    setFormOpen(true);
  };

  const openEditForm = (author) => {
    setEditingAuthor(author);
    setFormOpen(true);
  };

  const handleSubmit = async (payload) => {
    setIsSubmitting(true);
    const action = editingAuthor
      ? updateAuthor({ id: editingAuthor._id, payload })
      : createAuthor(payload);
    const result = await dispatch(action);
    setIsSubmitting(false);
    if (!result.error) {
      setFormOpen(false);
      setEditingAuthor(null);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    await dispatch(deleteAuthor(deleteTarget._id));
    setIsSubmitting(false);
    setDeleteTarget(null);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          Manage Authors
        </h1>
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          New Author
        </Button>
      </div>

      {status === "failed" && (
        <ErrorState
          message="Couldn't load authors."
          onRetry={() => dispatch(fetchAuthors())}
        />
      )}

      {status !== "failed" && status === "succeeded" && items.length === 0 && (
        <EmptyState
          icon={Users}
          title="No authors yet"
          description="Create your first author to start building the catalog."
          action={
            <Button onClick={openCreateForm} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Author
            </Button>
          }
        />
      )}

      {status !== "failed" && (status === "loading" || items.length > 0) && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Nationality</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          {status === "loading" ? (
            <TableSkeleton rows={5} columns={3} />
          ) : (
            <TableBody>
              {items.map((author) => (
                <TableRow key={author._id}>
                  <TableCell className="font-medium">{author.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {author.nationality || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditForm(author)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(author)}
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
              {editingAuthor ? "Edit Author" : "New Author"}
            </DialogTitle>
          </DialogHeader>
          <AuthorForm
            defaultValues={editingAuthor}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel={editingAuthor ? "Update Author" : "Create Author"}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete author?"
        description={`This will permanently delete "${deleteTarget?.name}". This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default ManageAuthors;
