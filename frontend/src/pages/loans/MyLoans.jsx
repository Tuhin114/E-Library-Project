import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BookOpen } from "lucide-react";
import { fetchMyLoans } from "../../store/slices/loansSlice";
import PageContainer from "../../components/layout/PageContainer";
import PageHeader from "../../components/layout/PageHeader";
import { Skeleton } from "../../components/ui/skeleton";
import EmptyState from "../../components/common/EmptyState";
import LoanCard from "../../components/loans/LoanCard";

const MyLoans = () => {
  const dispatch = useDispatch();
  const { myLoans, myLoansStatus } = useSelector((state) => state.loans);

  useEffect(() => {
    dispatch(fetchMyLoans());
  }, [dispatch]);

  return (
    <PageContainer>
      <PageHeader
        title="My Loans"
        description="Physical copies you currently have, or have previously borrowed."
      />

      {myLoansStatus === "loading" ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : myLoans.length > 0 ? (
        <div className="space-y-3">
          {myLoans.map((loan) => (
            <LoanCard key={loan._id} loan={loan} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No loans yet"
          description="Once a librarian confirms you've collected a requested book, it will show up here."
        />
      )}
    </PageContainer>
  );
};

export default MyLoans;
