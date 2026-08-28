import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/common/EmptyState";
import NotificationItem from "./NotificationItem";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification,
} from "@/store/slices/notificationsSlice";

/**
 * Self-contained bell + dropdown (no Radix Popover in this codebase's
 * dependency set — a plain ref-based click-outside handler is enough
 * for a fixed-position panel like this, matching the app's existing
 * preference for the smallest dependency that does the job).
 */
const NotificationBell = () => {
  const dispatch = useDispatch();
  const { items, unreadCount, status } = useSelector((state) => state.notifications);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  useEffect(() => {
    if (isOpen) dispatch(fetchNotifications({ limit: 10 }));
  }, [isOpen, dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen((open) => !open)}
        aria-label="Notifications"
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[90vw] rounded-2xl border border-border bg-background shadow-elevated">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="font-display text-sm font-semibold text-foreground">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => dispatch(markAllNotificationsAsRead())}
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto p-2">
            {status === "loading" && items.length === 0 ? (
              <div className="flex justify-center py-8">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : items.length === 0 ? (
              <EmptyState
                icon={Bell}
                title="No notifications yet"
                description="Activity on your requests, loans, and forum posts will show up here."
                className="border-none bg-transparent py-8"
              />
            ) : (
              items.map((notification) => (
                <NotificationItem
                  key={notification._id}
                  notification={notification}
                  onRead={(id) => dispatch(markNotificationAsRead(id))}
                  onDelete={(id) => dispatch(removeNotification(id))}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
