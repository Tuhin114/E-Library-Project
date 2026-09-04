import { SlidersHorizontal, X } from "lucide-react";
import { ALL_FILTER_VALUE } from "../../constants/filterSentinel";
import {
  RESOURCE_TYPE_VALUES,
  RESOURCE_TYPE_LABELS,
} from "../../constants/resourceType";
import SearchBar from "../common/SearchBar";
import { Button } from "../ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "title_asc", label: "Title A–Z" },
  { value: "title_desc", label: "Title Z–A" },
];

/**
 * `mine` is a toggle rather than a Select option — it swaps which
 * collection is being queried (own uploads, any visibility) instead of
 * filtering within the public set, so it gets its own control rather
 * than living inside the same dropdown as resourceType/sort.
 */
const ResourceToolbar = ({
  searchValue,
  onSearchChange,
  filters,
  onFilterChange,
  onClearFilters,
}) => {
  const handleSelectChange = (key) => (value) =>
    onFilterChange({ [key]: value === ALL_FILTER_VALUE ? undefined : value });

  const hasActiveFilters =
    Boolean(filters.resourceType) ||
    Boolean(filters.mine) ||
    Boolean(searchValue);

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="min-w-0 flex-1 lg:max-w-md">
        <SearchBar value={searchValue} onChange={onSearchChange} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filters.resourceType || ALL_FILTER_VALUE}
          onValueChange={handleSelectChange("resourceType")}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_FILTER_VALUE}>All types</SelectItem>
            {RESOURCE_TYPE_VALUES.map((type) => (
              <SelectItem key={type} value={type}>
                {RESOURCE_TYPE_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.sort || "newest"}
          onValueChange={handleSelectChange("sort")}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant={filters.mine ? "default" : "outline"}
          className="gap-2"
          onClick={() =>
            onFilterChange({ mine: filters.mine ? undefined : "true" })
          }
        >
          <SlidersHorizontal className="h-4 w-4" />
          My Uploads
        </Button>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClearFilters}
            aria-label="Clear all filters"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ResourceToolbar;
