import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SlidersHorizontal, X } from "lucide-react";
import { fetchCategories } from "../../store/slices/categoriesSlice";
import { fetchAuthors } from "../../store/slices/authorsSlice";
import { ALL_FILTER_VALUE } from "../../constants/filterSentinel";
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
  { value: "year_desc", label: "Publication Year (Newest)" },
  { value: "year_asc", label: "Publication Year (Oldest)" },
];

/**
 * Horizontal search + filter toolbar for the Books catalog. Category
 * and Author stay inline at `lg` and up for quick access; Publisher,
 * Language and Tags — the less-common filters — always live behind the
 * "Filters" button, which opens FilterSidebar in a drawer on every
 * breakpoint (see Books.jsx). Sort is always visible.
 */
const DiscoveryToolbar = ({
  searchValue,
  onSearchChange,
  filters,
  onFilterChange,
  onClearFilters,
  moreFilterCount = 0,
  onOpenMoreFilters,
}) => {
  const dispatch = useDispatch();
  const { items: categories } = useSelector((state) => state.categories);
  const { items: authors } = useSelector((state) => state.authors);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchAuthors());
  }, [dispatch]);

  const handleSelectChange = (key) => (value) =>
    onFilterChange({ [key]: value === ALL_FILTER_VALUE ? undefined : value });

  const hasActiveFilters =
    moreFilterCount > 0 || Boolean(filters.category) || Boolean(filters.author) || Boolean(searchValue);

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="min-w-0 flex-1 lg:max-w-md">
        <SearchBar value={searchValue} onChange={onSearchChange} />
      </div>

      {/* Quick filters — visible at lg+, tucked into the Filters drawer below that */}
      <div className="hidden shrink-0 items-center gap-2 lg:flex">
        <Select
          value={filters.category || ALL_FILTER_VALUE}
          onValueChange={handleSelectChange("category")}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_FILTER_VALUE}>All categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category._id} value={category._id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.author || ALL_FILTER_VALUE}
          onValueChange={handleSelectChange("author")}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Author" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_FILTER_VALUE}>All authors</SelectItem>
            {authors.map((author) => (
              <SelectItem key={author._id} value={author._id}>
                {author.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Select
          value={filters.sort || "newest"}
          onValueChange={handleSelectChange("sort")}
        >
          <SelectTrigger className="w-40 lg:w-44">
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

        <Button variant="outline" className="shrink-0 gap-2" onClick={onOpenMoreFilters}>
          <SlidersHorizontal className="h-4 w-4" />
          Filters{moreFilterCount > 0 ? ` (${moreFilterCount})` : ""}
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

export default DiscoveryToolbar;
