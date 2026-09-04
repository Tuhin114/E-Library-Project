import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchResourceById,
  updateResource,
  uploadResourceFile,
  deleteResourceFile,
  clearSelectedResource,
} from "../../store/slices/resourcesSlice";
import { toResourcePayload } from "../../lib/validationSchemas/resourceSchema";
import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "../../constants/roles";
import ResourceForm from "../../components/resources/ResourceForm";
import FileDropzone from "../../components/common/FileDropzone";
import PageContainer from "../../components/layout/PageContainer";
import PageHeader from "../../components/layout/PageHeader";
import ErrorState from "../../components/common/ErrorState";
import { Skeleton } from "../../components/ui/skeleton";

const toFormValues = (resource) => ({
  title: resource.title,
  description: resource.description || "",
  resourceType: resource.resourceType,
  subject: resource.subject || "",
  authorsInput: (resource.authors || []).join(", "),
  tagsInput: (resource.tags || []).join(", "),
  visibility: resource.visibility,
});

const EditResource = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    selected: resource,
    status,
    error,
  } = useSelector((state) => state.resources);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFileBusy, setIsFileBusy] = useState(false);

  useEffect(() => {
    dispatch(fetchResourceById(id));
    return () => dispatch(clearSelectedResource());
  }, [dispatch, id]);

  const canModify =
    resource &&
    user &&
    (resource.uploadedBy?._id === user._id || user.role === ROLES.LIBRARIAN);

  useEffect(() => {
    if (resource && !canModify) {
      navigate(`/resources/${id}`, { replace: true });
    }
  }, [resource, canModify, id, navigate]);

  const handleSubmit = async (formValues) => {
    setIsSubmitting(true);
    await dispatch(
      updateResource({ id, payload: toResourcePayload(formValues) }),
    );
    setIsSubmitting(false);
  };

  const handleUpload = async (file) => {
    setIsFileBusy(true);
    await dispatch(uploadResourceFile({ id, file }));
    setIsFileBusy(false);
  };

  const handleFileDelete = async () => {
    setIsFileBusy(true);
    await dispatch(deleteResourceFile(id));
    setIsFileBusy(false);
  };

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

  if (!resource || !canModify) return null;

  return (
    <PageContainer>
      <PageHeader
        title="Edit Resource"
        description="Update the details below, or attach/replace the PDF file."
      />
      <div className="max-w-2xl space-y-8">
        <ResourceForm
          defaultValues={toFormValues(resource)}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Save Changes"
        />

        <FileDropzone
          label="PDF File"
          fileType="resource"
          currentFile={resource.file}
          onUpload={handleUpload}
          onDelete={handleFileDelete}
          isProcessing={isFileBusy}
        />
      </div>
    </PageContainer>
  );
};

export default EditResource;
