import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Heart, BookMarked, CheckCircle2 } from "lucide-react";
import { fetchActivity } from "@/store/slices/librarySlice";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import ActivityStats from "@/components/activity/ActivityStats";
import ActivityBookRow from "@/components/activity/ActivityBookRow";
import MyReviewsList from "@/components/activity/MyReviewsList";

const Activity = () => {
  const dispatch = useDispatch();
  const { activity, activityStatus } = useSelector((state) => state.library);
  const isLoading = activityStatus === "loading" || activityStatus === "idle";

  useEffect(() => {
    dispatch(fetchActivity());
  }, [dispatch]);

  return (
    <PageContainer>
      <PageHeader
        title="Activity"
        description="Everything you've favorited, read, and reviewed, in one place."
      />

      <div className="space-y-8">
        <ActivityStats stats={activity?.stats} isLoading={isLoading} />

        <ActivityBookRow
          title="Continue Reading"
          icon={BookMarked}
          books={activity?.continueReading}
          count={activity?.stats?.inProgressCount}
          isLoading={isLoading}
          viewAllHref="/continue-reading"
          emptyText="Books you start reading will show up here until you finish them."
        />

        <ActivityBookRow
          title="Recently Completed"
          icon={CheckCircle2}
          books={activity?.recentlyCompleted}
          count={activity?.stats?.completedCount}
          isLoading={isLoading}
          emptyText="Books you finish reading will show up here."
        />

        <ActivityBookRow
          title="Favorites"
          icon={Heart}
          books={activity?.favorites}
          count={activity?.stats?.favoritesCount}
          isLoading={isLoading}
          viewAllHref="/favorites"
          emptyText="Books you favorite will show up here."
        />

        <MyReviewsList
          reviews={activity?.myReviews}
          count={activity?.stats?.reviewsCount}
          isLoading={isLoading}
          emptyText="Reviews you write on a book's page will show up here."
        />
      </div>
    </PageContainer>
  );
};

export default Activity;
