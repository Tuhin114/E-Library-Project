import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDiscussions, clearDiscussions } from "@/store/slices/discussionsSlice";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/common/EmptyState";
import DiscussionForm from "@/components/discussions/DiscussionForm";
import DiscussionItem from "@/components/discussions/DiscussionItem";

const DiscussionList = ({ bookId }) => {
  const dispatch = useDispatch();
  const { items: discussions, status } = useSelector((state) => state.discussions);

  useEffect(() => {
    dispatch(fetchDiscussions(bookId));
    return () => dispatch(clearDiscussions());
  }, [dispatch, bookId]);

  return (
    <div>
      <DiscussionForm bookId={bookId} />

      {status === "loading" ? (
        <div className="mt-4 space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : discussions.length > 0 ? (
        <div className="mt-4">
          {discussions.map((discussion) => (
            <DiscussionItem key={discussion._id} discussion={discussion} />
          ))}
        </div>
      ) : (
        <EmptyState
          className="mt-4"
          title="No discussions yet"
          description="Start the conversation about this book."
        />
      )}
    </div>
  );
};

export default DiscussionList;
