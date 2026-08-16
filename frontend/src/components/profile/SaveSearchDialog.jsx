import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from "react-redux";
import { saveSearchSchema } from "@/lib/validationSchemas/profileSchema";
import { saveCurrentSearch } from "@/store/slices/librarySlice";
import { toast } from "@/hooks/useToast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * `queryParams` is the flat filter object currently in the URL (see
 * useQueryParams) — stored as-is so re-running the search later is
 * just a navigation to /books?<queryParams>.
 */
const SaveSearchDialog = ({ open, onOpenChange, queryParams }) => {
  const dispatch = useDispatch();
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(saveSearchSchema) });

  const handleClose = (next) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const onSubmit = async ({ name }) => {
    setIsSaving(true);
    try {
      await dispatch(saveCurrentSearch({ name, queryParams })).unwrap();
      toast.success("Search saved");
      handleClose(false);
    } catch (error) {
      toast.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save this search</DialogTitle>
          <DialogDescription>
            Give it a name so you can quickly run it again from your profile.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="searchName">Name</Label>
            <Input
              id="searchName"
              placeholder="e.g. New sci-fi arrivals"
              error={!!errors.name}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" isLoading={isSaving}>
              Save search
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SaveSearchDialog;
