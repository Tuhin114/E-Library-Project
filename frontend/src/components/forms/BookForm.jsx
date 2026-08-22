import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { UploadCloud } from "lucide-react";
import { bookSchema } from "../../lib/validationSchemas/bookSchema";
import { fetchCategories } from "../../store/slices/categoriesSlice";
import { fetchAuthors } from "../../store/slices/authorsSlice";
import { fetchPublishers } from "../../store/slices/publishersSlice";
import {
  BOOK_STATUS_VALUES,
  BOOK_STATUS_LABELS,
} from "../../constants/bookStatus";
import {
  BOOK_VISIBILITY_VALUES,
  BOOK_VISIBILITY_LABELS,
} from "../../constants/bookVisibility";
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
 * Handles both create and edit. `defaultValues` should already be shaped
 * for the form (category/publisher as id strings, authors as id array,
 * tagsInput as a comma-separated string) — see EditBook.jsx for the mapping
 * from a populated Book document to this shape.
 *
 * File upload fields (cover/PDF/EPUB) are intentionally disabled here.
 * They're wired to real Cloudinary uploads in Milestone 3, once a book
 * record exists to attach the files to.
 */
const BookForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Save Book",
}) => {
  const dispatch = useDispatch();
  const { items: categories } = useSelector((state) => state.categories);
  const { items: authors } = useSelector((state) => state.authors);
  const { items: publishers } = useSelector((state) => state.publishers);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bookSchema),
    defaultValues: defaultValues || {
      title: "",
      subtitle: "",
      isbn: "",
      description: "",
      language: "English",
      edition: "",
      publicationYear: undefined,
      numberOfPages: undefined,
      category: "",
      authors: [],
      publisher: "",
      tagsInput: "",
      visibility: "public",
      status: "draft",
    },
  });

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchAuthors());
    dispatch(fetchPublishers());
  }, [dispatch]);

  useEffect(() => {
    if (defaultValues) reset(defaultValues);
  }, [defaultValues, reset]);

  const selectedAuthors = watch("authors") || [];

  const toggleAuthor = (authorId) => {
    const next = selectedAuthors.includes(authorId)
      ? selectedAuthors.filter((id) => id !== authorId)
      : [...selectedAuthors, authorId];
    setValue("authors", next, { shouldValidate: true });
  };

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

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="subtitle">Subtitle</Label>
          <Input id="subtitle" {...register("subtitle")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="isbn">ISBN</Label>
          <Input id="isbn" error={!!errors.isbn} {...register("isbn")} />
          {errors.isbn && (
            <p className="text-sm text-destructive">{errors.isbn.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Input
            id="language"
            error={!!errors.language}
            {...register("language")}
          />
          {errors.language && (
            <p className="text-sm text-destructive">
              {errors.language.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="edition">Edition</Label>
          <Input
            id="edition"
            placeholder="e.g. 2nd Edition"
            {...register("edition")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="publicationYear">Publication Year</Label>
          <Input
            id="publicationYear"
            type="number"
            error={!!errors.publicationYear}
            {...register("publicationYear")}
          />
          {errors.publicationYear && (
            <p className="text-sm text-destructive">
              {errors.publicationYear.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="numberOfPages">Number of Pages</Label>
          <Input
            id="numberOfPages"
            type="number"
            error={!!errors.numberOfPages}
            {...register("numberOfPages")}
          />
          {errors.numberOfPages && (
            <p className="text-sm text-destructive">
              {errors.numberOfPages.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tagsInput">Tags (comma-separated)</Label>
          <Input
            id="tagsInput"
            placeholder="e.g. fiction, classic, bestseller"
            {...register("tagsInput")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={4} {...register("description")} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Category</Label>
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.category && (
            <p className="text-sm text-destructive">
              {errors.category.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Publisher</Label>
          <Controller
            control={control}
            name="publisher"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select publisher" />
                </SelectTrigger>
                <SelectContent>
                  {publishers.map((publisher) => (
                    <SelectItem key={publisher._id} value={publisher._id}>
                      {publisher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.publisher && (
            <p className="text-sm text-destructive">
              {errors.publisher.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BOOK_STATUS_VALUES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {BOOK_STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
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
                {BOOK_VISIBILITY_VALUES.map((visibility) => (
                  <SelectItem key={visibility} value={visibility}>
                    {BOOK_VISIBILITY_LABELS[visibility]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="space-y-2">
        <Label>Author(s)</Label>
        <div className="flex flex-wrap gap-2 rounded-2xl border border-input p-3">
          {authors.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No authors available yet.
            </p>
          )}
          {authors.map((author) => {
            const isSelected = selectedAuthors.includes(author._id);
            return (
              <button
                key={author._id}
                type="button"
                onClick={() => toggleAuthor(author._id)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  isSelected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-accent/15"
                }`}
              >
                {author.name}
              </button>
            );
          })}
        </div>
        {errors.authors && (
          <p className="text-sm text-destructive">{errors.authors.message}</p>
        )}
      </div>

      {/* File upload — enabled in Milestone 3 once Cloudinary upload endpoints exist. */}
      <div className="space-y-2">
        <Label>Cover Image, PDF & EPUB</Label>
        <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
          <UploadCloud className="h-5 w-5" />
          File uploads will be available here once this book is saved.
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full md:w-auto"
      >
        {isSubmitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
};

export default BookForm;
