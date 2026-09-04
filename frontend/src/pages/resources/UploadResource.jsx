import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { createResource } from "../../store/slices/resourcesSlice";
import { toResourcePayload } from "../../lib/validationSchemas/resourceSchema";
import ResourceForm from "../../components/resources/ResourceForm";
import PageContainer from "../../components/layout/PageContainer";
import PageHeader from "../../components/layout/PageHeader";

const UploadResource = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formValues) => {
    setIsSubmitting(true);
    const result = await dispatch(
      createResource(toResourcePayload(formValues)),
    );
    setIsSubmitting(false);

    if (createResource.fulfilled.match(result)) {
      navigate(`/resources/${result.payload._id}/edit`, { replace: true });
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Upload a Resource"
        description="Share an e-journal, research paper or set of notes. You can attach the PDF file once this is saved."
      />
      <div className="max-w-2xl">
        <ResourceForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Save & Continue"
        />
      </div>
    </PageContainer>
  );
};

export default UploadResource;
