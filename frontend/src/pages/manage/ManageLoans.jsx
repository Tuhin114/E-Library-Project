import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BookOpen } from "lucide-react";
import { fetchLoanQueue } from "../../store/slices/loansSlice";
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
import LoanCard from "../../components/loans/LoanCard";

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "returned", label: "Returned" },
];

const ManageLoans = () => {
  const dispatch = useDispatch();
  const { queue, queueStatus } = useSelector((state) => state.loans);
  const [status, setStatus] = useState("active");

  useEffect(() => {
    dispatch(fetchLoanQueue(status === "all" ? {} : { status }));
  }, [dispatch, status]);

  return (
    <PageContainer>
      <PageHeader
        title="Active Loans"
        description="Every physical copy currently issued, and its due date."
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
        icon={BookOpen}
        emptyTitle="No loans"
        emptyDescription="No loans match this filter right now."
        errorMessage="Couldn't load loans."
        onRetry={() => dispatch(fetchLoanQueue(status === "all" ? {} : { status }))}
      >
        <div className="space-y-3">
          {queue.map((loan) => (
            <LoanCard key={loan._id} loan={loan} />
          ))}
        </div>
      </ManageDataState>
    </PageContainer>
  );
};

export default ManageLoans;
