import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Pencil, Trash2, Check, X } from "lucide-react";
import {
  fetchSavedListById,
  updateSavedList,
  deleteSavedList,
  removeItemFromSavedList,
  clearSelectedSavedList,
} from "../../store/slices/savedListsSlice";
import PageContainer from "../../components/layout/PageContainer";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import ResourceCard from "../../components/resources/ResourceCard";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import ErrorState from "../../components/common/ErrorState";
import { Skeleton } from "../../components/ui/skeleton";

const SavedListDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    selected: list,
    selectedStatus,
    error,
  } = useSelector((state) => state.savedLists);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchSavedListById(id));
    return () => dispatch(clearSelectedSavedList());
  }, [dispatch, id]);

  if (selectedStatus === "loading" && !list) {
    return (
      <PageContainer>
        <Skeleton className="h-48 w-full rounded-2xl" />
      </PageContainer>
    );
  }

  if (selectedStatus === "failed" && !list) {
    return (
      <PageContainer>
        <ErrorState message={error || "Saved list not found"} />
      </PageContainer>
    );
  }

  if (!list) return null;

  const startEditingTitle = () => {
    setTitleDraft(list.title);
    setIsEditingTitle(true);
  };

  const saveTitle = async () => {
    if (titleDraft.trim() && titleDraft.trim() !== list.title) {
      await dispatch(
        updateSavedList({ listId: id, payload: { title: titleDraft.trim() } }),
      );
    }
    setIsEditingTitle(false);
  };

  const handleDeleteList = async () => {
    const result = await dispatch(deleteSavedList(id));
    if (deleteSavedList.fulfilled.match(result)) {
      navigate("/saved-lists", { replace: true });
    }
  };

  const handleRemoveItem = (resourceId) => {
    dispatch(removeItemFromSavedList({ listId: id, resourceId }));
  };

  return (
    <PageContainer>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <Input
                value={titleDraft}
                onChange={(event) => setTitleDraft(event.target.value)}
                autoFocus
                className="max-w-sm"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={saveTitle}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setIsEditingTitle(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-foreground">
                {list.title}
              </h1>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label="Rename list"
                onClick={startEditingTitle}
              >
                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </div>
          )}
          <p className="mt-1 text-sm text-muted-foreground">
            {list.items.length} item{list.items.length === 1 ? "" : "s"}
          </p>
        </div>

        <Button
          type="button"
          variant="destructive"
          className="gap-2"
          onClick={() => setIsConfirmOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
          Delete List
        </Button>
      </div>

      {list.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nothing saved here yet. Use "Save to a list" on any resource to add it
          here.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.items.map((item) => (
            <div key={item.itemId} className="relative">
              <ResourceCard resource={item.resource} />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-7 w-7 bg-card/80"
                aria-label="Remove from this list"
                onClick={() => handleRemoveItem(item.resource._id)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Delete this list?"
        description="This removes the list and its saved items. The resources themselves are not affected."
        confirmLabel="Delete"
        onConfirm={handleDeleteList}
      />
    </PageContainer>
  );
};

export default SavedListDetail;
