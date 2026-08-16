import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Search, Trash2 } from "lucide-react";
import { removeSavedSearch } from "@/store/slices/librarySlice";
import { toast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import EmptyState from "@/components/common/EmptyState";

const SavedSearchList = ({ searches }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleRun = (queryParams) => {
    const search = new URLSearchParams(queryParams).toString();
    navigate(`/books${search ? `?${search}` : ""}`);
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(removeSavedSearch(id)).unwrap();
      toast.success("Saved search deleted");
    } catch (error) {
      toast.error(error);
    }
  };

  if (!searches.length) {
    return (
      <EmptyState
        title="No saved searches yet"
        description="Save a search from the Books page to quickly run it again later."
      />
    );
  }

  return (
    <div className="space-y-3">
      {searches.map((search) => (
        <Card
          key={search._id}
          className="flex items-center justify-between gap-4 p-4"
        >
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{search.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {new URLSearchParams(search.queryParams).toString() || "All books"}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Run search"
              onClick={() => handleRun(search.queryParams)}
            >
              <Search className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Delete search"
              onClick={() => handleDelete(search._id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default SavedSearchList;
