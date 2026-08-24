import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadBlob } from "@/lib/downloadBlob";
import { toast } from "@/hooks/useToast";

/**
 * Same download-state/spinner pattern as `components/reader/DownloadButton.jsx`
 * — kept intentionally small and icon-only (`size="icon"`) so it sits
 * inline next to a section heading without competing with the heading
 * itself for attention.
 *
 * `exportFn` is one of analyticsService's export* functions; `dataset`
 * and `params` (range/limit) are passed straight through to it.
 */
const ExportButton = ({ exportFn, dataset, params, label }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { blob, filename } = await exportFn(dataset, params);
      downloadBlob(blob, filename);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleExport}
      disabled={isExporting}
      title={label ? `Export ${label} as CSV` : "Export as CSV"}
      aria-label={label ? `Export ${label} as CSV` : "Export as CSV"}
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
    </Button>
  );
};

export default ExportButton;
