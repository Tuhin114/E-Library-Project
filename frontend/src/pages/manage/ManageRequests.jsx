import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ClipboardList } from "lucide-react";
import {
  fetchRequestQueue,
  approveRequest,
  rejectRequest,
} from "../../store/slices/requestsSlice";
import { REQUEST_STATUS_OPTIONS } from "../../constants/requestStatus";
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
import RequestReviewCard from "../../components/manage/RequestReviewCard";
import Pagination from "../../components/common/Pagination";

const ManageRequests = () => {
  const dispatch = useDispatch();
  const { queue, queuePagination, queueStatus, actionPendingId } = useSelector(
    (state) => state.requests,
  );

  const [status, setStatus] = useState("pending");
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchRequestQueue({ status, page, limit: 10 }));
  }, [dispatch, status, page]);

  const handleStatusChange = (value) => {
    setStatus(value);
    setPage(1);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Physical Copy Requests"
        description="Review pending requests with full inventory and conflict context before deciding."
        actions={
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REQUEST_STATUS_OPTIONS.map(({ value, label }) => (
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
        icon={ClipboardList}
        emptyTitle="Nothing here"
        emptyDescription={`No ${status} requests right now.`}
        errorMessage="Couldn't load requests."
        onRetry={() => dispatch(fetchRequestQueue({ status, page, limit: 10 }))}
      >
        <div className="space-y-3">
          {queue.map((request) => (
            <RequestReviewCard
              key={request._id}
              request={request}
              onApprove={(id, note) => dispatch(approveRequest({ id, note }))}
              onReject={(id, reason) => dispatch(rejectRequest({ id, reason }))}
              isActing={actionPendingId === request._id}
            />
          ))}
        </div>

        {queuePagination && (
          <div className="mt-6">
            <Pagination
              currentPage={queuePagination.page}
              totalPages={queuePagination.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </ManageDataState>
    </PageContainer>
  );
};

export default ManageRequests;
