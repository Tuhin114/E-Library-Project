import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../../store/slices/categoriesSlice";
import { fetchAuthors } from "../../store/slices/authorsSlice";
import { fetchPublishers } from "../../store/slices/publishersSlice";
import { ALL_FILTER_VALUE } from "../../constants/filterSentinel";
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

/**
 * Full filter field set, rendered inside the "Filters" drawer opened
 * from DiscoveryToolbar (see Books.jsx) — used on every breakpoint now,
 * not just mobile, so Category/Author here mirror DiscoveryToolbar's
 * own quick selects while Publisher/Language/Tags only live here.
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
    onFilterChange({ [key]: value === ALL_FILTER_VALUE ? undefined : value });
  };

  const handleTextChange = (key) => (event) => {
    onFilterChange({ [key]: event.target.value || undefined });
  };

  return (
    <div className="w-full space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold">Filters</h3>
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          Clear all
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <Select
          value={filters.category || ALL_FILTER_VALUE}
          onValueChange={handleSelectChange("category")}
        >
          <SelectTrigger>
            <SelectValue placeholder="All categories" />
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
      </div>

      <div className="space-y-2">
        <Label>Author</Label>
        <Select
          value={filters.author || ALL_FILTER_VALUE}
          onValueChange={handleSelectChange("author")}
        >
          <SelectTrigger>
            <SelectValue placeholder="All authors" />
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

      <div className="space-y-2">
        <Label>Publisher</Label>
        <Select
          value={filters.publisher || ALL_FILTER_VALUE}
          onValueChange={handleSelectChange("publisher")}
        >
          <SelectTrigger>
            <SelectValue placeholder="All publishers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_FILTER_VALUE}>All publishers</SelectItem>
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
    </div>
  );
};

export default FilterSidebar;
