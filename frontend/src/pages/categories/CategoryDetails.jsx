import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCategoryBySlug,
  clearSelectedCategory,
} from "../../store/slices/categoriesSlice";
import { fetchBooks } from "../../store/slices/booksSlice";
import { Skeleton } from "../../components/ui/skeleton";
import ErrorState from "../../components/common/ErrorState";
import BookGrid from "../../components/catalog/BookGrid";
import EntityDetailHeader from "../../components/catalog/EntityDetailHeader";
import PageContainer from "../../components/layout/PageContainer";

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
          message="Couldn't load this category. It may have been deleted."
          onRetry={() => dispatch(fetchCategoryBySlug(slug))}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <EntityDetailHeader
        title={category.name}
        badges={[{ label: `${category.bookCount ?? 0} books` }]}
        description={category.description}
      />

      <BookGrid
        books={books}
        isLoading={booksStatus === "loading"}
        emptyTitle="No books in this category yet"
        emptyDescription="Books added to this category will appear here."
      />
    </PageContainer>
  );
};

export default CategoryDetails;
