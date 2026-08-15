import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LayoutGrid } from "lucide-react";
import { fetchCategories } from "../../store/slices/categoriesSlice";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import CardGridSkeleton from "../../components/common/CardGridSkeleton";
import EntityCard from "../../components/catalog/EntityCard";
import PageContainer from "../../components/layout/PageContainer";
import PageHeader from "../../components/layout/PageHeader";

const Categories = () => {
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.categories);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <PageContainer>
      <PageHeader title="Categories" description="Browse the collection by subject." />

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
            <EntityCard
              key={category._id}
              to={`/categories/${category.slug}`}
              title={category.name}
              countLabel={`${category.bookCount ?? 0} books`}
              description={category.description}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
};

export default Categories;
