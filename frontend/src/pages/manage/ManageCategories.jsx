import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Pencil, Trash2, LayoutGrid } from "lucide-react";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../store/slices/categoriesSlice";
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
import CategoryForm from "../../components/forms/CategoryForm";

const ManageCategories = () => {
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.categories);

  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const openCreateForm = () => {
    setEditingCategory(null);
    setFormOpen(true);
  };

  const openEditForm = (category) => {
    setEditingCategory(category);
    setFormOpen(true);
  };

  const handleSubmit = async (payload) => {
    setIsSubmitting(true);
    const action = editingCategory
      ? updateCategory({ id: editingCategory._id, payload })
      : createCategory(payload);
    const result = await dispatch(action);
    setIsSubmitting(false);
    if (!result.error) {
      setFormOpen(false);
      setEditingCategory(null);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    await dispatch(deleteCategory(deleteTarget._id));
    setIsSubmitting(false);
    setDeleteTarget(null);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          Manage Categories
        </h1>
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          New Category
        </Button>
      </div>

      {status === "failed" && (
        <ErrorState
          message="Couldn't load categories."
          onRetry={() => dispatch(fetchCategories())}
        />
      )}

      {status !== "failed" && status === "succeeded" && items.length === 0 && (
        <EmptyState
          icon={LayoutGrid}
          title="No categories yet"
          description="Create your first category to start organizing the catalog."
          action={
            <Button onClick={openCreateForm} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Category
            </Button>
          }
        />
      )}

      {status !== "failed" && (status === "loading" || items.length > 0) && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          {status === "loading" ? (
            <TableSkeleton rows={5} columns={3} />
          ) : (
            <TableBody>
              {items.map((category) => (
                <TableRow key={category._id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {category.description || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditForm(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(category)}
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
              {editingCategory ? "Edit Category" : "New Category"}
            </DialogTitle>
          </DialogHeader>
          <CategoryForm
            defaultValues={editingCategory}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel={
              editingCategory ? "Update Category" : "Create Category"
            }
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete category?"
        description={`This will permanently delete "${deleteTarget?.name}". This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default ManageCategories;
