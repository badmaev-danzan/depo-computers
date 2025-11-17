import { Component, ChangeDetectionStrategy, signal, inject, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Book } from '../../../../shared/models';
import { BookDialogComponent, ConfirmDialogComponent } from '../../components';
import { NotificationService } from '../../../../core/services';
import { BooksActions, selectAllBooks, selectBooksLoading } from '../../../../store/books';

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
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

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

    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (result) {
          this.store.dispatch(BooksActions.addBook({ book: result }));
          this.notificationService.show('Книга успешно добавлена');
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

    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (result) {
          this.store.dispatch(BooksActions.updateBook({ id: bookId, changes: result }));
          this.selectedBookId.set(null);
          this.notificationService.show('Книга успешно обновлена');
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

    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(confirmed => {
        if (confirmed) {
          this.store.dispatch(BooksActions.deleteBook({ id: bookId }));
          this.selectedBookId.set(null);
          this.notificationService.show('Книга успешно удалена');
        }
      });
  }

  protected onToggleReadStatus(): void {
    if (!this.hasSelection()) return;

    const bookId = this.selectedBookId()!;
    this.store.dispatch(BooksActions.toggleBookReadStatus({ id: bookId }));
    this.notificationService.show('Статус книги изменён');
  }
}
