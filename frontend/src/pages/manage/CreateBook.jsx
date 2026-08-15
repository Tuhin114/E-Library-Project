import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createBook } from '../../store/slices/booksSlice';
import { toBookPayload } from '../../lib/validationSchemas/bookSchema';
import BookForm from '../../components/forms/BookForm';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';

const CreateBook = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formValues) => {
    setIsSubmitting(true);
    const payload = toBookPayload(formValues);
    const result = await dispatch(createBook(payload));
    setIsSubmitting(false);

    if (!result.error) {
      navigate(`/manage/books/${result.payload._id}/edit`);
    }
  };

  return (
    <PageContainer>
      <PageHeader title="New Book" description="Add a new title to the catalog." />
      <div className="max-w-3xl">
        <BookForm onSubmit={handleSubmit} isSubmitting={isSubmitting} submitLabel="Create Book" />
      </div>
    </PageContainer>
  );
};

export default CreateBook;
