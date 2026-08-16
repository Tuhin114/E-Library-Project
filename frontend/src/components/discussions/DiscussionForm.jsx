import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from "react-redux";
import { discussionMessageSchema } from "@/lib/validationSchemas/discussionSchema";
import { postDiscussion } from "@/store/slices/discussionsSlice";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const DiscussionForm = ({ bookId }) => {
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(discussionMessageSchema) });

  const onSubmit = async (payload) => {
    const result = await dispatch(postDiscussion({ bookId, payload }));
    if (!result.error) reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2" noValidate>
      <Textarea
        rows={3}
        placeholder="Start a discussion about this book..."
        error={!!errors.message}
        {...register("message")}
      />
      {errors.message && (
        <p className="text-sm text-destructive">{errors.message.message}</p>
      )}
      <Button type="submit" size="sm" isLoading={isSubmitting}>
        Post
      </Button>
    </form>
  );
};

export default DiscussionForm;
