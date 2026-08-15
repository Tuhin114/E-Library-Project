import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, BookOpen } from "lucide-react";
import { fetchBooks, deleteBook } from "../../store/slices/booksSlice";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import TableSkeleton from "../../components/common/TableSkeleton";
import Pagination from "../../components/common/Pagination";
import BookStatusBadge from "../../components/catalog/BookStatusBadge";
import ManagePageHeader from "../../components/manage/ManagePageHeader";
import ManageDataState from "../../components/manage/ManageDataState";
import RowActions from "../../components/manage/RowActions";
import PageContainer from "../../components/layout/PageContainer";

const ManageBooks = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, pagination, status } = useSelector((state) => state.books);

  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchBooks({ page, limit: 20, sort: "newest" }));
  }, [dispatch, page]);

  const handleDelete = async () => {
    setIsDeleting(true);
    await dispatch(deleteBook(deleteTarget._id));
    setIsDeleting(false);
    setDeleteTarget(null);
    dispatch(fetchBooks({ page, limit: 20, sort: "newest" }));
  };

  return (
    <PageContainer>
      <ManagePageHeader
        title="Manage Books"
        description="Add, edit and publish books in the catalog."
        createLabel="New Book"
        onCreate={() => navigate("/manage/books/new")}
      />

      <ManageDataState
        status={status}
        items={items}
        icon={BookOpen}
        emptyTitle="No books yet"
        emptyDescription="Add your first book to start building the catalog."
        createLabel="New Book"
        onCreate={() => navigate("/manage/books/new")}
        errorMessage="Couldn't load books."
        onRetry={() => dispatch(fetchBooks({ page, limit: 20, sort: "newest" }))}
      >
        <>
          {/* Desktop / tablet: table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>ISBN</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              {status === "loading" ? (
                <TableSkeleton rows={6} columns={5} />
              ) : (
                <TableBody>
                  {items.map((book) => (
                    <TableRow key={book._id}>
                      <TableCell className="font-medium">
                        {book.title}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {book.isbn}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {book.category?.name || "—"}
                      </TableCell>
                      <TableCell>
                        <BookStatusBadge status={book.status} />
                      </TableCell>
                      <TableCell>
                        <RowActions
                          onEdit={() => navigate(`/manage/books/${book._id}/edit`)}
                          onDelete={() => setDeleteTarget(book)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              )}
            </Table>
          </div>

          {/* Mobile: stacked cards — a table's columns don't fit a phone
              screen readably even with horizontal scroll, so this page
              (the highest-traffic manage page) gets a real card layout
              instead. */}
          <div className="space-y-3 md:hidden">
            {status === "loading"
              ? Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-24 w-full" />
                ))
              : items.map((book) => (
                  <Card key={book._id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-sm">{book.title}</CardTitle>
                        <BookStatusBadge status={book.status} />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-0">
                      <p className="text-xs text-muted-foreground">
                        {book.isbn} · {book.category?.name || "Uncategorized"}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() =>
                            navigate(`/manage/books/${book._id}/edit`)
                          }
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteTarget(book)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      </ManageDataState>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete book?"
        description={`This will permanently delete "${deleteTarget?.title}". This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </PageContainer>
  );
};

export default ManageBooks;
