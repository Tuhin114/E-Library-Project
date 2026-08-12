import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Users } from "lucide-react";
import { Link } from "react-router-dom";
import { fetchAuthors } from "../../store/slices/authorsSlice";
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

const Authors = () => {
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.authors);

  useEffect(() => {
    dispatch(fetchAuthors());
  }, [dispatch]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Authors</h1>

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
            <Link key={author._id} to={`/authors/${author.slug}`}>
              <Card className="h-full transition-colors hover:border-primary/50">
                <CardHeader className="flex flex-row items-start justify-between gap-2">
                  <CardTitle className="text-base">{author.name}</CardTitle>
                  <Badge variant="secondary" className="shrink-0">
                    {author.bookCount ?? 0} books
                  </Badge>
                </CardHeader>
                {author.bio && (
                  <CardContent className="line-clamp-3 text-sm text-muted-foreground">
                    {author.bio}
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

export default Authors;
