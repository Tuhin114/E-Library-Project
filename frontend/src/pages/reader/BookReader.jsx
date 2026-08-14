import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchBookById, clearSelectedBook } from "../../store/slices/booksSlice";
import { getBookFileBlob } from "../../services/bookService";
import * as readingService from "../../services/readingService";
import useReadingProgress from "../../hooks/useReadingProgress";
import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "../../constants/roles";
import { Bookmark } from "lucide-react";
import { Button } from "../../components/ui/button";
import ReaderToolbar from "../../components/reader/ReaderToolbar";
import PdfViewer from "../../components/reader/PdfViewer";
import EpubViewer from "../../components/reader/EpubViewer";
import ReaderErrorState from "../../components/reader/ReaderErrorState";
import DownloadButton from "../../components/reader/DownloadButton";
import BookmarkPanel from "../../components/reader/BookmarkPanel";

const BookReader = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { selected: book, status } = useSelector((state) => state.books);

  const [fileUrl, setFileUrl] = useState(null);
  const [fileError, setFileError] = useState(null);

  // `location` is a page number (pdf) or an EPUB CFI string (epub) —
  // owned here, not inside the viewers, so a saved-progress resume and
  // a bookmark "jump to" can both drive the same viewer instance.
  const [location, setLocation] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const [isBookmarkPanelOpen, setIsBookmarkPanelOpen] = useState(false);

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

  // Resolve the starting location for the active format: saved
  // progress if there is any (and it's for this format), otherwise
  // page 1 for a PDF or the book's start for an EPUB.
  useEffect(() => {
    if (!format) return;

    setTotalPages(null);
    setLocation(format === "pdf" ? 1 : null);

    readingService
      .getProgress(id)
      .then((progress) => {
        if (progress && progress.format === format) {
          setLocation(format === "pdf" ? Number(progress.location) : progress.location);
        }
      })
      .catch(() => {
        // No saved progress, or it failed to load — starting fresh is
        // a perfectly fine fallback either way.
      });
  }, [id, format]);

  // Fetch the active format as an authenticated blob and hand the
  // viewers an object URL — react-pdf/react-reader can't attach the
  // Authorization header a direct network URL would need.
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

  const percentComplete =
    format === "pdf" && totalPages && location
      ? Math.round((location / totalPages) * 100)
      : 0;

  useReadingProgress(id, format, location, percentComplete);

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

  const handleBookmarkJump = (bookmarkLocation) => {
    setLocation(format === "pdf" ? Number(bookmarkLocation) : bookmarkLocation);
  };

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
        <Button
          variant={isBookmarkPanelOpen ? "default" : "outline"}
          size="sm"
          onClick={() => setIsBookmarkPanelOpen((open) => !open)}
        >
          <Bookmark className="mr-2 h-4 w-4" />
          Bookmarks
        </Button>
        {canDownload && (
          <DownloadButton
            bookId={id}
            type={format}
            filename={`${book.title}.${format}`}
          />
        )}
      </ReaderToolbar>

      <div className="flex min-h-0 flex-1">
        <div className="min-h-0 flex-1">
          {fileError && <ReaderErrorState message={fileError} onBack={goBack} />}
          {!fileError && !fileUrl && (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Loading {format?.toUpperCase()}…
            </div>
          )}
          {!fileError && fileUrl && format === "pdf" && (
            <PdfViewer
              fileUrl={fileUrl}
              pageNumber={location || 1}
              onPageChange={setLocation}
              onDocumentLoad={setTotalPages}
            />
          )}
          {!fileError && fileUrl && format === "epub" && (
            <EpubViewer
              fileUrl={fileUrl}
              location={location}
              onLocationChange={setLocation}
            />
          )}
        </div>

        {isBookmarkPanelOpen && !fileError && fileUrl && (
          <BookmarkPanel
            bookId={id}
            format={format}
            currentLocation={location}
            onJumpTo={handleBookmarkJump}
            onClose={() => setIsBookmarkPanelOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default BookReader;
