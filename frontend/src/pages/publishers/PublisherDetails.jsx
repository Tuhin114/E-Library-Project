import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPublisherBySlug,
  clearSelectedPublisher,
} from "../../store/slices/publishersSlice";
import { fetchBooks } from "../../store/slices/booksSlice";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import ErrorState from "../../components/common/ErrorState";
import BookGrid from "../../components/catalog/BookGrid";

const PublisherDetails = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { selected: publisher, detailStatus } = useSelector(
    (state) => state.publishers,
  );
  const { items: books, status: booksStatus } = useSelector(
    (state) => state.books,
  );

  useEffect(() => {
    dispatch(fetchPublisherBySlug(slug));
    return () => dispatch(clearSelectedPublisher());
  }, [dispatch, slug]);

  useEffect(() => {
    if (publisher?._id) {
      dispatch(fetchBooks({ publisher: publisher._id, limit: 50 }));
    }
  }, [dispatch, publisher?._id]);

  if (detailStatus === "loading" || detailStatus === "idle") {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  if (detailStatus === "failed") {
    return (
      <ErrorState
        message="Couldn't load this publisher. It may have been deleted."
        onRetry={() => dispatch(fetchPublisherBySlug(slug))}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          {publisher.name}
        </h1>
        <Badge variant="outline">{publisher.bookCount ?? 0} books</Badge>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 text-sm text-muted-foreground">
        {publisher.country && <span>{publisher.country}</span>}
        {publisher.website && (
          <a
            href={publisher.website}
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline"
          >
            {publisher.website}
          </a>
        )}
      </div>
      {publisher.description && (
        <p className="mt-3 max-w-2xl text-muted-foreground">
          {publisher.description}
        </p>
      )}

      <div className="mt-8">
        <BookGrid
          books={books}
          isLoading={booksStatus === "loading"}
          emptyTitle="No books from this publisher yet"
          emptyDescription="Books from this publisher will appear here once added to the catalog."
        />
      </div>
    </div>
  );
};

export default PublisherDetails;
