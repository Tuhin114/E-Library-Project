import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRecentlyViewed } from "../../store/slices/librarySlice";
import BookGrid from "../../components/catalog/BookGrid";
import PageContainer from "../../components/layout/PageContainer";
import PageHeader from "../../components/layout/PageHeader";

const RecentlyViewed = () => {
  const dispatch = useDispatch();
  const { recentlyViewed, status } = useSelector((state) => state.library);

  useEffect(() => {
    dispatch(fetchRecentlyViewed());
  }, [dispatch]);

  return (
    <PageContainer>
      <PageHeader
        title="Recently Viewed"
        description="Books you've opened, most recent first."
      />
      <BookGrid
        books={recentlyViewed}
        isLoading={status === "loading"}
        emptyTitle="No recently viewed books"
        emptyDescription="Books you open will show up here, most recent first."
      />
    </PageContainer>
  );
};

export default RecentlyViewed;
