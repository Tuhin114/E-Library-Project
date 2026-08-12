import { BookOpen } from 'lucide-react';
import BookCard from './BookCard';
import { Skeleton } from '../ui/skeleton';
import EmptyState from '../common/EmptyState';

const BookGrid = ({ books, isLoading, emptyTitle = 'No books found', emptyDescription = '' }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, index) => (
          <Skeleton key={index} className="aspect-[3/4] w-full" />
        ))}
      </div>
    );
  }

  if (!books || books.length === 0) {
    return <EmptyState icon={BookOpen} title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {books.map((book) => (
        <BookCard key={book._id} book={book} />
      ))}
    </div>
  );
};

export default BookGrid;
