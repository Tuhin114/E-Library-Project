import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Building2 } from "lucide-react";
import { fetchPublishers } from "../../store/slices/publishersSlice";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import CardGridSkeleton from "../../components/common/CardGridSkeleton";
import EntityCard from "../../components/catalog/EntityCard";
import PageContainer from "../../components/layout/PageContainer";
import PageHeader from "../../components/layout/PageHeader";

const Publishers = () => {
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.publishers);

  useEffect(() => {
    dispatch(fetchPublishers());
  }, [dispatch]);

  return (
    <PageContainer>
      <PageHeader title="Publishers" description="Browse the collection by publisher." />

      {status === "loading" && <CardGridSkeleton />}

      {status === "failed" && (
        <ErrorState
          message="Couldn't load publishers."
          onRetry={() => dispatch(fetchPublishers())}
        />
      )}

      {status === "succeeded" && items.length === 0 && (
        <EmptyState
          icon={Building2}
          title="No publishers yet"
          description="Publishers will appear here once a librarian adds them."
        />
      )}

      {status === "succeeded" && items.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((publisher) => (
            <EntityCard
              key={publisher._id}
              to={`/publishers/${publisher.slug}`}
              title={publisher.name}
              countLabel={`${publisher.bookCount ?? 0} books`}
              description={publisher.country}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
};

export default Publishers;
