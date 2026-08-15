import { BookOpen } from "lucide-react";
import BookCard from "./BookCard";
import { Skeleton } from "../ui/skeleton";
import EmptyState from "../common/EmptyState";

const GRID_CLASSES =
  "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";

const BookGrid = ({
  books,
  isLoading,
  emptyTitle = "No books found",
  emptyDescription = "",
}) => {
  if (isLoading) {
    return (
      <div className={GRID_CLASSES}>
        {Array.from({ length: 12 }).map((_, index) => (
          <Skeleton key={index} className="aspect-[2/3] w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!books || books.length === 0) {
    return (
      <EmptyState icon={BookOpen} title={emptyTitle} description={emptyDescription} />
    );
  }

  return (
    <div className={GRID_CLASSES}>
      {books.map((book) => (
        <BookCard key={book._id} book={book} />
      ))}
    </div>
  );
};

export default BookGrid;
