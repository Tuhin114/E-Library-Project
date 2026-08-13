import { useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchBookById, clearSelectedBook } from "../../store/slices/booksSlice";
import { Button } from "../../components/ui/button";
import ReaderToolbar from "../../components/reader/ReaderToolbar";
import PdfViewer from "../../components/reader/PdfViewer";
import EpubViewer from "../../components/reader/EpubViewer";
import ReaderErrorState from "../../components/reader/ReaderErrorState";

const BookReader = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { selected: book, status } = useSelector((state) => state.books);

  useEffect(() => {
    dispatch(fetchBookById(id));
    return () => dispatch(clearSelectedBook());
  }, [dispatch, id]);

  const availableFormats = useMemo(() => {
    const formats = [];
    if (book?.digitalFiles?.pdf?.url) formats.push("pdf");
    if (book?.digitalFiles?.epub?.url) formats.push("epub");
    return formats;
  }, [book]);

  const requestedFormat = searchParams.get("format");
  const format = availableFormats.includes(requestedFormat)
    ? requestedFormat
    : availableFormats[0];

  const goBack = () => navigate(`/books/${id}`);

  if (status === "loading" || !book) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        Loading reader…
      </div>
    );
  }

  if (availableFormats.length === 0) {
    return (
      <div className="flex h-screen flex-col">
        <ReaderToolbar title={book.title} onClose={goBack} />
        <ReaderErrorState
          message="No digital copy is available for this book yet."
          onBack={goBack}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <ReaderToolbar
        title={book.title}
        onClose={goBack}
        formatSwitch={
          availableFormats.length > 1 && (
            <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
              {availableFormats.map((f) => (
                <Button
                  key={f}
                  variant={f === format ? "default" : "ghost"}
                  size="sm"
                  className="h-7 px-2 text-xs uppercase"
                  onClick={() => setSearchParams({ format: f })}
                >
                  {f}
                </Button>
              ))}
            </div>
          )
        }
      />

      <div className="min-h-0 flex-1">
        {format === "pdf" && <PdfViewer fileUrl={book.digitalFiles.pdf.url} />}
        {format === "epub" && <EpubViewer fileUrl={book.digitalFiles.epub.url} />}
      </div>
    </div>
  );
};

export default BookReader;
