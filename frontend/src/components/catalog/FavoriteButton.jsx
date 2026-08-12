import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Heart } from "lucide-react";
import { Button } from "../ui/button";
import {
  fetchFavorites,
  toggleFavorite,
} from "../../store/slices/librarySlice";

const FavoriteButton = ({ bookId, variant = "icon" }) => {
  const dispatch = useDispatch();
  const { favoriteIds, status } = useSelector((state) => state.library);
  const isFavorited = favoriteIds.includes(bookId);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchFavorites());
    }
  }, [dispatch, status]);

  const handleClick = (event) => {
    // BookCard wraps this button in a <Link> to the book detail page —
    // clicking the heart should toggle the favorite, not navigate.
    event.preventDefault();
    event.stopPropagation();
    dispatch(toggleFavorite({ bookId, isFavorited }));
  };

  if (variant === "full") {
    return (
      <Button
        variant={isFavorited ? "default" : "outline"}
        onClick={handleClick}
        className="gap-2"
      >
        <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
        {isFavorited ? "Favorited" : "Add to Favorites"}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className="h-8 w-8 p-0"
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={`h-4 w-4 ${isFavorited ? "fill-destructive text-destructive" : "text-muted-foreground"}`}
      />
    </Button>
  );
};

export default FavoriteButton;
