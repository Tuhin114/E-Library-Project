import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { BookOpen, Boxes, PackageCheck } from "lucide-react";
import {
  fetchBookById,
  clearSelectedBook,
} from "../../store/slices/booksSlice";
import { fetchRecommendations } from "../../store/slices/librarySlice";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { Button } from "../../components/ui/button";
import { StarRating } from "../../components/ui/star-rating";
import FavoriteButton from "../../components/catalog/FavoriteButton";
import RecommendedRow from "../../components/catalog/RecommendedRow";
import BookStatusBadge from "../../components/catalog/BookStatusBadge";
import ReviewList from "../../components/reviews/ReviewList";
import DiscussionList from "../../components/discussions/DiscussionList";
import ShareButton from "../../components/common/ShareButton";
import RequestForm from "../../components/requests/RequestForm";
import WaitlistButton from "../../components/waitlist/WaitlistButton";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";
import { useAuth } from "../../hooks/useAuth";
import PageContainer from "../../components/layout/PageContainer";

const BookDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { selected: book, status } = useSelector((state) => state.books);
  const { recommendations } = useSelector((state) => state.library);
  const [isRequestOpen, setIsRequestOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchBookById(id));
    return () => dispatch(clearSelectedBook());
  }, [dispatch, id]);

  useEffect(() => {
    dispatch(fetchRecommendations());
  }, [dispatch]);

  useDocumentMeta({ title: book?.title, description: book?.description });

  if (status === "loading" || !book) {
    return (
      <PageContainer>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[300px_1fr]">
          <Skeleton className="aspect-[2/3] w-full max-w-sm rounded-2xl md:max-w-none" />
          <div className="space-y-3 pt-2">
            <Skeleton className="h-9 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </PageContainer>
    );
  }

  const authorLinks = book.authors || [];
  const hasDigitalCopy = Boolean(
    book.digitalFiles?.pdf?.available || book.digitalFiles?.epub?.available,
  );

  return (
    <PageContainer>
      <div className="grid grid-cols-1 gap-10 md:grid-cols-[300px_1fr]">
        <div className="aspect-[2/3] w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-secondary md:max-w-none">
          {book.coverImage?.url ? (
            <img
              src={book.coverImage.url}
              alt={book.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <BookOpen className="h-16 w-16 text-muted-foreground" strokeWidth={1.5} />
            </div>
          )}
        </div>

        <div className="min-w-0">
          {book.category?.name && (
            <Link
              to={`/categories/${book.category.slug}`}
              className="text-xs font-semibold uppercase tracking-wider text-primary hover:underline"
            >
              {book.category.name}
            </Link>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
              {book.title}
            </h1>
            <BookStatusBadge status={book.status} />
          </div>

          {book.reviewCount > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <StarRating value={book.avgRating} size="sm" />
              <span className="text-sm text-muted-foreground">
                {book.avgRating.toFixed(1)} ({book.reviewCount}{" "}
                {book.reviewCount === 1 ? "review" : "reviews"})
              </span>
            </div>
          )}

          {book.physicalCopiesTotal > 0 && (
            <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Boxes className="h-4 w-4" />
              {book.physicalCopiesAvailable > 0 ? (
                <span>
                  {book.physicalCopiesAvailable} of {book.physicalCopiesTotal} physical{" "}
                  {book.physicalCopiesTotal === 1 ? "copy" : "copies"} available
                </span>
              ) : (
                <span>All physical copies currently unavailable</span>
              )}
            </div>
          )}

          {book.subtitle && (
            <p className="mt-1 text-muted-foreground">{book.subtitle}</p>
          )}

          {authorLinks.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1 text-sm text-muted-foreground">
              {authorLinks.map((author, index) => (
                <span key={author._id}>
                  <Link
                    to={`/authors/${author.slug}`}
                    className="text-foreground hover:text-primary hover:underline"
                  >
                    {author.name}
                  </Link>
                  {index < authorLinks.length - 1 && ", "}
                </span>
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <FavoriteButton bookId={book._id} variant="full" />
            {hasDigitalCopy && (
              <Link to={`/books/${book._id}/read`}>
                <Button>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Read Online
                </Button>
              </Link>
            )}
            <ShareButton title={book.title} text={`Check out "${book.title}" on E-Library`} />
            {user?.role !== "librarian" && book.physicalCopiesTotal > 0 && (
              <Button variant="outline" onClick={() => setIsRequestOpen(true)}>
                <PackageCheck className="mr-2 h-4 w-4" />
                Request Physical Copy
              </Button>
            )}
            {user?.role !== "librarian" &&
              book.physicalCopiesTotal > 0 &&
              book.physicalCopiesAvailable === 0 && <WaitlistButton bookId={book._id} />}
          </div>

          {book.description && (
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-foreground/90">
              {book.description}
            </p>
          )}

          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-border pt-6 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs text-muted-foreground">ISBN</dt>
              <dd className="mt-0.5 font-medium">{book.isbn}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Language</dt>
              <dd className="mt-0.5 font-medium">{book.language}</dd>
            </div>
            {book.edition && (
              <div>
                <dt className="text-xs text-muted-foreground">Edition</dt>
                <dd className="mt-0.5 font-medium">{book.edition}</dd>
              </div>
            )}
            {book.publicationYear && (
              <div>
                <dt className="text-xs text-muted-foreground">Published</dt>
                <dd className="mt-0.5 font-medium">{book.publicationYear}</dd>
              </div>
            )}
            {book.numberOfPages && (
              <div>
                <dt className="text-xs text-muted-foreground">Pages</dt>
                <dd className="mt-0.5 font-medium">{book.numberOfPages}</dd>
              </div>
            )}
            {book.publisher?.name && (
              <div>
                <dt className="text-xs text-muted-foreground">Publisher</dt>
                <dd className="mt-0.5">
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
            <div className="mt-6 flex flex-wrap gap-2">
              {book.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 max-w-3xl border-t border-border pt-8">
        <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
          Reviews
        </h2>
        <div className="mt-4">
          <ReviewList bookId={book._id} />
        </div>
      </div>

      <div className="mt-12 max-w-3xl border-t border-border pt-8">
        <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
          Discussion
        </h2>
        <div className="mt-4">
          <DiscussionList bookId={book._id} />
        </div>
      </div>

      <div className="mt-16">
        <RecommendedRow books={recommendations} />
      </div>

      <RequestForm open={isRequestOpen} onOpenChange={setIsRequestOpen} book={book} />
    </PageContainer>
  );
};

export default BookDetails;
