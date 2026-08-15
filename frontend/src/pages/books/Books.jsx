import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBooks } from "../../store/slices/booksSlice";
import { fetchRecommendations } from "../../store/slices/librarySlice";
import { useQueryParams } from "../../hooks/useQueryParams";
import { useDebounce } from "../../hooks/useDebounce";
import BookGrid from "../../components/catalog/BookGrid";
import RecommendedRow from "../../components/catalog/RecommendedRow";
import DiscoveryToolbar from "../../components/catalog/DiscoveryToolbar";
import FilterSidebar from "../../components/common/FilterSidebar";
import Pagination from "../../components/common/Pagination";
import MobileDrawer from "../../components/common/MobileDrawer";
import PageContainer from "../../components/layout/PageContainer";
import PageHeader from "../../components/layout/PageHeader";

const MORE_FILTER_KEYS = ["category", "author", "publisher", "language", "tags"];

const Books = () => {
  const dispatch = useDispatch();
  const { items, pagination, status } = useSelector((state) => state.books);
  const { recommendations } = useSelector((state) => state.library);
  const [params, setParams] = useQueryParams();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const debouncedSearch = useDebounce(params.search || "", 400);

  useEffect(() => {
    dispatch(
      fetchBooks({
        search: debouncedSearch || undefined,
        category: params.category,
        author: params.author,
        publisher: params.publisher,
        language: params.language,
        tags: params.tags,
        sort: params.sort,
        page: params.page || 1,
        limit: params.limit || 20,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dispatch,
    debouncedSearch,
    params.category,
    params.author,
    params.publisher,
    params.language,
    params.tags,
    params.sort,
    params.page,
    params.limit,
  ]);

  // Fetched once, independent of search/filters — it's not "results
  // for this query", it's a standing "you might also like" row.
  useEffect(() => {
    dispatch(fetchRecommendations());
  }, [dispatch]);

  const handleSearchChange = (value) =>
    setParams({ search: value || undefined, page: undefined });
  const handleFilterChange = (updates) =>
    setParams({ ...updates, page: undefined });
  const handlePageChange = (page) => setParams({ page: String(page) });

  const handleClearFilters = () =>
    setParams({
      search: undefined,
      category: undefined,
      author: undefined,
      publisher: undefined,
      language: undefined,
      tags: undefined,
      sort: undefined,
      page: undefined,
    });

  const moreFilterCount = MORE_FILTER_KEYS.filter((key) => Boolean(params[key])).length;
  const isDefaultView = moreFilterCount === 0 && !params.search;

  return (
    <PageContainer>
      <PageHeader
        title="Books"
        description="Browse the full collection, or search and filter to find exactly what you're looking for."
      />

      {isDefaultView && <RecommendedRow books={recommendations} />}

      <DiscoveryToolbar
        searchValue={params.search || ""}
        onSearchChange={handleSearchChange}
        filters={params}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        moreFilterCount={moreFilterCount}
        onOpenMoreFilters={() => setIsFiltersOpen(true)}
      />

      <div className="mt-6 space-y-6">
        <BookGrid
          books={items}
          isLoading={status === "loading"}
          emptyTitle="No books found"
          emptyDescription="Try adjusting your search or filters."
        />

        {pagination && pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      <MobileDrawer
        open={isFiltersOpen}
        onOpenChange={setIsFiltersOpen}
        title="Filters"
        side="right"
      >
        <FilterSidebar
          filters={params}
          onFilterChange={handleFilterChange}
          onClearFilters={() => {
            handleClearFilters();
            setIsFiltersOpen(false);
          }}
        />
      </MobileDrawer>
    </PageContainer>
  );
};

export default Books;
