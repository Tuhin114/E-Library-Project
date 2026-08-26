import { Badge } from "../ui/badge";
import { COPY_STATUS_BADGE_VARIANT } from "../../constants/copyStatus";

const CopyStatusBadge = ({ status }) => (
  <Badge variant={COPY_STATUS_BADGE_VARIANT[status] || "secondary"} className="capitalize">
    {status}
  </Badge>
);

export default CopyStatusBadge;
