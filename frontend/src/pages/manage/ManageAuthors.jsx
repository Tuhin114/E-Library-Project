import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Users } from "lucide-react";
import {
  fetchAuthors,
  createAuthor,
  updateAuthor,
  deleteAuthor,
} from "../../store/slices/authorsSlice";
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
import AuthorForm from "../../components/forms/AuthorForm";
import ManagePageHeader from "../../components/manage/ManagePageHeader";
import ManageDataState from "../../components/manage/ManageDataState";
import RowActions from "../../components/manage/RowActions";
import PageContainer from "../../components/layout/PageContainer";

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
    <PageContainer>
      <ManagePageHeader
        title="Manage Authors"
        description="Create and maintain the roster of authors in the catalog."
        createLabel="New Author"
        onCreate={openCreateForm}
      />

      <ManageDataState
        status={status}
        items={items}
        icon={Users}
        emptyTitle="No authors yet"
        emptyDescription="Create your first author to start building the catalog."
        createLabel="New Author"
        onCreate={openCreateForm}
        errorMessage="Couldn't load authors."
        onRetry={() => dispatch(fetchAuthors())}
      >
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
                    <RowActions
                      onEdit={() => openEditForm(author)}
                      onDelete={() => setDeleteTarget(author)}
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
    </PageContainer>
  );
};

export default ManageAuthors;
