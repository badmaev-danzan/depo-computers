import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Book } from '../../../../shared/models/book.model';
import { BookDialogComponent } from '../../components/book-dialog/book-dialog.component';
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
    MatCheckboxModule,
    MatToolbarModule
  ]
})
export class BookListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly dialog = inject(MatDialog);

  protected readonly books = this.store.selectSignal(selectAllBooks);
  protected readonly isLoading = this.store.selectSignal(selectBooksLoading);
  protected readonly selectedBooks = signal<Set<number>>(new Set());
  protected readonly displayedColumns = ['select', 'title', 'author', 'year', 'isRead'];

  ngOnInit(): void {
    this.store.dispatch(BooksActions.loadBooks());
  }

  protected toggleSelection(bookId: number): void {
    const selected = new Set(this.selectedBooks());
    if (selected.has(bookId)) {
      selected.delete(bookId);
    } else {
      selected.add(bookId);
    }
    this.selectedBooks.set(selected);
  }

  protected isSelected(bookId: number): boolean {
    return this.selectedBooks().has(bookId);
  }

  protected hasSelection(): boolean {
    return this.selectedBooks().size > 0;
  }

  protected hasSingleSelection(): boolean {
    return this.selectedBooks().size === 1;
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
    if (!this.hasSingleSelection()) return;

    const bookId = Array.from(this.selectedBooks())[0];
    const book = this.books().find(b => b.id === bookId);

    if (!book) return;

    const dialogRef = this.dialog.open(BookDialogComponent, {
      data: { mode: 'edit', book },
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(BooksActions.updateBook({ id: bookId, changes: result }));
        this.selectedBooks.set(new Set());
      }
    });
  }

  protected onDelete(): void {
    if (!this.hasSelection()) return;

    const selectedIds = Array.from(this.selectedBooks());
    const confirmMessage = selectedIds.length === 1
      ? 'Удалить эту книгу?'
      : `Удалить ${selectedIds.length} книг(и)?`;

    if (confirm(confirmMessage)) {
      selectedIds.forEach(id => {
        this.store.dispatch(BooksActions.deleteBook({ id }));
      });
      this.selectedBooks.set(new Set());
    }
  }

  protected onToggleReadStatus(): void {
    if (!this.hasSelection()) return;

    const selectedIds = Array.from(this.selectedBooks());

    selectedIds.forEach(id => {
      this.store.dispatch(BooksActions.toggleBookReadStatus({ id }));
    });
  }
}
