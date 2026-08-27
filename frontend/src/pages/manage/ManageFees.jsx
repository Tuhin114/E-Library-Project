import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Receipt } from "lucide-react";
import { fetchFeeQueue, payFee } from "../../store/slices/feesSlice";
import PageContainer from "../../components/layout/PageContainer";
import PageHeader from "../../components/layout/PageHeader";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../components/ui/select";
import ManageDataState from "../../components/manage/ManageDataState";
import FeeCard from "../../components/fees/FeeCard";

const STATUS_OPTIONS = [
  { value: "outstanding", label: "Outstanding" },
  { value: "paid", label: "Paid" },
];

const ManageFees = () => {
  const dispatch = useDispatch();
  const { queue, queueStatus, actionPendingId } = useSelector((state) => state.fees);
  const [status, setStatus] = useState("outstanding");

  useEffect(() => {
    dispatch(fetchFeeQueue({ status }));
  }, [dispatch, status]);

  return (
    <PageContainer>
      <PageHeader
        title="Fees"
        description="Late fees across every student — record a payment taken in person here."
        actions={
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <ManageDataState
        status={queueStatus}
        items={queue}
        icon={Receipt}
        emptyTitle="No fees"
        emptyDescription={`No ${status} fees right now.`}
        errorMessage="Couldn't load fees."
        onRetry={() => dispatch(fetchFeeQueue({ status }))}
      >
        <div className="space-y-3">
          {queue.map((fee) => (
            <FeeCard
              key={fee._id}
              fee={fee}
              onPay={(id) => dispatch(payFee(id))}
              isPaying={actionPendingId === fee._id}
            />
          ))}
        </div>
      </ManageDataState>
    </PageContainer>
  );
};

export default ManageFees;
