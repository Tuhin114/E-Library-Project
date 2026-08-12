import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCategoryBySlug,
  clearSelectedCategory,
} from "../../store/slices/categoriesSlice";
import { fetchBooks } from "../../store/slices/booksSlice";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import ErrorState from "../../components/common/ErrorState";
import BookGrid from "../../components/catalog/BookGrid";

const CategoryDetails = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { selected: category, detailStatus } = useSelector(
    (state) => state.categories,
  );
  const { items: books, status: booksStatus } = useSelector(
    (state) => state.books,
  );

  useEffect(() => {
    dispatch(fetchCategoryBySlug(slug));
    return () => dispatch(clearSelectedCategory());
  }, [dispatch, slug]);

  useEffect(() => {
    if (category?._id) {
      dispatch(fetchBooks({ category: category._id, limit: 50 }));
    }
  }, [dispatch, category?._id]);

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
        message="Couldn't load this category. It may have been deleted."
        onRetry={() => dispatch(fetchCategoryBySlug(slug))}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          {category.name}
        </h1>
        <Badge variant="secondary">{category.bookCount ?? 0} books</Badge>
      </div>
      {category.description && (
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {category.description}
        </p>
      )}

      <div className="mt-8">
        <BookGrid
          books={books}
          isLoading={booksStatus === "loading"}
          emptyTitle="No books in this category yet"
          emptyDescription="Books added to this category will appear here."
        />
      </div>
    </div>
  );
};

export default CategoryDetails;
