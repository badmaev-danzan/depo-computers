import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Book } from '../../../../shared/models/book.model';
import { BookDialogComponent } from '../../components/book-dialog/book-dialog.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { BooksActions } from '../../../../store/books/books.actions';
import { selectAllBooks, selectBooksLoading } from '../../../../store/books/books.selectors';

@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule
  ]
})
export class BookListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly dialog = inject(MatDialog);

  protected readonly books = this.store.selectSignal(selectAllBooks);
  protected readonly isLoading = this.store.selectSignal(selectBooksLoading);
  protected readonly selectedBookId = signal<number | null>(null);
  protected readonly displayedColumns = ['title', 'author', 'year', 'isRead'];

  ngOnInit(): void {
    this.store.dispatch(BooksActions.loadBooks());
  }

  protected onRowClick(bookId: number): void {
    this.selectedBookId.set(bookId);
  }

  protected isSelected(bookId: number): boolean {
    return this.selectedBookId() === bookId;
  }

  protected hasSelection(): boolean {
    return this.selectedBookId() !== null;
  }

  protected onAdd(): void {
    const dialogRef = this.dialog.open(BookDialogComponent, {
      data: { mode: 'add' },
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(BooksActions.addBook({ book: result }));
      }
    });
  }

  protected onEdit(): void {
    if (!this.hasSelection()) return;

    const bookId = this.selectedBookId()!;
    const book = this.books().find(b => b.id === bookId);

    if (!book) return;

    const dialogRef = this.dialog.open(BookDialogComponent, {
      data: { mode: 'edit', book },
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(BooksActions.updateBook({ id: bookId, changes: result }));
        this.selectedBookId.set(null);
      }
    });
  }

  protected onDelete(): void {
    if (!this.hasSelection()) return;

    const bookId = this.selectedBookId()!;
    const book = this.books().find(b => b.id === bookId);

    if (!book) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Подтверждение удаления',
        message: `Вы уверены, что хотите удалить книгу "${book.title}"?`
      },
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.store.dispatch(BooksActions.deleteBook({ id: bookId }));
        this.selectedBookId.set(null);
      }
    });
  }

  protected onToggleReadStatus(): void {
    if (!this.hasSelection()) return;

    const bookId = this.selectedBookId()!;
    this.store.dispatch(BooksActions.toggleBookReadStatus({ id: bookId }));
  }
}
