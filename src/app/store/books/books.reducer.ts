import { createFeature, createReducer, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Book } from '../../shared/models';
import { BooksActions } from './books.actions';

export interface BooksState extends EntityState<Book> {
  loading: boolean;
  error: string | null;
}

export const booksAdapter: EntityAdapter<Book> = createEntityAdapter<Book>({
  selectId: (book: Book) => book.id,
  sortComparer: (a: Book, b: Book) => Number(b.id) - Number(a.id)
});

const initialState: BooksState = booksAdapter.getInitialState({
  loading: false,
  error: null
});

export const booksFeature = createFeature({
  name: 'books',
  reducer: createReducer(
    initialState,

    on(BooksActions.loadBooks, (state) => ({
      ...state,
      loading: true,
      error: null
    })),

    on(BooksActions.loadBooksSuccess, (state, { books }) =>
      booksAdapter.setAll(books, {
        ...state,
        loading: false
      })
    ),

    on(BooksActions.loadBooksFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error
    })),

    on(BooksActions.addBookSuccess, (state, { book }) =>
      booksAdapter.addOne(book, state)
    ),

    on(BooksActions.addBookFailure, (state, { error }) => ({
      ...state,
      error
    })),

    on(BooksActions.updateBookSuccess, (state, { book }) =>
      booksAdapter.updateOne({ id: book.id, changes: book }, state)
    ),

    on(BooksActions.updateBookFailure, (state, { error }) => ({
      ...state,
      error
    })),

    on(BooksActions.deleteBookSuccess, (state, { id }) =>
      booksAdapter.removeOne(id, state)
    ),

    on(BooksActions.deleteBookFailure, (state, { error }) => ({
      ...state,
      error
    }))
  )
});

export const {
  selectBooksState
} = booksFeature;
