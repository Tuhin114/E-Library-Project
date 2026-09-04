import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from "react-redux";
import { reportSchema } from "@/lib/validationSchemas/forumSchema";
import { reportResource } from "@/store/slices/resourcesSlice";
import { REPORT_REASON_OPTIONS } from "@/constants/reportReasons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

/**
 * Same UI shape as components/forum/ReportDialog.jsx, deliberately kept
 * as its own small component rather than generalizing that one —
 * ReportDialog dispatches forumSlice's reportContent thunk directly, and
 * threading a third content domain through forum-specific state felt
 * like the wrong coupling for what's a five-field form.
 */
const ReportResourceDialog = ({ open, onOpenChange, resourceId }) => {
  const dispatch = useDispatch();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(reportSchema) });

  const handleClose = (next) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const onSubmit = async (payload) => {
    const result = await dispatch(reportResource({ id: resourceId, payload }));
    if (!result.error) handleClose(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report this resource</DialogTitle>
          <DialogDescription>
            A librarian will review this. Reporting doesn't hide the
            resource automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Controller
            control={control}
            name="reason"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_REASON_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.reason && (
            <p className="text-sm text-destructive">{errors.reason.message}</p>
          )}

          <Textarea
            rows={3}
            placeholder="Any additional details (optional)"
            error={!!errors.details}
            {...register("details")}
          />
          {errors.details && (
            <p className="text-sm text-destructive">{errors.details.message}</p>
          )}

          <DialogFooter>
            <Button type="submit" isLoading={isSubmitting}>
              Submit report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportResourceDialog;
