import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";

const ReaderToolbar = ({ title, onClose, formatSwitch, children }) => (
  <div className="flex items-center justify-between gap-4 border-b border-border bg-background px-4 py-3">
    <div className="flex min-w-0 items-center gap-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        aria-label="Back to book details"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <h1 className="truncate text-sm font-medium">{title}</h1>
    </div>
    <div className="flex items-center gap-3">
      {formatSwitch}
      {children}
    </div>
  </div>
);

export default ReaderToolbar;
