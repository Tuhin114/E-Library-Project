import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PackageSearch } from "lucide-react";
import { fetchMyRequests, cancelRequest } from "../../store/slices/requestsSlice";
import PageContainer from "../../components/layout/PageContainer";
import PageHeader from "../../components/layout/PageHeader";
import { Skeleton } from "../../components/ui/skeleton";
import EmptyState from "../../components/common/EmptyState";
import RequestCard from "../../components/requests/RequestCard";

const MyRequests = () => {
  const dispatch = useDispatch();
  const { myRequests, myRequestsStatus, actionPendingId } = useSelector(
    (state) => state.requests,
  );

  useEffect(() => {
    dispatch(fetchMyRequests());
  }, [dispatch]);

  const handleCancel = (id) => dispatch(cancelRequest(id));

  return (
    <PageContainer>
      <PageHeader
        title="My Requests"
        description="Physical copy requests you've submitted, and their current status."
      />

      {myRequestsStatus === "loading" ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : myRequests.length > 0 ? (
        <div className="space-y-3">
          {myRequests.map((request) => (
            <RequestCard
              key={request._id}
              request={request}
              onCancel={handleCancel}
              isCancelling={actionPendingId === request._id}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={PackageSearch}
          title="No requests yet"
          description="Find a book with physical copies available and request one from its details page."
        />
      )}
    </PageContainer>
  );
};

export default MyRequests;
