import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { fetchPublishers } from "../../store/slices/publishersSlice";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import CardGridSkeleton from "../../components/common/CardGridSkeleton";

const Publishers = () => {
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.publishers);

  useEffect(() => {
    dispatch(fetchPublishers());
  }, [dispatch]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Publishers</h1>

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
            <Link key={publisher._id} to={`/publishers/${publisher.slug}`}>
              <Card className="h-full transition-colors hover:border-primary/50">
                <CardHeader className="flex flex-row items-start justify-between gap-2">
                  <CardTitle className="text-base">{publisher.name}</CardTitle>
                  <Badge variant="secondary" className="shrink-0">
                    {publisher.bookCount ?? 0} books
                  </Badge>
                </CardHeader>
                {publisher.country && (
                  <CardContent className="text-sm text-muted-foreground">
                    {publisher.country}
                  </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Publishers;
