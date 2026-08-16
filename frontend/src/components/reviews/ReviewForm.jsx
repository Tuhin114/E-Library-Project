import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from "react-redux";
import { reviewSchema } from "@/lib/validationSchemas/reviewSchema";
import { submitReview, editReview } from "@/store/slices/reviewsSlice";
import { StarRating } from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

/**
 * `existingReview` present → edit mode (PATCH); absent → create mode
 * (POST). Same form either way, just a different submit thunk.
 */
const ReviewForm = ({ bookId, existingReview, onDone }) => {
  const dispatch = useDispatch();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: existingReview?.rating || 0,
      comment: existingReview?.comment || "",
    },
  });

  const onSubmit = async (payload) => {
    if (existingReview) {
      await dispatch(
        editReview({ reviewId: existingReview._id, bookId, payload }),
      );
    } else {
      await dispatch(submitReview({ bookId, payload }));
    }
    onDone?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
      <Controller
        control={control}
        name="rating"
        render={({ field }) => (
          <StarRating value={field.value} onChange={field.onChange} size="lg" />
        )}
      />
      {errors.rating && (
        <p className="text-sm text-destructive">{errors.rating.message}</p>
      )}

      <Textarea
        rows={3}
        placeholder="Share your thoughts on this book (optional)"
        error={!!errors.comment}
        {...register("comment")}
      />
      {errors.comment && (
        <p className="text-sm text-destructive">{errors.comment.message}</p>
      )}

      <div className="flex gap-2">
        <Button type="submit" size="sm" isLoading={isSubmitting}>
          {existingReview ? "Update review" : "Submit review"}
        </Button>
        {onDone && (
          <Button type="button" variant="ghost" size="sm" onClick={onDone}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

export default ReviewForm;
