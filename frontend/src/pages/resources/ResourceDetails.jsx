import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FileText, Pencil, Trash2, Lock, Globe } from "lucide-react";
import {
  fetchResourceById,
  deleteResource,
  clearSelectedResource,
} from "../../store/slices/resourcesSlice";
import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "../../constants/roles";
import { RESOURCE_TYPE_LABELS } from "../../constants/resourceType";
import PageContainer from "../../components/layout/PageContainer";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import ErrorState from "../../components/common/ErrorState";
import { Skeleton } from "../../components/ui/skeleton";

const ResourceDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    selected: resource,
    status,
    error,
  } = useSelector((state) => state.resources);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchResourceById(id));
    return () => dispatch(clearSelectedResource());
  }, [dispatch, id]);

  if (status === "loading" && !resource) {
    return (
      <PageContainer>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </PageContainer>
    );
  }

  if (status === "failed" && !resource) {
    return (
      <PageContainer>
        <ErrorState message={error || "Resource not found"} />
      </PageContainer>
    );
  }

  if (!resource) return null;

  const isOwner = resource.uploadedBy?._id === user?._id;
  const canModify = isOwner || user?.role === ROLES.LIBRARIAN;
  const isPrivate = resource.visibility === "private";

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await dispatch(deleteResource(id));
    setIsDeleting(false);
    if (deleteResource.fulfilled.match(result)) {
      navigate("/resources", { replace: true });
    }
  };

  return (
    <PageContainer>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-secondary">
            <FileText
              className="h-7 w-7 text-muted-foreground"
              strokeWidth={1.5}
            />
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                {RESOURCE_TYPE_LABELS[resource.resourceType]}
              </Badge>
              {resource.subject && (
                <Badge variant="outline">{resource.subject}</Badge>
              )}
              {canModify && (
                <Badge
                  variant={isPrivate ? "secondary" : "default"}
                  className="gap-1"
                >
                  {isPrivate ? (
                    <Lock className="h-3 w-3" />
                  ) : (
                    <Globe className="h-3 w-3" />
                  )}
                  {isPrivate ? "Private" : "Public"}
                </Badge>
              )}
            </div>

            <h1 className="font-display text-2xl font-bold text-foreground">
              {resource.title}
            </h1>

            {resource.authors?.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {resource.authors.join(", ")}
              </p>
            )}

            <p className="text-xs text-muted-foreground">
              Uploaded by {resource.uploadedBy?.name || "Unknown"}
            </p>
          </div>
        </div>

        {resource.description && (
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-2 font-display text-sm font-semibold text-foreground">
              Description
            </h2>
            <p className="whitespace-pre-line text-sm text-muted-foreground">
              {resource.description}
            </p>
          </div>
        )}

        <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
          {resource.file?.available
            ? "A file is attached to this resource. Reading and downloading it comes in the next milestone."
            : "No file has been attached to this resource yet."}
        </div>

        {canModify && (
          <div className="flex gap-2">
            <Link to={`/resources/${id}/edit`}>
              <Button variant="outline" className="gap-2">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            </Link>
            <Button
              variant="destructive"
              className="gap-2"
              onClick={() => setIsConfirmOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Delete this resource?"
        description="This action cannot be undone. The attached file, if any, will also be removed."
        confirmLabel="Delete"
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />
    </PageContainer>
  );
};

export default ResourceDetails;
