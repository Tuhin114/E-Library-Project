import { Link } from "react-router-dom";
import { BookOpen, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle } from "../ui/card";

const RecommendedRow = ({ books }) => {
  if (!books || books.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h2 className="text-lg font-semibold tracking-tight">
          Recommended for you
        </h2>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {books.map((book) => (
          <Link key={book._id} to={`/books/${book._id}`} className="w-40 shrink-0">
            <Card className="flex h-full flex-col overflow-hidden transition-colors hover:border-primary/50">
              <div className="flex aspect-[3/4] items-center justify-center bg-muted">
                {book.coverImage?.url ? (
                  <img
                    src={book.coverImage.url}
                    alt={book.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <CardHeader className="flex-1 space-y-1 p-2">
                <CardTitle className="line-clamp-2 text-xs">{book.title}</CardTitle>
                {book.recommendationReason && (
                  <p className="line-clamp-2 text-[11px] text-muted-foreground">
                    {book.recommendationReason}
                  </p>
                )}
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RecommendedRow;
