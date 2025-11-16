import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { BookService, NotificationService } from '../../core/services';
import { BooksActions } from './books.actions';

export const loadBooks = createEffect(
  () => {
    const actions$ = inject(Actions);
    const bookService = inject(BookService);

    return actions$.pipe(
      ofType(BooksActions.loadBooks),
      switchMap(() =>
        bookService.getAll().pipe(
          map((books) => BooksActions.loadBooksSuccess({ books })),
          catchError((error) =>
            of(BooksActions.loadBooksFailure({ error: error.message }))
          )
        )
      )
    );
  },
  { functional: true }
);

export const addBook = createEffect(
  () => {
    const actions$ = inject(Actions);
    const bookService = inject(BookService);

    return actions$.pipe(
      ofType(BooksActions.addBook),
      switchMap(({ book }) =>
        bookService.create(book).pipe(
          map((newBook) => BooksActions.addBookSuccess({ book: newBook })),
          catchError((error) =>
            of(BooksActions.addBookFailure({ error: error.message }))
          )
        )
      )
    );
  },
  { functional: true }
);

export const updateBook = createEffect(
  () => {
    const actions$ = inject(Actions);
    const bookService = inject(BookService);

    return actions$.pipe(
      ofType(BooksActions.updateBook),
      switchMap(({ id, changes }) =>
        bookService.update(id, changes).pipe(
          map((book) => BooksActions.updateBookSuccess({ book })),
          catchError((error) =>
            of(BooksActions.updateBookFailure({ error: error.message }))
          )
        )
      )
    );
  },
  { functional: true }
);

export const deleteBook = createEffect(
  () => {
    const actions$ = inject(Actions);
    const bookService = inject(BookService);

    return actions$.pipe(
      ofType(BooksActions.deleteBook),
      switchMap(({ id }) =>
        bookService.delete(id).pipe(
          map(() => BooksActions.deleteBookSuccess({ id })),
          catchError((error) =>
            of(BooksActions.deleteBookFailure({ error: error.message }))
          )
        )
      )
    );
  },
  { functional: true }
);

export const toggleBookReadStatus = createEffect(
  () => {
    const actions$ = inject(Actions);
    const bookService = inject(BookService);

    return actions$.pipe(
      ofType(BooksActions.toggleBookReadStatus),
      switchMap(({ id }) =>
        bookService.getById(id).pipe(
          switchMap((book) =>
            bookService.update(id, { isRead: !book.isRead }).pipe(
              map((updatedBook) => BooksActions.updateBookSuccess({ book: updatedBook })),
              catchError((error) =>
                of(BooksActions.updateBookFailure({ error: error.message }))
              )
            )
          ),
          catchError((error) =>
            of(BooksActions.loadBooksFailure({ error: error.message }))
          )
        )
      )
    );
  },
  { functional: true }
);

export const handleErrors = createEffect(
  () => {
    const actions$ = inject(Actions);
    const notificationService = inject(NotificationService);

    return actions$.pipe(
      ofType(
        BooksActions.loadBooksFailure,
        BooksActions.addBookFailure,
        BooksActions.updateBookFailure,
        BooksActions.deleteBookFailure
      ),
      tap(({ error }) => {
        notificationService.show(`Ошибка: ${error}`);
      })
    );
  },
  { functional: true, dispatch: false }
);
