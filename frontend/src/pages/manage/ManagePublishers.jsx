import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Building2 } from "lucide-react";
import {
  fetchPublishers,
  createPublisher,
  updatePublisher,
  deletePublisher,
} from "../../store/slices/publishersSlice";
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
import PublisherForm from "../../components/forms/PublisherForm";
import ManagePageHeader from "../../components/manage/ManagePageHeader";
import ManageDataState from "../../components/manage/ManageDataState";
import RowActions from "../../components/manage/RowActions";
import PageContainer from "../../components/layout/PageContainer";

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
    <PageContainer>
      <ManagePageHeader
        title="Manage Publishers"
        description="Create and maintain the publishers in the catalog."
        createLabel="New Publisher"
        onCreate={openCreateForm}
      />

      <ManageDataState
        status={status}
        items={items}
        icon={Building2}
        emptyTitle="No publishers yet"
        emptyDescription="Create your first publisher to start building the catalog."
        createLabel="New Publisher"
        onCreate={openCreateForm}
        errorMessage="Couldn't load publishers."
        onRetry={() => dispatch(fetchPublishers())}
      >
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
                    <RowActions
                      onEdit={() => openEditForm(publisher)}
                      onDelete={() => setDeleteTarget(publisher)}
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
    </PageContainer>
  );
};

export default ManagePublishers;
