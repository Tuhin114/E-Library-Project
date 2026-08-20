import { useRef, useState } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/useToast";
import { FILE_LIMITS } from "@/constants/fileUploadLimits";

/**
 * Click-to-upload avatar with a remove button once one exists.
 * Validates type/size client-side before ever hitting the network —
 * same pattern as FileDropzone, just scoped to a single circular image.
 */
const AvatarUpload = ({ src, name, onUpload, onRemove, isProcessing }) => {
  const inputRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const limits = FILE_LIMITS.avatar;

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!limits.allowedMimeTypes.includes(file.type)) {
      toast.error(
        `Invalid file type. Allowed: ${limits.allowedMimeTypes.join(", ")}`,
      );
      return;
    }
    if (file.size > limits.maxSizeMB * 1024 * 1024) {
      toast.error(`File is too large. Max size is ${limits.maxSizeMB}MB.`);
      return;
    }

    onUpload(file);
  };

  return (
    <div className="flex items-center gap-4">
      <div
        className="group relative cursor-pointer"
        onClick={() => !isProcessing && inputRef.current?.click()}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <Avatar src={src} name={name} size="lg" />
        {(isHovering || isProcessing) && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
            {isProcessing ? (
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            ) : (
              <Camera className="h-5 w-5 text-white" />
            )}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          JPG, PNG or WEBP. Max {limits.maxSizeMB}MB.
        </p>
        {src && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1.5 text-destructive hover:text-destructive"
            onClick={onRemove}
            disabled={isProcessing}
          >
            <X className="h-3.5 w-3.5" />
            Remove photo
          </Button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={limits.accept}
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
};

export default AvatarUpload;
