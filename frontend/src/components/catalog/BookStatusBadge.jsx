import { Badge } from "../ui/badge";

const BookStatusBadge = ({ status }) => (
  <Badge variant={status === "published" ? "default" : "secondary"} className="capitalize">
    {status}
  </Badge>
);

export default BookStatusBadge;
