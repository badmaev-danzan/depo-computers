import { createSelector } from '@ngrx/store';
import { booksFeature, booksAdapter } from './books.reducer';

const { selectBooksState } = booksFeature;

const adapterSelectors = booksAdapter.getSelectors(selectBooksState);

export const selectAllBooks = adapterSelectors.selectAll;
export const selectBooksLoading = createSelector(
  selectBooksState,
  (state) => state.loading
);
