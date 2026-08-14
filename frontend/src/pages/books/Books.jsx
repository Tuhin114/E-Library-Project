import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SlidersHorizontal } from "lucide-react";
import { fetchBooks } from "../../store/slices/booksSlice";
import { fetchRecommendations } from "../../store/slices/librarySlice";
import { useQueryParams } from "../../hooks/useQueryParams";
import { useDebounce } from "../../hooks/useDebounce";
import BookGrid from "../../components/catalog/BookGrid";
import RecommendedRow from "../../components/catalog/RecommendedRow";
import SearchBar from "../../components/common/SearchBar";
import FilterSidebar from "../../components/common/FilterSidebar";
import Pagination from "../../components/common/Pagination";
import MobileDrawer from "../../components/common/MobileDrawer";
import { Button } from "../../components/ui/button";

const Books = () => {
  const dispatch = useDispatch();
  const { items, pagination, status } = useSelector((state) => state.books);
  const { recommendations } = useSelector((state) => state.library);
  const [params, setParams] = useQueryParams();
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

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

  const activeFilterCount = [
    "category",
    "author",
    "publisher",
    "language",
    "tags",
    "sort",
  ].filter((key) => Boolean(params[key])).length;

  const isDefaultView = activeFilterCount === 0 && !params.search;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Books</h1>

      {isDefaultView && <RecommendedRow books={recommendations} />}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="max-w-lg flex-1">
          <SearchBar
            value={params.search || ""}
            onChange={handleSearchChange}
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-fit md:hidden"
          onClick={() => setIsFilterDrawerOpen(true)}
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
        </Button>
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        <div className="hidden md:block">
          <FilterSidebar
            filters={params}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        </div>

        <div className="flex-1 space-y-6">
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
      </div>

      <MobileDrawer
        open={isFilterDrawerOpen}
        onOpenChange={setIsFilterDrawerOpen}
        title="Filters"
        side="right"
      >
        <FilterSidebar
          filters={params}
          onFilterChange={handleFilterChange}
          onClearFilters={() => {
            handleClearFilters();
            setIsFilterDrawerOpen(false);
          }}
        />
      </MobileDrawer>
    </div>
  );
};

export default Books;
