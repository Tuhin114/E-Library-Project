import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ListPlus, Plus } from "lucide-react";
import {
  fetchSavedLists,
  createSavedList,
  addItemToSavedList,
} from "../../store/slices/savedListsSlice";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";

const SaveToListButton = ({ resourceId }) => {
  const dispatch = useDispatch();
  const { lists, listsStatus } = useSelector((state) => state.savedLists);
  const [isOpen, setIsOpen] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (isOpen && listsStatus === "idle") {
      dispatch(fetchSavedLists());
    }
  }, [isOpen, listsStatus, dispatch]);

  // ResourceCard wraps this button in a <Link> to the resource detail
  // page — opening the dialog or adding to a list should never
  // trigger that navigation, same guard FavoriteButton already uses.
  const stopAndOpen = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsOpen(true);
  };

  const handleAdd = (listId) => (event) => {
    event.preventDefault();
    event.stopPropagation();
    dispatch(addItemToSavedList({ listId, resourceId }));
  };

  const handleCreateAndAdd = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!newListTitle.trim()) return;

    setIsCreating(true);
    const result = await dispatch(
      createSavedList({ title: newListTitle.trim() }),
    );
    setIsCreating(false);

    if (createSavedList.fulfilled.match(result)) {
      setNewListTitle("");
      dispatch(addItemToSavedList({ listId: result.payload._id, resourceId }));
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={stopAndOpen}
        className="h-8 w-8 p-0"
        aria-label="Save to a list"
      >
        <ListPlus className="h-4 w-4 text-muted-foreground" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save to a list</DialogTitle>
            <DialogDescription>
              Add this resource to one of your saved lists, or start a new one.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateAndAdd} className="flex gap-2">
            <Input
              value={newListTitle}
              onChange={(event) => setNewListTitle(event.target.value)}
              placeholder="New list name"
            />
            <Button
              type="submit"
              disabled={isCreating || !newListTitle.trim()}
              className="shrink-0 gap-1"
            >
              <Plus className="h-4 w-4" />
              Create
            </Button>
          </form>

          <div className="max-h-64 space-y-1 overflow-y-auto">
            {listsStatus === "loading" && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Loading your lists…
              </p>
            )}
            {listsStatus === "succeeded" && lists.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                You don't have any lists yet — create one above.
              </p>
            )}
            {lists.map((list) => (
              <button
                key={list._id}
                type="button"
                onClick={handleAdd(list._id)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-accent/15"
              >
                <span className="truncate">{list.title}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {list.itemCount} item{list.itemCount === 1 ? "" : "s"}
                </span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SaveToListButton;
