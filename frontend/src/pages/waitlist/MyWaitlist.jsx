import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Clock } from "lucide-react";
import { fetchMyWaitlist } from "@/store/slices/waitlistSlice";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/common/EmptyState";
import MyWaitlistCard from "@/components/waitlist/MyWaitlistCard";

const MyWaitlist = () => {
  const dispatch = useDispatch();
  const { myEntries, myEntriesStatus } = useSelector((state) => state.waitlist);

  useEffect(() => {
    dispatch(fetchMyWaitlist());
  }, [dispatch]);

  return (
    <PageContainer>
      <PageHeader
        title="My Waitlist"
        description="Books you're queued for, plus any hold ready to claim."
      />

      {myEntriesStatus === "loading" && myEntries.length === 0 ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : myEntries.length > 0 ? (
        <div className="space-y-3">
          {myEntries.map((entry) => (
            <MyWaitlistCard key={entry._id} entry={entry} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Clock}
          title="Not on any waitlists"
          description="When every physical copy of a book is checked out, you can join its waitlist from the book's page."
        />
      )}
    </PageContainer>
  );
};

export default MyWaitlist;
