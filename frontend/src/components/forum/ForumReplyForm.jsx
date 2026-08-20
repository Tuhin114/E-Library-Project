import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from "react-redux";
import { replyMessageSchema } from "@/lib/validationSchemas/forumSchema";
import { postThreadReply } from "@/store/slices/forumSlice";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const ForumReplyForm = ({ threadId }) => {
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(replyMessageSchema) });

  const onSubmit = async (payload) => {
    const result = await dispatch(postThreadReply({ threadId, payload }));
    if (!result.error) reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2" noValidate>
      <Textarea
        rows={3}
        placeholder="Write a reply..."
        error={!!errors.message}
        {...register("message")}
      />
      {errors.message && (
        <p className="text-sm text-destructive">{errors.message.message}</p>
      )}
      <Button type="submit" size="sm" isLoading={isSubmitting}>
        Reply
      </Button>
    </form>
  );
};

export default ForumReplyForm;
