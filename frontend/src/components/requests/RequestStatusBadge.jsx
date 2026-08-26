import { Badge } from "../ui/badge";
import { REQUEST_STATUS_BADGE_VARIANT } from "../../constants/requestStatus";

const RequestStatusBadge = ({ status }) => (
  <Badge variant={REQUEST_STATUS_BADGE_VARIANT[status] || "secondary"} className="capitalize">
    {status}
  </Badge>
);

export default RequestStatusBadge;
