import { AlertTriangle } from "lucide-react";
import { Button } from "../ui/button";

const ReaderErrorState = ({ message, onBack }) => (
  <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
    <AlertTriangle className="h-8 w-8 text-muted-foreground" />
    <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
    {onBack && (
      <Button variant="outline" size="sm" onClick={onBack}>
        Go back
      </Button>
    )}
  </div>
);

export default ReaderErrorState;
