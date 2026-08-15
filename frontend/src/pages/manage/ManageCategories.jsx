import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LayoutGrid } from "lucide-react";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../store/slices/categoriesSlice";
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
import TableSkeleton from "../../components/common/TableSkeleton";
import CategoryForm from "../../components/forms/CategoryForm";
import ManagePageHeader from "../../components/manage/ManagePageHeader";
import ManageDataState from "../../components/manage/ManageDataState";
import RowActions from "../../components/manage/RowActions";
import PageContainer from "../../components/layout/PageContainer";

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
    <PageContainer>
      <ManagePageHeader
        title="Manage Categories"
        description="Create and organize the subjects books are grouped under."
        createLabel="New Category"
        onCreate={openCreateForm}
      />

      <ManageDataState
        status={status}
        items={items}
        icon={LayoutGrid}
        emptyTitle="No categories yet"
        emptyDescription="Create your first category to start organizing the catalog."
        createLabel="New Category"
        onCreate={openCreateForm}
        errorMessage="Couldn't load categories."
        onRetry={() => dispatch(fetchCategories())}
      >
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
                    <RowActions
                      onEdit={() => openEditForm(category)}
                      onDelete={() => setDeleteTarget(category)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>
      </ManageDataState>

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
    </PageContainer>
  );
};

export default ManageCategories;
