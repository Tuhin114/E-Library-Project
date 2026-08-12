import { useRef, useState } from "react";
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  X,
  Loader2,
} from "lucide-react";
import { FILE_LIMITS } from "../../constants/fileUploadLimits";
import { Button } from "../ui/button";
import { toast } from "../../hooks/useToast";

const ICONS = { cover: ImageIcon, pdf: FileText, epub: FileText };

/**
 * Reusable drag-and-drop (or click-to-browse) upload control. Used for
 * cover image, PDF, and EPUB uploads on the Edit Book page.
 *
 * Controlled/stateless by design — the parent owns the actual upload/delete
 * network calls (via Redux thunks) and passes them in as `onUpload`/`onDelete`.
 * This component only handles drag/drop UX, client-side validation, and
 * showing the current file if one exists.
 *
 * Props:
 * - label: string — field label shown above the control
 * - fileType: 'cover' | 'pdf' | 'epub' — determines validation rules
 * - currentFile: { url, originalName } | undefined — existing uploaded file
 * - onUpload: (file: File) => void
 * - onDelete: () => void
 * - isProcessing: boolean — disables interaction and shows a spinner
 */
const FileDropzone = ({
  label,
  fileType,
  currentFile,
  onUpload,
  onDelete,
  isProcessing = false,
}) => {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const limits = FILE_LIMITS[fileType];
  const Icon = ICONS[fileType] || UploadCloud;

  const validateAndUpload = (file) => {
    if (!file) return;

    if (!limits.allowedMimeTypes.includes(file.type)) {
      toast.error(
        `Invalid file type. Allowed: ${limits.allowedMimeTypes.join(", ")}`,
      );
      return;
    }

    const maxBytes = limits.maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error(`File is too large. Max size is ${limits.maxSizeMB}MB.`);
      return;
    }

    onUpload(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    if (isProcessing) return;
    validateAndUpload(event.dataTransfer.files?.[0]);
  };

  const handleBrowseClick = () => {
    if (!isProcessing) inputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>

      {currentFile?.url ? (
        <div className="flex items-center justify-between rounded-md border border-border p-3">
          <div className="flex items-center gap-2 overflow-hidden">
            <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
            <a
              href={currentFile.url}
              target="_blank"
              rel="noreferrer"
              className="truncate text-sm text-primary hover:underline"
            >
              {currentFile.originalName || "View file"}
            </a>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDelete}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4 text-destructive" />
            )}
          </Button>
        </div>
      ) : (
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
          role="button"
          tabIndex={0}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed p-6 text-center transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:bg-accent"
          }`}
        >
          {isProcessing ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : (
            <UploadCloud className="h-6 w-6 text-muted-foreground" />
          )}
          <p className="text-sm text-muted-foreground">
            {isProcessing ? "Uploading..." : "Drag & drop or click to upload"}
          </p>
          <p className="text-xs text-muted-foreground">
            Max {limits.maxSizeMB}MB
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={limits.accept}
        className="hidden"
        onChange={(event) => {
          validateAndUpload(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
    </div>
  );
};

export default FileDropzone;
