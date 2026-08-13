import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchBookById, clearSelectedBook } from "../../store/slices/booksSlice";
import { getBookFileBlob } from "../../services/bookService";
import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "../../constants/roles";
import { Button } from "../../components/ui/button";
import ReaderToolbar from "../../components/reader/ReaderToolbar";
import PdfViewer from "../../components/reader/PdfViewer";
import EpubViewer from "../../components/reader/EpubViewer";
import ReaderErrorState from "../../components/reader/ReaderErrorState";
import DownloadButton from "../../components/reader/DownloadButton";

const BookReader = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { selected: book, status } = useSelector((state) => state.books);

  const [fileUrl, setFileUrl] = useState(null);
  const [fileError, setFileError] = useState(null);

  useEffect(() => {
    dispatch(fetchBookById(id));
    return () => dispatch(clearSelectedBook());
  }, [dispatch, id]);

  const availableFormats = useMemo(() => {
    const formats = [];
    if (book?.digitalFiles?.pdf?.available) formats.push("pdf");
    if (book?.digitalFiles?.epub?.available) formats.push("epub");
    return formats;
  }, [book]);

  const requestedFormat = searchParams.get("format");
  const format = availableFormats.includes(requestedFormat)
    ? requestedFormat
    : availableFormats[0];

  // The book response only ever says a file is "available" — the
  // actual bytes come from the authenticated stream endpoint, fetched
  // as a blob since react-pdf/react-reader can't attach an
  // Authorization header to a plain network URL.
  useEffect(() => {
    if (!format) return undefined;

    let objectUrl;
    let cancelled = false;

    setFileUrl(null);
    setFileError(null);

    getBookFileBlob(id, format)
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
  }, [id, format]);

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

  const canDownload =
    book.visibility === "public" || user?.role === ROLES.LIBRARIAN;

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
      >
        {canDownload && (
          <DownloadButton
            bookId={id}
            type={format}
            filename={`${book.title}.${format}`}
          />
        )}
      </ReaderToolbar>

      <div className="min-h-0 flex-1">
        {fileError && <ReaderErrorState message={fileError} onBack={goBack} />}
        {!fileError && !fileUrl && (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Loading {format?.toUpperCase()}…
          </div>
        )}
        {!fileError && fileUrl && format === "pdf" && (
          <PdfViewer fileUrl={fileUrl} />
        )}
        {!fileError && fileUrl && format === "epub" && (
          <EpubViewer fileUrl={fileUrl} />
        )}
      </div>
    </div>
  );
};

export default BookReader;
