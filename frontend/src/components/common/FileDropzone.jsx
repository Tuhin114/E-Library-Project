import { useEffect, useRef, useState } from "react";
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  X,
  Loader2,
  Clipboard,
  Link,
} from "lucide-react";
import { FILE_LIMITS } from "../../constants/fileUploadLimits";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "../../hooks/useToast";

const ICONS = {
  cover: ImageIcon,
  pdf: FileText,
  epub: FileText,
};

const FileDropzone = ({
  label,
  fileType,
  currentFile,
  onUpload,
  onUploadUrl,
  onDelete,
  isProcessing = false,
  enableGlobalPaste = false,
}) => {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPasting, setIsPasting] = useState(false);
  const [remoteUrl, setRemoteUrl] = useState("");

  const limits = FILE_LIMITS[fileType];
  const Icon = ICONS[fileType] || UploadCloud;
  const exists = Boolean(currentFile?.url || currentFile?.available);

  const validateAndUpload = (file) => {
    if (!file) return false;

    if (!limits.allowedMimeTypes.includes(file.type)) {
      toast.error(
        `Invalid file type. Allowed: ${limits.allowedMimeTypes.join(", ")}`,
      );
      return false;
    }

    const maxBytes = limits.maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error(`File is too large. Max size is ${limits.maxSizeMB}MB.`);
      return false;
    }

    onUpload(file);
    return true;
  };

  const handlePaste = (event) => {
    if (!enableGlobalPaste || fileType !== "cover" || isProcessing || isPasting) {
      return;
    }

    const items = event.clipboardData?.items;
    if (!items?.length) return;

    let imageFile = null;
    for (const item of items) {
      if (!item.type.startsWith("image/")) continue;
      imageFile = item.getAsFile();
      if (imageFile) break;
    }

    // Do not interfere with normal text pasting. Only consume the paste
    // event when an actual clipboard image is present.
    if (!imageFile) return;

    event.preventDefault();
    setIsPasting(true);

    try {
      const extension = imageFile.type.split("/")[1] || "png";
      const pastedFile = new File([imageFile], `pasted-cover.${extension}`, {
        type: imageFile.type,
        lastModified: Date.now(),
      });
      validateAndUpload(pastedFile);
    } finally {
      setIsPasting(false);
    }
  };

  useEffect(() => {
    if (!enableGlobalPaste) return undefined;

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  });

  const handleDragOver = (event) => {
    event.preventDefault();
    if (!isProcessing) setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    if (isProcessing) return;
    validateAndUpload(event.dataTransfer.files?.[0]);
  };

  const handleBrowseClick = () => {
    if (!isProcessing) inputRef.current?.click();
  };

  const handleUrlSubmit = async (event) => {
    event.preventDefault();
    const url = remoteUrl.trim();
    if (!url || !onUploadUrl || isProcessing) return;

    try {
      new URL(url);
    } catch {
      toast.error("Enter a valid file URL.");
      return;
    }

    await onUploadUrl(url);
    setRemoteUrl("");
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold">{label}</p>

      {exists && (
        <div className="flex items-center justify-between rounded-2xl border border-border p-3">
          <div className="flex items-center gap-2 overflow-hidden">
            <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
            {currentFile.url ? (
              <a
                href={currentFile.url}
                target="_blank"
                rel="noreferrer"
                className="truncate text-sm text-primary hover:underline"
              >
                {currentFile.originalName || "View file"}
              </a>
            ) : (
              <span className="truncate text-sm text-foreground">
                {currentFile.originalName || "File uploaded"}
              </span>
            )}
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
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleBrowseClick();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`${label} upload area`}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed p-6 text-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:bg-accent/10"
        }`}
      >
        {isProcessing || isPasting ? (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        ) : (
          <UploadCloud className="h-6 w-6 text-muted-foreground" />
        )}

        <p className="text-sm text-muted-foreground">
          {isProcessing
            ? "Processing..."
            : isPasting
              ? "Processing pasted image..."
              : "Drag & drop or click to upload"}
        </p>

        {fileType === "cover" && enableGlobalPaste && !isProcessing && !isPasting && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clipboard className="h-3.5 w-3.5" />
            <span>Copy an image and press Ctrl+V anywhere on this page</span>
          </div>
        )}

        <p className="text-xs text-muted-foreground">Max {limits.maxSizeMB}MB</p>
      </div>

      {onUploadUrl && (
        <form
          onSubmit={handleUrlSubmit}
          onClick={(event) => event.stopPropagation()}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <div className="relative flex-1">
            <Link className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={remoteUrl}
              onChange={(event) => setRemoteUrl(event.target.value)}
              placeholder={`Direct ${fileType.toUpperCase()} download URL`}
              aria-label={`${label} direct URL`}
              disabled={isProcessing}
              className="pl-9"
            />
          </div>
          <Button
            type="submit"
            variant="outline"
            disabled={!remoteUrl.trim() || isProcessing}
          >
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Fetch URL
          </Button>
        </form>
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
