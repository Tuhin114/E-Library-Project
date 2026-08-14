import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchContinueReading } from "../../store/slices/librarySlice";
import BookGrid from "../../components/catalog/BookGrid";

const ContinueReading = () => {
  const dispatch = useDispatch();
  const { continueReading, status } = useSelector((state) => state.library);

  useEffect(() => {
    dispatch(fetchContinueReading());
  }, [dispatch]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">
        Continue Reading
      </h1>
      <BookGrid
        books={continueReading}
        isLoading={status === "loading"}
        emptyTitle="Nothing in progress"
        emptyDescription="Books you've started reading will show up here until you finish them."
      />
    </div>
  );
};

export default ContinueReading;
