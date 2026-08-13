import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { getBookFileBlob } from "../../services/bookService";
import { toast } from "../../hooks/useToast";

const DownloadButton = ({ bookId, type, filename }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const blob = await getBookFileBlob(bookId, type, { download: true });
      const objectUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename || `book.${type}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={isDownloading}
    >
      {isDownloading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      Download
    </Button>
  );
};

export default DownloadButton;
