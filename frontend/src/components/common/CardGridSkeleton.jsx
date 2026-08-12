import { Skeleton } from "../ui/skeleton";

/**
 * Loading placeholder for the Categories/Authors/Publishers grid pages —
 * mirrors the card grid layout those pages render once data arrives, so
 * the page doesn't visually "jump" when loading finishes.
 */
const CardGridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: count }).map((_, index) => (
      <Skeleton key={index} className="h-28 w-full" />
    ))}
  </div>
);

export default CardGridSkeleton;
