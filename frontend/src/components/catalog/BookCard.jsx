import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import FavoriteButton from "./FavoriteButton";

const BookCard = ({ book }) => {
  const authorNames = (book.authors || [])
    .map((author) => author.name)
    .join(", ");

  return (
    <Link to={`/books/${book._id}`}>
      <Card className="flex h-full flex-col overflow-hidden transition-colors hover:border-primary/50">
        <div className="relative flex aspect-[3/4] items-center justify-center bg-muted">
          {book.coverImage?.url ? (
            <img
              src={book.coverImage.url}
              alt={book.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <BookOpen className="h-10 w-10 text-muted-foreground" />
          )}

          <div className="absolute right-1.5 top-1.5 rounded-full bg-background/80 backdrop-blur">
            <FavoriteButton bookId={book._id} variant="icon" />
          </div>
        </div>
        <CardHeader className="flex-1 pb-2">
          <CardTitle className="line-clamp-2 text-sm">{book.title}</CardTitle>
          {authorNames && (
            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
              {authorNames}
            </p>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          {book.category?.name && (
            <Badge variant="secondary" className="text-xs">
              {book.category.name}
            </Badge>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default BookCard;
