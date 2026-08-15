import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPublisherBySlug,
  clearSelectedPublisher,
} from "../../store/slices/publishersSlice";
import { fetchBooks } from "../../store/slices/booksSlice";
import { Skeleton } from "../../components/ui/skeleton";
import ErrorState from "../../components/common/ErrorState";
import BookGrid from "../../components/catalog/BookGrid";
import EntityDetailHeader from "../../components/catalog/EntityDetailHeader";
import PageContainer from "../../components/layout/PageContainer";

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
          message="Couldn't load this publisher. It may have been deleted."
          onRetry={() => dispatch(fetchPublisherBySlug(slug))}
        />
      </PageContainer>
    );
  }

  const meta = (publisher.country || publisher.website) && (
    <>
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
    </>
  );

  return (
    <PageContainer>
      <EntityDetailHeader
        title={publisher.name}
        badges={[{ label: `${publisher.bookCount ?? 0} books`, variant: "outline" }]}
        meta={meta}
        description={publisher.description}
      />

      <BookGrid
        books={books}
        isLoading={booksStatus === "loading"}
        emptyTitle="No books from this publisher yet"
        emptyDescription="Books from this publisher will appear here once added to the catalog."
      />
    </PageContainer>
  );
};

export default PublisherDetails;
