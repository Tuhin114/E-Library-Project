import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Receipt } from "lucide-react";
import { fetchMyFees, payFee } from "../../store/slices/feesSlice";
import PageContainer from "../../components/layout/PageContainer";
import PageHeader from "../../components/layout/PageHeader";
import { Skeleton } from "../../components/ui/skeleton";
import EmptyState from "../../components/common/EmptyState";
import FeeCard from "../../components/fees/FeeCard";

const MyFees = () => {
  const dispatch = useDispatch();
  const { myFees, myFeesStatus, actionPendingId } = useSelector((state) => state.fees);

  useEffect(() => {
    dispatch(fetchMyFees());
  }, [dispatch]);

  return (
    <PageContainer>
      <PageHeader
        title="My Fees"
        description="Late fees from past loans, and whether they're outstanding or paid."
      />

      {myFeesStatus === "loading" ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : myFees.length > 0 ? (
        <div className="space-y-3">
          {myFees.map((fee) => (
            <FeeCard
              key={fee._id}
              fee={fee}
              onPay={(id) => dispatch(payFee(id))}
              isPaying={actionPendingId === fee._id}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Receipt}
          title="No fees"
          description="Return books on time and this page stays empty."
        />
      )}
    </PageContainer>
  );
};

export default MyFees;
