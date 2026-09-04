import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchResourceById,
  clearSelectedResource,
} from "../../store/slices/resourcesSlice";
import { getResourceFileBlob } from "../../services/resourceService";
import ReaderToolbar from "../../components/reader/ReaderToolbar";
import PdfViewer from "../../components/reader/PdfViewer";
import ReaderErrorState from "../../components/reader/ReaderErrorState";
import ResourceDownloadButton from "../../components/resources/ResourceDownloadButton";

/**
 * PDF-only, unlike BookReader.jsx — Resource has no EPUB path (M1's
 * FILE_LIMITS.resource only allows application/pdf), so there's no
 * format-switch control here.
 *
 * Deliberately no reading progress or bookmarks this milestone —
 * ReadingProgress/Bookmark (Phase 3 M4) are modeled against Book, and
 * extending them to Resource is a real, separate decision (a shared
 * polymorphic model vs. a parallel one) worth its own milestone rather
 * than folding in here. The reader remembers nothing between visits.
 */
const ResourceReader = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selected: resource, status } = useSelector(
    (state) => state.resources,
  );

  const [fileUrl, setFileUrl] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  useEffect(() => {
    dispatch(fetchResourceById(id));
    return () => dispatch(clearSelectedResource());
  }, [dispatch, id]);

  useEffect(() => {
    let objectUrl;
    let cancelled = false;

    setFileUrl(null);
    setFileError(null);

    getResourceFileBlob(id)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setFileUrl(objectUrl);
      })
      .catch((error) => {
        if (!cancelled) setFileError(error.message);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id]);

  const goBack = () => navigate(`/resources/${id}`);

  if (status === "loading" || !resource) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        Loading reader…
      </div>
    );
  }

  if (!resource.file?.available) {
    return (
      <div className="flex h-screen flex-col">
        <ReaderToolbar title={resource.title} onClose={goBack} />
        <ReaderErrorState
          message="No file has been attached to this resource yet."
          onBack={goBack}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <ReaderToolbar title={resource.title} onClose={goBack}>
        <ResourceDownloadButton
          resourceId={id}
          filename={`${resource.title}.pdf`}
        />
      </ReaderToolbar>

      <div className="min-h-0 flex-1">
        {fileError && <ReaderErrorState message={fileError} onBack={goBack} />}
        {!fileError && !fileUrl && (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Loading PDF…
          </div>
        )}
        {!fileError && fileUrl && (
          <PdfViewer
            fileUrl={fileUrl}
            pageNumber={pageNumber}
            onPageChange={setPageNumber}
          />
        )}
      </div>
    </div>
  );
};

export default ResourceReader;
