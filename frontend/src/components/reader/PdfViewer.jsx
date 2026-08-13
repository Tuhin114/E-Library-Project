import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "../ui/button";
import ReaderErrorState from "./ReaderErrorState";

// Vite serves this worker as a static asset; matches the pdfjs-dist
// version react-pdf bundles internally.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const MIN_SCALE = 0.6;
const MAX_SCALE = 2.4;
const SCALE_STEP = 0.15;

const PdfViewer = ({ fileUrl }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.1);
  const [loadError, setLoadError] = useState(false);

  // Reset to page 1 when switching files (e.g. PDF <-> EPUB toggle then back).
  useEffect(() => {
    setPageNumber(1);
    setLoadError(false);
  }, [fileUrl]);

  if (loadError) {
    return (
      <ReaderErrorState message="This PDF couldn't be loaded. It may be missing or corrupted." />
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto bg-muted/40 py-6">
        <Document
          file={fileUrl}
          onLoadSuccess={({ numPages: total }) => setNumPages(total)}
          onLoadError={() => setLoadError(true)}
          loading={
            <div className="py-20 text-center text-sm text-muted-foreground">
              Loading PDF…
            </div>
          }
          className="flex justify-center"
        >
          <Page pageNumber={pageNumber} scale={scale} renderAnnotationLayer renderTextLayer />
        </Document>
      </div>

      <div className="flex items-center justify-center gap-4 border-t border-border bg-background px-4 py-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
          disabled={pageNumber <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {pageNumber}
          {numPages ? ` of ${numPages}` : ""}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            setPageNumber((p) => (numPages ? Math.min(numPages, p + 1) : p + 1))
          }
          disabled={numPages ? pageNumber >= numPages : false}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <div className="mx-2 h-5 w-px bg-border" />

        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            setScale((s) => Math.max(MIN_SCALE, +(s - SCALE_STEP).toFixed(2)))
          }
          disabled={scale <= MIN_SCALE}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="w-12 text-center text-sm text-muted-foreground">
          {Math.round(scale * 100)}%
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            setScale((s) => Math.min(MAX_SCALE, +(s + SCALE_STEP).toFixed(2)))
          }
          disabled={scale >= MAX_SCALE}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PdfViewer;
