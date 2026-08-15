import { Search, X } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

/**
 * Controlled search input. Debouncing happens in the parent (via
 * useDebounce) — this component just renders the field and a clear button.
 */
const SearchBar = ({
  value,
  onChange,
  placeholder = "Search books by title, author, ISBN...",
}) => {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 pl-9 pr-9"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange("")}
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default SearchBar;
