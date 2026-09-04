import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { fetchResources } from "../../store/slices/resourcesSlice";
import { useQueryParams } from "../../hooks/useQueryParams";
import { useDebounce } from "../../hooks/useDebounce";
import ResourceGrid from "../../components/resources/ResourceGrid";
import ResourceToolbar from "../../components/resources/ResourceToolbar";
import Pagination from "../../components/common/Pagination";
import PageContainer from "../../components/layout/PageContainer";
import PageHeader from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/button";

const Resources = () => {
  const dispatch = useDispatch();
  const { items, pagination, status } = useSelector(
    (state) => state.resources,
  );
  const [params, setParams] = useQueryParams();

  const debouncedSearch = useDebounce(params.search || "", 400);

  useEffect(() => {
    dispatch(
      fetchResources({
        search: debouncedSearch || undefined,
        resourceType: params.resourceType,
        mine: params.mine,
        sort: params.sort,
        page: params.page || 1,
        limit: params.limit || 20,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dispatch,
    debouncedSearch,
    params.resourceType,
    params.mine,
    params.sort,
    params.page,
    params.limit,
  ]);

  const handleSearchChange = (value) =>
    setParams({ search: value || undefined, page: undefined });
  const handleFilterChange = (updates) =>
    setParams({ ...updates, page: undefined });
  const handlePageChange = (page) => setParams({ page: String(page) });

  const handleClearFilters = () =>
    setParams({
      search: undefined,
      resourceType: undefined,
      mine: undefined,
      sort: undefined,
      page: undefined,
    });

  return (
    <PageContainer>
      <PageHeader
        title="Resources"
        description="E-journals, research papers and notes shared by students, faculty and librarians."
        actions={
          <Link to="/resources/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Upload Resource
            </Button>
          </Link>
        }
      />

      <ResourceToolbar
        searchValue={params.search || ""}
        onSearchChange={handleSearchChange}
        filters={params}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      <div className="mt-6 space-y-6">
        <ResourceGrid
          resources={items}
          isLoading={status === "loading"}
          emptyTitle={
            params.mine ? "You haven't uploaded anything yet" : "No resources found"
          }
          emptyDescription={
            params.mine
              ? "Upload an e-journal, research paper or note to get started."
              : "Try adjusting your search or filters."
          }
        />

        {pagination && pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </PageContainer>
  );
};

export default Resources;
