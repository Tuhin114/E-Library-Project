import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const formatTimestamp = (value) =>
  new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const NotificationItem = ({ notification, onRead, onDelete }) => {
  const handleClick = () => {
    if (!notification.isRead) onRead(notification._id);
  };

  const content = (
    <div
      onClick={handleClick}
      className={cn(
        "flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-secondary/40",
        !notification.isRead && "bg-primary/5",
      )}
    >
      {!notification.isRead && (
        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
      )}
      <div className={cn("min-w-0 flex-1", notification.isRead && "pl-4")}>
        <p className="font-medium text-foreground">{notification.title}</p>
        <p className="mt-0.5 line-clamp-2 text-muted-foreground">{notification.message}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatTimestamp(notification.createdAt)}
        </p>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete(notification._id);
        }}
        className="shrink-0 rounded-full p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
        aria-label="Delete notification"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );

  return notification.link ? (
    <Link to={notification.link} className="group block">
      {content}
    </Link>
  ) : (
    <div className="group">{content}</div>
  );
};

export default NotificationItem;
