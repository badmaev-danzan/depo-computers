import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Book } from '../../shared/models/book.model';

export const BooksActions = createActionGroup({
  source: 'Books',
  events: {
    'Load Books': emptyProps(),
    'Load Books Success': props<{ books: Book[] }>(),
    'Load Books Failure': props<{ error: string }>(),

    'Add Book': props<{ book: Omit<Book, 'id'> }>(),
    'Add Book Success': props<{ book: Book }>(),
    'Add Book Failure': props<{ error: string }>(),

    'Update Book': props<{ id: number; changes: Partial<Book> }>(),
    'Update Book Success': props<{ book: Book }>(),
    'Update Book Failure': props<{ error: string }>(),

    'Delete Book': props<{ id: number }>(),
    'Delete Book Success': props<{ id: number }>(),
    'Delete Book Failure': props<{ error: string }>(),

    'Toggle Book Read Status': props<{ id: number }>(),
  }
});
