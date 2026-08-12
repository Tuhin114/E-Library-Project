import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFavorites } from "../../store/slices/librarySlice";
import BookGrid from "../../components/catalog/BookGrid";

const Favorites = () => {
  const dispatch = useDispatch();
  const { favorites, status } = useSelector((state) => state.library);

  useEffect(() => {
    dispatch(fetchFavorites());
  }, [dispatch]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Favorites</h1>
      <BookGrid
        books={favorites}
        isLoading={status === "loading"}
        emptyTitle="No favorites yet"
        emptyDescription="Books you favorite will appear here."
      />
    </div>
  );
};

export default Favorites;
