import { useEffect, useState } from "react";
import { Bookmark, Plus, Trash2, X, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import * as readingService from "../../services/readingService";
import { toast } from "../../hooks/useToast";

const BookmarkPanel = ({ bookId, format, currentLocation, onJumpTo, onClose }) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [status, setStatus] = useState("loading");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    setStatus("loading");
    readingService
      .getBookmarks(bookId)
      .then((all) => {
        setBookmarks(all.filter((b) => b.format === format));
        setStatus("succeeded");
      })
      .catch((error) => {
        toast.error(error.message);
        setStatus("failed");
      });
  }, [bookId, format]);

  const handleAdd = async () => {
    if (currentLocation === null || currentLocation === undefined) return;
    setIsAdding(true);
    try {
      const label = format === "pdf" ? `Page ${currentLocation}` : "Bookmark";
      const bookmark = await readingService.addBookmark(bookId, {
        format,
        location: String(currentLocation),
        label,
      });
      setBookmarks((prev) => [bookmark, ...prev]);
      toast.success("Bookmark added");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (bookmarkId) => {
    try {
      await readingService.deleteBookmark(bookmarkId);
      setBookmarks((prev) => prev.filter((b) => b._id !== bookmarkId));
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex w-72 shrink-0 flex-col border-l border-border bg-background">
      <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Bookmark className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Bookmarks</span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="border-b border-border p-3">
        <Button
          size="sm"
          className="w-full"
          onClick={handleAdd}
          disabled={isAdding || currentLocation === null || currentLocation === undefined}
        >
          {isAdding ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Bookmark this spot
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-2">
        {status === "loading" && (
          <p className="p-2 text-center text-sm text-muted-foreground">
            Loading…
          </p>
        )}
        {status === "succeeded" && bookmarks.length === 0 && (
          <p className="p-2 text-center text-sm text-muted-foreground">
            No bookmarks yet.
          </p>
        )}
        {bookmarks.map((bookmark) => (
          <div
            key={bookmark._id}
            className="mb-1 flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-accent"
          >
            <button
              type="button"
              onClick={() => onJumpTo(bookmark.location)}
              className="min-w-0 flex-1 truncate text-left text-sm"
            >
              {bookmark.label || "Bookmark"}
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={() => handleDelete(bookmark._id)}
            >
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookmarkPanel;
