import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAuthorBySlug,
  clearSelectedAuthor,
} from "../../store/slices/authorsSlice";
import { fetchBooks } from "../../store/slices/booksSlice";
import { Skeleton } from "../../components/ui/skeleton";
import ErrorState from "../../components/common/ErrorState";
import BookGrid from "../../components/catalog/BookGrid";
import EntityDetailHeader from "../../components/catalog/EntityDetailHeader";
import PageContainer from "../../components/layout/PageContainer";

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
      <PageContainer>
        <div className="space-y-3">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </PageContainer>
    );
  }

  if (detailStatus === "failed") {
    return (
      <PageContainer>
        <ErrorState
          message="Couldn't load this author. They may have been deleted."
          onRetry={() => dispatch(fetchAuthorBySlug(slug))}
        />
      </PageContainer>
    );
  }

  const badges = [
    author.nationality && { label: author.nationality },
    { label: `${author.bookCount ?? 0} books`, variant: "outline" },
  ].filter(Boolean);

  return (
    <PageContainer>
      <EntityDetailHeader
        title={author.name}
        badges={badges}
        description={author.bio}
      />

      <BookGrid
        books={books}
        isLoading={booksStatus === "loading"}
        emptyTitle="No books by this author yet"
        emptyDescription="Books by this author will appear here once added to the catalog."
      />
    </PageContainer>
  );
};

export default AuthorProfile;
