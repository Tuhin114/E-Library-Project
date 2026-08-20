import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Pin, Lock, Flag } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { fetchThreadDetail, clearCurrentThread } from "@/store/slices/forumSlice";
import { FORUM_CATEGORY_LABELS } from "@/constants/forumCategories";
import { ROLES } from "@/constants/roles";
import PageContainer from "@/components/layout/PageContainer";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ForumModerationControls from "@/components/forum/ForumModerationControls";
import ForumReplyForm from "@/components/forum/ForumReplyForm";
import ForumReplyItem from "@/components/forum/ForumReplyItem";
import ReportDialog from "@/components/forum/ReportDialog";

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

const ForumThreadDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { currentThread: thread, currentThreadStatus: status } = useSelector((state) => state.forum);
  const [isReporting, setIsReporting] = useState(false);

  useEffect(() => {
    dispatch(fetchThreadDetail(id));
    return () => dispatch(clearCurrentThread());
  }, [dispatch, id]);

  if (status === "loading" || !thread) {
    return (
      <PageContainer>
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="mt-4 h-24 w-full" />
      </PageContainer>
    );
  }

  const isOwner = thread.user?._id === user?._id;
  const isLibrarian = user?.role === ROLES.LIBRARIAN;

  return (
    <PageContainer>
      <div className="max-w-3xl">
        <div className="flex flex-wrap items-center gap-2">
          {thread.isPinned && <Pin className="h-4 w-4 text-primary" />}
          {thread.isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
          <Badge variant="outline">{FORUM_CATEGORY_LABELS[thread.category]}</Badge>
        </div>

        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground">
          {thread.title}
        </h1>

        <div className="mt-3 flex items-center gap-2">
          <Avatar src={thread.user?.avatar?.url} name={thread.user?.name} size="sm" />
          <div className="text-sm">
            <p className="font-medium text-foreground">{thread.user?.name}</p>
            <p className="text-xs text-muted-foreground">{formatDate(thread.createdAt)}</p>
          </div>
        </div>

        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
          {thread.body}
        </p>

        <div className="mt-4 flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => setIsReporting(true)}
          >
            <Flag className="mr-2 h-3.5 w-3.5" />
            Report
          </Button>
        </div>

        {(isOwner || isLibrarian) && (
          <div className="mt-4 border-t border-border pt-4">
            <ForumModerationControls thread={thread} showLockPin={isLibrarian} />
          </div>
        )}

        <div className="mt-10 border-t border-border pt-6">
          <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
            {thread.replyCount} {thread.replyCount === 1 ? "Reply" : "Replies"}
          </h2>

          <div className="mt-4">
            {thread.replies.map((reply) => (
              <ForumReplyItem key={reply._id} reply={reply} />
            ))}
          </div>

          {thread.isLocked ? (
            <p className="mt-4 text-sm text-muted-foreground">
              This thread is locked and no longer accepting replies.
            </p>
          ) : (
            <div className="mt-4">
              <ForumReplyForm threadId={thread._id} />
            </div>
          )}
        </div>
      </div>

      <ReportDialog
        open={isReporting}
        onOpenChange={setIsReporting}
        targetType="thread"
        targetId={thread._id}
      />
    </PageContainer>
  );
};

export default ForumThreadDetail;
