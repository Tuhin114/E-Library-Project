import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Lock, Unlock, Pin, PinOff, Trash2 } from "lucide-react";
import { deleteThread, toggleThreadLock, toggleThreadPin } from "@/store/slices/forumSlice";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/common/ConfirmDialog";

const ForumModerationControls = ({ thread, showLockPin = true }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await dispatch(deleteThread(thread._id));
    setIsDeleting(false);
    if (!result.error) navigate("/forum");
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {showLockPin && (
        <>
          <Button variant="outline" size="sm" onClick={() => dispatch(toggleThreadLock(thread._id))}>
            {thread.isLocked ? (
              <Unlock className="mr-2 h-4 w-4" />
            ) : (
              <Lock className="mr-2 h-4 w-4" />
            )}
            {thread.isLocked ? "Unlock" : "Lock"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => dispatch(toggleThreadPin(thread._id))}>
            {thread.isPinned ? <PinOff className="mr-2 h-4 w-4" /> : <Pin className="mr-2 h-4 w-4" />}
            {thread.isPinned ? "Unpin" : "Pin"}
          </Button>
        </>
      )}
      <Button
        variant="outline"
        size="sm"
        className="text-destructive hover:text-destructive"
        onClick={() => setIsConfirmingDelete(true)}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </Button>

      <ConfirmDialog
        open={isConfirmingDelete}
        onOpenChange={setIsConfirmingDelete}
        title="Delete this thread?"
        description="This also deletes every reply on it. This cannot be undone."
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ForumModerationControls;
