import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { BookOpen } from "lucide-react";
import {
  fetchBookById,
  clearSelectedBook,
} from "../../store/slices/booksSlice";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import FavoriteButton from "../../components/catalog/FavoriteButton";

const BookDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selected: book, status } = useSelector((state) => state.books);

  useEffect(() => {
    dispatch(fetchBookById(id));
    return () => dispatch(clearSelectedBook());
  }, [dispatch, id]);

  if (status === "loading" || !book) {
    return (
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[280px_1fr]">
        <Skeleton className="aspect-[3/4] w-full" />
        <div className="space-y-3">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  const authorLinks = book.authors || [];

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-[280px_1fr]">
      <div className="flex aspect-[3/4] items-center justify-center rounded-lg bg-muted">
        {book.coverImage?.url ? (
          <img
            src={book.coverImage.url}
            alt={book.title}
            className="h-full w-full rounded-lg object-cover"
          />
        ) : (
          <BookOpen className="h-16 w-16 text-muted-foreground" />
        )}
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            {book.title}
          </h1>
          <Badge
            variant={book.status === "published" ? "default" : "secondary"}
            className="capitalize"
          >
            {book.status}
          </Badge>
        </div>
        {book.subtitle && (
          <p className="mt-1 text-muted-foreground">{book.subtitle}</p>
        )}

        <div className="mt-2 flex flex-wrap gap-1 text-sm text-muted-foreground">
          {authorLinks.map((author, index) => (
            <span key={author._id}>
              <Link
                to={`/authors/${author.slug}`}
                className="text-primary hover:underline"
              >
                {author.name}
              </Link>
              {index < authorLinks.length - 1 && ", "}
            </span>
          ))}
        </div>

        <div className="mt-4">
          <FavoriteButton bookId={book._id} variant="full" />
        </div>

        {book.description && (
          <p className="mt-4 max-w-2xl text-sm leading-relaxed">
            {book.description}
          </p>
        )}

        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted-foreground">ISBN</dt>
            <dd className="font-medium">{book.isbn}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Language</dt>
            <dd className="font-medium">{book.language}</dd>
          </div>
          {book.edition && (
            <div>
              <dt className="text-muted-foreground">Edition</dt>
              <dd className="font-medium">{book.edition}</dd>
            </div>
          )}
          {book.publicationYear && (
            <div>
              <dt className="text-muted-foreground">Published</dt>
              <dd className="font-medium">{book.publicationYear}</dd>
            </div>
          )}
          {book.numberOfPages && (
            <div>
              <dt className="text-muted-foreground">Pages</dt>
              <dd className="font-medium">{book.numberOfPages}</dd>
            </div>
          )}
          {book.category?.name && (
            <div>
              <dt className="text-muted-foreground">Category</dt>
              <dd>
                <Link
                  to={`/categories/${book.category.slug}`}
                  className="font-medium text-primary hover:underline"
                >
                  {book.category.name}
                </Link>
              </dd>
            </div>
          )}
          {book.publisher?.name && (
            <div>
              <dt className="text-muted-foreground">Publisher</dt>
              <dd>
                <Link
                  to={`/publishers/${book.publisher.slug}`}
                  className="font-medium text-primary hover:underline"
                >
                  {book.publisher.name}
                </Link>
              </dd>
            </div>
          )}
        </dl>

        {book.tags?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {book.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* TODO (Phase 3): render Read / Download actions once the in-browser
            reader exists — digitalFiles.pdf/epub URLs are already populated
            from Milestone 3. */}
      </div>
    </div>
  );
};

export default BookDetails;
