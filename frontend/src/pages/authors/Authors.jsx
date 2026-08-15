import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Users } from "lucide-react";
import { fetchAuthors } from "../../store/slices/authorsSlice";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import CardGridSkeleton from "../../components/common/CardGridSkeleton";
import EntityCard from "../../components/catalog/EntityCard";
import PageContainer from "../../components/layout/PageContainer";
import PageHeader from "../../components/layout/PageHeader";

const Authors = () => {
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.authors);

  useEffect(() => {
    dispatch(fetchAuthors());
  }, [dispatch]);

  return (
    <PageContainer>
      <PageHeader title="Authors" description="Browse the collection by author." />

      {status === "loading" && <CardGridSkeleton />}

      {status === "failed" && (
        <ErrorState
          message="Couldn't load authors."
          onRetry={() => dispatch(fetchAuthors())}
        />
      )}

      {status === "succeeded" && items.length === 0 && (
        <EmptyState
          icon={Users}
          title="No authors yet"
          description="Authors will appear here once a librarian adds them."
        />
      )}

      {status === "succeeded" && items.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((author) => (
            <EntityCard
              key={author._id}
              to={`/authors/${author.slug}`}
              title={author.name}
              countLabel={`${author.bookCount ?? 0} books`}
              description={author.bio}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
};

export default Authors;
