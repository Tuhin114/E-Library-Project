import { useState } from "react";
import { useDispatch } from "react-redux";
import { Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { removeReview } from "@/store/slices/reviewsSlice";
import { StarRating } from "@/components/ui/star-rating";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import ReviewForm from "@/components/reviews/ReviewForm";
import { ROLES } from "@/constants/roles";

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const ReviewItem = ({ review, bookId }) => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const isOwner = review.user?._id === user?._id;
  const canDelete = isOwner || user?.role === ROLES.LIBRARIAN;

  const handleDelete = () => {
    dispatch(removeReview({ reviewId: review._id, bookId }));
  };

  if (isEditing) {
    return (
      <ReviewForm
        bookId={bookId}
        existingReview={review}
        onDone={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="flex gap-3 border-b border-border py-4 last:border-b-0">
      <Avatar src={review.user?.avatar?.url} name={review.user?.name} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-foreground">{review.user?.name}</p>
            <div className="mt-0.5 flex items-center gap-2">
              <StarRating value={review.rating} size="sm" />
              <span className="text-xs text-muted-foreground">
                {formatDate(review.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {isOwner && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Edit review"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
            {canDelete && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Delete review"
                onClick={handleDelete}
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            )}
          </div>
        </div>

        {review.comment && (
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">
            {review.comment}
          </p>
        )}
      </div>
    </div>
  );
};

export default ReviewItem;
