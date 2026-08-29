import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPreferences,
  savePreferences,
} from "@/store/slices/notificationsSlice";
import { Skeleton } from "@/components/ui/skeleton";
import ToggleSwitch from "./ToggleSwitch";

const CATEGORY_LABELS = {
  circulation: {
    label: "Circulation",
    description: "Requests, approvals, renewals, due dates.",
  },
  community: {
    label: "Community",
    description: "Forum replies and discussion activity.",
  },
  account: {
    label: "Account",
    description: "Fees, moderation outcomes, and other account events.",
  },
};

const NotificationPreferences = () => {
  const dispatch = useDispatch();
  const { preferences, preferencesStatus } = useSelector(
    (state) => state.notifications,
  );

  useEffect(() => {
    dispatch(fetchPreferences());
  }, [dispatch]);

  const handleToggle = (category, channel, value) => {
    dispatch(savePreferences({ [category]: { [channel]: value } }));
  };

  if (preferencesStatus === "loading" && !preferences) {
    return <Skeleton className="h-40 w-full" />;
  }

  if (!preferences) return null;

  return (
    <div className="space-y-1">
      <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-4 gap-y-1 px-1 pb-2 text-xs font-medium text-muted-foreground pr-9">
        <span />
        <span className="text-center">In-app</span>
        <span className="text-center">Email</span>
      </div>

      {Object.entries(CATEGORY_LABELS).map(
        ([category, { label, description }]) => (
          <div
            key={category}
            className="grid grid-cols-[1fr_auto_auto] items-center gap-x-4 rounded-xl border border-border px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <ToggleSwitch
              checked={Boolean(preferences[category]?.inApp)}
              onChange={(value) => handleToggle(category, "inApp", value)}
              label={`${label} in-app notifications`}
            />
            <ToggleSwitch
              checked={Boolean(preferences[category]?.email)}
              onChange={(value) => handleToggle(category, "email", value)}
              label={`${label} email notifications`}
            />
          </div>
        ),
      )}
    </div>
  );
};

export default NotificationPreferences;
