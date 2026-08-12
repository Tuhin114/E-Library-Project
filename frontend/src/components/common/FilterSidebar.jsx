import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../../store/slices/categoriesSlice";
import { fetchAuthors } from "../../store/slices/authorsSlice";
import { fetchPublishers } from "../../store/slices/publishersSlice";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";

// Radix Select doesn't allow an empty-string item value, so "no filter
// selected" is represented by this sentinel instead and translated back to
// `undefined` before it reaches the URL/query params.
const ALL = "__all__";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "title_asc", label: "Title A–Z" },
  { value: "title_desc", label: "Title Z–A" },
  { value: "year_desc", label: "Publication Year (Newest)" },
  { value: "year_asc", label: "Publication Year (Oldest)" },
];

/**
 * Category/Author/Publisher options are loaded from their own slices
 * (already populated from Milestone 1's browse pages in most sessions —
 * dispatching again here is a no-op network-wise if Redux already has
 * them cached... actually these thunks always refetch; that's fine at this
 * catalog scale and keeps the filter list fresh if a librarian just added
 * a new category elsewhere).
 */
const FilterSidebar = ({ filters, onFilterChange, onClearFilters }) => {
  const dispatch = useDispatch();
  const { items: categories } = useSelector((state) => state.categories);
  const { items: authors } = useSelector((state) => state.authors);
  const { items: publishers } = useSelector((state) => state.publishers);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchAuthors());
    dispatch(fetchPublishers());
  }, [dispatch]);

  const handleSelectChange = (key) => (value) => {
    onFilterChange({ [key]: value === ALL ? undefined : value });
  };

  const handleTextChange = (key) => (event) => {
    onFilterChange({ [key]: event.target.value || undefined });
  };

  return (
    <aside className="w-full shrink-0 space-y-5 md:w-64">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Filters</h3>
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          Clear all
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Sort By</Label>
        <Select
          value={filters.sort || "newest"}
          onValueChange={handleSelectChange("sort")}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <Select
          value={filters.category || ALL}
          onValueChange={handleSelectChange("category")}
        >
          <SelectTrigger>
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category._id} value={category._id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Author</Label>
        <Select
          value={filters.author || ALL}
          onValueChange={handleSelectChange("author")}
        >
          <SelectTrigger>
            <SelectValue placeholder="All authors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All authors</SelectItem>
            {authors.map((author) => (
              <SelectItem key={author._id} value={author._id}>
                {author.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Publisher</Label>
        <Select
          value={filters.publisher || ALL}
          onValueChange={handleSelectChange("publisher")}
        >
          <SelectTrigger>
            <SelectValue placeholder="All publishers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All publishers</SelectItem>
            {publishers.map((publisher) => (
              <SelectItem key={publisher._id} value={publisher._id}>
                {publisher.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="filter-language">Language</Label>
        <Input
          id="filter-language"
          placeholder="e.g. English"
          value={filters.language || ""}
          onChange={handleTextChange("language")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="filter-tags">Tags</Label>
        <Input
          id="filter-tags"
          placeholder="comma-separated"
          value={filters.tags || ""}
          onChange={handleTextChange("tags")}
        />
      </div>
    </aside>
  );
};

export default FilterSidebar;
