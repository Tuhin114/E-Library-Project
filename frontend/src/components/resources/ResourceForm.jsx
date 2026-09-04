import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resourceSchema } from "../../lib/validationSchemas/resourceSchema";
import {
  RESOURCE_TYPE_VALUES,
  RESOURCE_TYPE_LABELS,
} from "../../constants/resourceType";
import {
  RESOURCE_VISIBILITY_VALUES,
  RESOURCE_VISIBILITY_LABELS,
} from "../../constants/resourceVisibility";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";

/**
 * Handles both create and edit. File upload is deliberately left out
 * of this form, the same split BookForm uses for cover/PDF/EPUB — a
 * resource record has to exist first so the file has an id to attach
 * to. See UploadResource.jsx (create, then redirect) and
 * EditResource.jsx (form + FileDropzone together).
 */
const ResourceForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Save Resource",
}) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resourceSchema),
    defaultValues: defaultValues || {
      title: "",
      description: "",
      resourceType: "note",
      subject: "",
      authorsInput: "",
      tagsInput: "",
      visibility: "private",
    },
  });

  useEffect(() => {
    if (defaultValues) reset(defaultValues);
  }, [defaultValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" error={!!errors.title} {...register("title")} />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Resource Type</Label>
          <Controller
            control={control}
            name="resourceType"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESOURCE_TYPE_VALUES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {RESOURCE_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            placeholder="e.g. Computer Science"
            {...register("subject")}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="authorsInput">Author(s), comma-separated</Label>
          <Input
            id="authorsInput"
            placeholder="e.g. Jane Doe, John Smith"
            {...register("authorsInput")}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="tagsInput">Tags (comma-separated)</Label>
          <Input
            id="tagsInput"
            placeholder="e.g. machine-learning, thesis"
            {...register("tagsInput")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={4} {...register("description")} />
      </div>

      <div className="space-y-2">
        <Label>Visibility</Label>
        <Controller
          control={control}
          name="visibility"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="md:w-1/3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RESOURCE_VISIBILITY_VALUES.map((visibility) => (
                  <SelectItem key={visibility} value={visibility}>
                    {RESOURCE_VISIBILITY_LABELS[visibility]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <p className="text-xs text-muted-foreground">
          Private resources are only visible to you and librarians. You can
          switch this any time.
        </p>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
        {isSubmitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
};

export default ResourceForm;
