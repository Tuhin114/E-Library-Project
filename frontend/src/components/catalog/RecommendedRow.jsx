import { Sparkles } from "lucide-react";
import BookCard from "./BookCard";

const RecommendedRow = ({ books }) => {
  if (!books || books.length === 0) return null;

  return (
    <section className="mb-8 min-w-0">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
          Recommended for you
        </h2>
      </div>

      <div className="flex min-w-0 snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
        {books.map((book) => (
          <BookCard
            key={book._id}
            book={book}
            variant="compact"
            subtitle={book.recommendationReason}
          />
        ))}
      </div>
    </section>
  );
};

export default RecommendedRow;
