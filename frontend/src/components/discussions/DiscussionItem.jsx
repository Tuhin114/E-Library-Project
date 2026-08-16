import { useState } from "react";
import { useDispatch } from "react-redux";
import { MessageCircle, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { removeDiscussion, removeReply } from "@/store/slices/discussionsSlice";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import ReplyForm from "@/components/discussions/ReplyForm";
import { ROLES } from "@/constants/roles";

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });

const canModerate = (ownerId, user) =>
  ownerId === user?._id || user?.role === ROLES.LIBRARIAN;

const DiscussionItem = ({ discussion }) => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [isReplying, setIsReplying] = useState(false);

  return (
    <div className="border-b border-border py-4 last:border-b-0">
      <div className="flex gap-3">
        <Avatar src={discussion.user?.avatar?.url} name={discussion.user?.name} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <p className="text-sm font-medium text-foreground">{discussion.user?.name}</p>
              <span className="text-xs text-muted-foreground">
                {formatDate(discussion.createdAt)}
              </span>
            </div>
            {canModerate(discussion.user?._id, user) && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Delete post"
                onClick={() => dispatch(removeDiscussion(discussion._id))}
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            )}
          </div>

          <p className="mt-1 text-sm leading-relaxed text-foreground/90">
            {discussion.message}
          </p>

          <button
            type="button"
            className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setIsReplying((prev) => !prev)}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Reply
          </button>

          {isReplying && (
            <ReplyForm discussionId={discussion._id} onDone={() => setIsReplying(false)} />
          )}

          {discussion.replies?.length > 0 && (
            <div className="mt-3 space-y-3 border-l-2 border-border pl-4">
              {discussion.replies.map((reply) => (
                <div key={reply._id} className="flex gap-2">
                  <Avatar src={reply.user?.avatar?.url} name={reply.user?.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-baseline gap-2">
                        <p className="text-xs font-medium text-foreground">{reply.user?.name}</p>
                        <span className="text-[11px] text-muted-foreground">
                          {formatDate(reply.createdAt)}
                        </span>
                      </div>
                      {canModerate(reply.user?._id, user) && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Delete reply"
                          onClick={() =>
                            dispatch(removeReply({ replyId: reply._id, discussionId: discussion._id }))
                          }
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs leading-relaxed text-foreground/90">
                      {reply.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscussionItem;
