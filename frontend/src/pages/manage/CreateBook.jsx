import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createBook } from '../../store/slices/booksSlice';
import { toBookPayload } from '../../lib/validationSchemas/bookSchema';
import BookForm from '../../components/forms/BookForm';

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
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">New Book</h1>
      <div className="max-w-3xl">
        <BookForm onSubmit={handleSubmit} isSubmitting={isSubmitting} submitLabel="Create Book" />
      </div>
    </div>
  );
};

export default CreateBook;
