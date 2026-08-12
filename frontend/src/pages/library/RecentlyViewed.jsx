import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRecentlyViewed } from "../../store/slices/librarySlice";
import BookGrid from "../../components/catalog/BookGrid";

const RecentlyViewed = () => {
  const dispatch = useDispatch();
  const { recentlyViewed, status } = useSelector((state) => state.library);

  useEffect(() => {
    dispatch(fetchRecentlyViewed());
  }, [dispatch]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">
        Recently Viewed
      </h1>
      <BookGrid
        books={recentlyViewed}
        isLoading={status === "loading"}
        emptyTitle="No recently viewed books"
        emptyDescription="Books you open will show up here, most recent first."
      />
    </div>
  );
};

export default RecentlyViewed;
