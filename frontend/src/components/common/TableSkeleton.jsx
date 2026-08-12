import { Skeleton } from "../ui/skeleton";
import { TableBody, TableRow, TableCell } from "../ui/table";

const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <TableBody>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <TableRow key={rowIndex}>
        {Array.from({ length: columns }).map((__, colIndex) => (
          <TableCell key={colIndex}>
            <Skeleton className="h-4 w-full" />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </TableBody>
);

export default TableSkeleton;
