import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LayoutGrid } from "lucide-react";
import { Link } from "react-router-dom";
import { fetchCategories } from "../../store/slices/categoriesSlice";
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

const Categories = () => {
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.categories);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Categories</h1>

      {status === "loading" && <CardGridSkeleton />}

      {status === "failed" && (
        <ErrorState
          message="Couldn't load categories."
          onRetry={() => dispatch(fetchCategories())}
        />
      )}

      {status === "succeeded" && items.length === 0 && (
        <EmptyState
          icon={LayoutGrid}
          title="No categories yet"
          description="Categories will appear here once a librarian adds them."
        />
      )}

      {status === "succeeded" && items.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((category) => (
            <Link key={category._id} to={`/categories/${category.slug}`}>
              <Card className="h-full transition-colors hover:border-primary/50">
                <CardHeader className="flex flex-row items-start justify-between gap-2">
                  <CardTitle className="text-base">{category.name}</CardTitle>
                  <Badge variant="secondary" className="shrink-0">
                    {category.bookCount ?? 0} books
                  </Badge>
                </CardHeader>
                {category.description && (
                  <CardContent className="text-sm text-muted-foreground">
                    {category.description}
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

export default Categories;
