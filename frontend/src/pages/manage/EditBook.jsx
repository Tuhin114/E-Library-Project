import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchBookById,
  updateBook,
  clearSelectedBook,
  uploadCoverImage,
  deleteCoverImage,
  uploadDigitalFile,
  deleteDigitalFile,
} from "../../store/slices/booksSlice";
import { toBookPayload } from "../../lib/validationSchemas/bookSchema";
import BookForm from "../../components/forms/BookForm";
import FileDropzone from "../../components/common/FileDropzone";
import { Skeleton } from "../../components/ui/skeleton";
import ErrorState from "../../components/common/ErrorState";
import PageContainer from "../../components/layout/PageContainer";
import PageHeader from "../../components/layout/PageHeader";

const toFormValues = (book) => ({
  title: book.title,
  subtitle: book.subtitle || "",
  isbn: book.isbn,
  description: book.description || "",
  language: book.language,
  edition: book.edition || "",
  publicationYear: book.publicationYear,
  numberOfPages: book.numberOfPages,
  category: book.category?._id || "",
  authors: (book.authors || []).map((author) => author._id),
  publisher: book.publisher?._id || "",
  tagsInput: (book.tags || []).join(", "),
  visibility: book.visibility,
  status: book.status,
});

const EditBook = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selected: book, status } = useSelector((state) => state.books);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingField, setUploadingField] = useState(null);

  useEffect(() => {
    dispatch(fetchBookById(id));
    return () => dispatch(clearSelectedBook());
  }, [dispatch, id]);

  const defaultValues = useMemo(
    () => (book ? toFormValues(book) : undefined),
    [book],
  );

  const handleSubmit = async (formValues) => {
    setIsSubmitting(true);
    const payload = toBookPayload(formValues);
    const result = await dispatch(updateBook({ id, payload }));
    setIsSubmitting(false);

    if (!result.error) {
      navigate("/manage/books");
    }
  };

  const handleCoverUpload = async (file) => {
    setUploadingField("cover");
    await dispatch(uploadCoverImage({ id, file }));
    setUploadingField(null);
  };

  const handleCoverDelete = async () => {
    setUploadingField("cover");
    await dispatch(deleteCoverImage(id));
    setUploadingField(null);
  };

  const handleDigitalUpload = (type) => async (file) => {
    setUploadingField(type);
    await dispatch(uploadDigitalFile({ id, type, file }));
    setUploadingField(null);
  };

  const handleDigitalDelete = (type) => async () => {
    setUploadingField(type);
    await dispatch(deleteDigitalFile({ id, type }));
    setUploadingField(null);
  };

  if (status === "loading" || status === "idle") {
    return (
      <PageContainer>
        <div className="max-w-3xl space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </PageContainer>
    );
  }

  if (status === "failed" || !book) {
    return (
      <PageContainer>
        <ErrorState
          message="Couldn't load this book. It may have been deleted."
          onRetry={() => dispatch(fetchBookById(id))}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Edit Book" description={book.title} />

      <div className="max-w-3xl space-y-10">
        <BookForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Update Book"
        />

        <div className="space-y-6 border-t border-border pt-6">
          <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
            Digital Files
          </h2>

          <FileDropzone
            label="Cover Image"
            fileType="cover"
            currentFile={book.coverImage}
            onUpload={handleCoverUpload}
            onDelete={handleCoverDelete}
            isProcessing={uploadingField === "cover"}
          />

          <FileDropzone
            label="PDF File"
            fileType="pdf"
            currentFile={book.digitalFiles?.pdf}
            onUpload={handleDigitalUpload("pdf")}
            onDelete={handleDigitalDelete("pdf")}
            isProcessing={uploadingField === "pdf"}
          />

          <FileDropzone
            label="EPUB File"
            fileType="epub"
            currentFile={book.digitalFiles?.epub}
            onUpload={handleDigitalUpload("epub")}
            onDelete={handleDigitalDelete("epub")}
            isProcessing={uploadingField === "epub"}
          />
        </div>
      </div>
    </PageContainer>
  );
};

export default EditBook;
