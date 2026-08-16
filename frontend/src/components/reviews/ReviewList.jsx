import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "@/hooks/useAuth";
import { fetchReviews, clearReviews } from "@/store/slices/reviewsSlice";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/common/EmptyState";
import ReviewForm from "@/components/reviews/ReviewForm";
import ReviewItem from "@/components/reviews/ReviewItem";

const ReviewList = ({ bookId }) => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { items: reviews, status } = useSelector((state) => state.reviews);
  const [isWriting, setIsWriting] = useState(false);

  useEffect(() => {
    dispatch(fetchReviews(bookId));
    return () => dispatch(clearReviews());
  }, [dispatch, bookId]);

  const ownReview = reviews.find((review) => review.user?._id === user?._id);
  const otherReviews = reviews.filter((review) => review.user?._id !== user?._id);

  if (status === "loading") {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  return (
    <div>
      {ownReview ? (
        <ReviewItem review={ownReview} bookId={bookId} />
      ) : isWriting ? (
        <ReviewForm bookId={bookId} onDone={() => setIsWriting(false)} />
      ) : (
        <Button variant="outline" size="sm" onClick={() => setIsWriting(true)}>
          Write a review
        </Button>
      )}

      {otherReviews.length > 0 ? (
        <div className="mt-4">
          {otherReviews.map((review) => (
            <ReviewItem key={review._id} review={review} bookId={bookId} />
          ))}
        </div>
      ) : (
        !ownReview && (
          <EmptyState
            title="No reviews yet"
            description="Be the first to share what you thought of this book."
            className="mt-4"
          />
        )
      )}
    </div>
  );
};

export default ReviewList;
