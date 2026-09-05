import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Plus, ListPlus, Trash2 } from "lucide-react";
import {
  fetchSavedLists,
  createSavedList,
  deleteSavedList,
} from "../../store/slices/savedListsSlice";
import PageContainer from "../../components/layout/PageContainer";
import PageHeader from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import EmptyState from "../../components/common/EmptyState";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { Skeleton } from "../../components/ui/skeleton";

const SavedLists = () => {
  const dispatch = useDispatch();
  const { lists, listsStatus } = useSelector((state) => state.savedLists);
  const [newTitle, setNewTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  useEffect(() => {
    dispatch(fetchSavedLists());
  }, [dispatch]);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!newTitle.trim()) return;

    setIsCreating(true);
    const result = await dispatch(createSavedList({ title: newTitle.trim() }));
    setIsCreating(false);

    if (createSavedList.fulfilled.match(result)) setNewTitle("");
  };

  const handleDelete = async () => {
    if (!pendingDeleteId) return;
    await dispatch(deleteSavedList(pendingDeleteId));
    setPendingDeleteId(null);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Saved Lists"
        description="Titled collections of resources — organize e-journals, papers and notes however makes sense to you."
      />

      <form onSubmit={handleCreate} className="mb-6 flex gap-2">
        <Input
          value={newTitle}
          onChange={(event) => setNewTitle(event.target.value)}
          placeholder="e.g. Thesis Sources, Semester 3 Notes"
        />
        <Button
          type="submit"
          disabled={isCreating || !newTitle.trim()}
          className="shrink-0 gap-2"
        >
          <Plus className="h-4 w-4" />
          New List
        </Button>
      </form>

      {listsStatus === "loading" && lists.length === 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : lists.length === 0 ? (
        <EmptyState
          icon={ListPlus}
          title="No saved lists yet"
          description="Create your first list above, or save a resource to a new list from its card."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => (
            <div
              key={list._id}
              className="group relative flex flex-col gap-2 rounded-2xl border border-border bg-card p-4"
            >
              <Link to={`/saved-lists/${list._id}`} className="min-w-0">
                <h3 className="truncate font-display text-sm font-medium text-foreground">
                  {list.title}
                </h3>
                {list.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {list.description}
                  </p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  {list.itemCount} item{list.itemCount === 1 ? "" : "s"}
                </p>
              </Link>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                aria-label={`Delete ${list.title}`}
                onClick={() => setPendingDeleteId(list._id)}
              >
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDeleteId)}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
        title="Delete this list?"
        description="This removes the list and its saved items. The resources themselves are not affected."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </PageContainer>
  );
};

export default SavedLists;
