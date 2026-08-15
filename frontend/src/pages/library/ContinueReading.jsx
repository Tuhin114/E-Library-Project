import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchContinueReading } from "../../store/slices/librarySlice";
import BookGrid from "../../components/catalog/BookGrid";
import PageContainer from "../../components/layout/PageContainer";
import PageHeader from "../../components/layout/PageHeader";

const ContinueReading = () => {
  const dispatch = useDispatch();
  const { continueReading, status } = useSelector((state) => state.library);

  useEffect(() => {
    dispatch(fetchContinueReading());
  }, [dispatch]);

  return (
    <PageContainer>
      <PageHeader
        title="Continue Reading"
        description="Pick up where you left off."
      />
      <BookGrid
        books={continueReading}
        isLoading={status === "loading"}
        emptyTitle="Nothing in progress"
        emptyDescription="Books you've started reading will show up here until you finish them."
      />
    </PageContainer>
  );
};

export default ContinueReading;
