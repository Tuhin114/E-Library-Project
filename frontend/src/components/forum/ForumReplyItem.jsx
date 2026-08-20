import { useState } from "react";
import { useDispatch } from "react-redux";
import { Flag, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { deleteThreadReply } from "@/store/slices/forumSlice";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import ReportDialog from "@/components/forum/ReportDialog";
import { ROLES } from "@/constants/roles";

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });

const ForumReplyItem = ({ reply }) => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [isReporting, setIsReporting] = useState(false);

  const canModerate = reply.user?._id === user?._id || user?.role === ROLES.LIBRARIAN;

  return (
    <div className="flex gap-3 border-b border-border py-4 last:border-b-0">
      <Avatar src={reply.user?.avatar?.url} name={reply.user?.name} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <p className="text-sm font-medium text-foreground">{reply.user?.name}</p>
            <span className="text-xs text-muted-foreground">{formatDate(reply.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Report reply"
              onClick={() => setIsReporting(true)}
            >
              <Flag className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
            {canModerate && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Delete reply"
                onClick={() => dispatch(deleteThreadReply(reply._id))}
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            )}
          </div>
        </div>
        <p className="mt-1 text-sm leading-relaxed text-foreground/90">{reply.message}</p>
      </div>

      <ReportDialog
        open={isReporting}
        onOpenChange={setIsReporting}
        targetType="reply"
        targetId={reply._id}
      />
    </div>
  );
};

export default ForumReplyItem;
