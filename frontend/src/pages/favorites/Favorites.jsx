import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFavorites } from "../../store/slices/librarySlice";
import BookGrid from "../../components/catalog/BookGrid";
import PageContainer from "../../components/layout/PageContainer";
import PageHeader from "../../components/layout/PageHeader";

const Favorites = () => {
  const dispatch = useDispatch();
  const { favorites, status } = useSelector((state) => state.library);

  useEffect(() => {
    dispatch(fetchFavorites());
  }, [dispatch]);

  return (
    <PageContainer>
      <PageHeader title="Favorites" description="Books you've marked to come back to." />
      <BookGrid
        books={favorites}
        isLoading={status === "loading"}
        emptyTitle="No favorites yet"
        emptyDescription="Books you favorite will appear here."
      />
    </PageContainer>
  );
};

export default Favorites;
