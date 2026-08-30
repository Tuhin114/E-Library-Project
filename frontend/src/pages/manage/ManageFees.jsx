import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Receipt } from "lucide-react";
import { fetchFeeQueue, payFee, finalizeFee, waiveFee } from "../../store/slices/feesSlice";
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
import FinalizeFeeDialog from "../../components/manage/FinalizeFeeDialog";
import WaiveFeeDialog from "../../components/manage/WaiveFeeDialog";

const STATUS_OPTIONS = [
  // M3 (Phase 7) — pending_review fees are the ones actually needing a
  // librarian's attention, so it's the default view rather than
  // outstanding.
  { value: "pending_review", label: "Pending Review" },
  { value: "outstanding", label: "Outstanding" },
  { value: "paid", label: "Paid" },
  { value: "waived", label: "Waived" },
];

const ManageFees = () => {
  const dispatch = useDispatch();
  const { queue, queueStatus, actionPendingId } = useSelector((state) => state.fees);
  const [status, setStatus] = useState("pending_review");
  const [finalizingFee, setFinalizingFee] = useState(null);
  const [waivingFee, setWaivingFee] = useState(null);

  useEffect(() => {
    dispatch(fetchFeeQueue({ status }));
  }, [dispatch, status]);

  const handleFinalize = (amount) => {
    dispatch(finalizeFee({ id: finalizingFee._id, amount })).then(() => setFinalizingFee(null));
  };

  const handleWaive = (reason) => {
    dispatch(waiveFee({ id: waivingFee._id, reason })).then(() => setWaivingFee(null));
  };

  return (
    <PageContainer>
      <PageHeader
        title="Fees"
        description="Late, damage, and lost-book fees across every student — confirm pending amounts, waive, or record an in-person payment."
        actions={
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-44">
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
        emptyDescription={`No ${status.replace("_", " ")} fees right now.`}
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
              onFinalize={setFinalizingFee}
              onWaive={setWaivingFee}
              isActing={actionPendingId === fee._id}
            />
          ))}
        </div>
      </ManageDataState>

      <FinalizeFeeDialog
        open={Boolean(finalizingFee)}
        onOpenChange={(open) => !open && setFinalizingFee(null)}
        fee={finalizingFee}
        onConfirm={handleFinalize}
        isLoading={actionPendingId === finalizingFee?._id}
      />

      <WaiveFeeDialog
        open={Boolean(waivingFee)}
        onOpenChange={(open) => !open && setWaivingFee(null)}
        onConfirm={handleWaive}
        isLoading={actionPendingId === waivingFee?._id}
      />
    </PageContainer>
  );
};

export default ManageFees;
