import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAuthorBySlug,
  clearSelectedAuthor,
} from "../../store/slices/authorsSlice";
import { fetchBooks } from "../../store/slices/booksSlice";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import ErrorState from "../../components/common/ErrorState";
import BookGrid from "../../components/catalog/BookGrid";

const AuthorProfile = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { selected: author, detailStatus } = useSelector(
    (state) => state.authors,
  );
  const { items: books, status: booksStatus } = useSelector(
    (state) => state.books,
  );

  useEffect(() => {
    dispatch(fetchAuthorBySlug(slug));
    return () => dispatch(clearSelectedAuthor());
  }, [dispatch, slug]);

  useEffect(() => {
    if (author?._id) {
      dispatch(fetchBooks({ author: author._id, limit: 50 }));
    }
  }, [dispatch, author?._id]);

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
        message="Couldn't load this author. They may have been deleted."
        onRetry={() => dispatch(fetchAuthorBySlug(slug))}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{author.name}</h1>
        {author.nationality && (
          <Badge variant="secondary">{author.nationality}</Badge>
        )}
        <Badge variant="outline">{author.bookCount ?? 0} books</Badge>
      </div>
      {author.bio && (
        <p className="mt-3 max-w-2xl text-muted-foreground">{author.bio}</p>
      )}

      <div className="mt-8">
        <BookGrid
          books={books}
          isLoading={booksStatus === "loading"}
          emptyTitle="No books by this author yet"
          emptyDescription="Books by this author will appear here once added to the catalog."
        />
      </div>
    </div>
  );
};

export default AuthorProfile;
