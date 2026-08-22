import { Link } from "react-router-dom";
import { Pin, Lock, MessageCircle } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FORUM_CATEGORY_LABELS } from "@/constants/forumCategories";

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });

const ForumThreadCard = ({ thread }) => (
  <Link to={`/forum/${thread._id}`}>
    <Card interactive className="flex items-start gap-3 p-4">
      <Avatar src={thread.user?.avatar?.url} name={thread.user?.name} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {thread.isPinned && <Pin className="h-3.5 w-3.5 text-primary" />}
          {thread.isLocked && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
          <h3 className="truncate font-display font-medium text-foreground">
            {thread.title}
          </h3>
        </div>
        <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{thread.body}</p>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <Badge variant="outline">{FORUM_CATEGORY_LABELS[thread.category]}</Badge>
          <span>{thread.user?.name}</span>
          <span>{formatDate(thread.lastActivityAt)}</span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5" />
            {thread.replyCount}
          </span>
        </div>
      </div>
    </Card>
  </Link>
);

export default ForumThreadCard;
