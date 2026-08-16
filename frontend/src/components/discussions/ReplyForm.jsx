import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from "react-redux";
import { replyMessageSchema } from "@/lib/validationSchemas/discussionSchema";
import { postReply } from "@/store/slices/discussionsSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ReplyForm = ({ discussionId, onDone }) => {
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(replyMessageSchema) });

  const onSubmit = async (payload) => {
    const result = await dispatch(postReply({ discussionId, payload }));
    if (!result.error) onDone?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-2 flex gap-2" noValidate>
      <div className="flex-1">
        <Input placeholder="Write a reply..." error={!!errors.message} {...register("message")} />
        {errors.message && (
          <p className="mt-1 text-xs text-destructive">{errors.message.message}</p>
        )}
      </div>
      <Button type="submit" size="sm" variant="outline" isLoading={isSubmitting}>
        Reply
      </Button>
    </form>
  );
};

export default ReplyForm;
