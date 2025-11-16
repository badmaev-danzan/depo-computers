import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Book } from '../../../../shared/models/book.model';
import { BookService } from '../../../../core/services/book.service';

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
  private readonly bookService = inject(BookService);

  protected readonly books = signal<Book[]>([]);
  protected readonly selectedBooks = signal<Set<number>>(new Set());
  protected readonly displayedColumns = ['select', 'title', 'author', 'year', 'isRead'];
  protected readonly isLoading = signal(false);

  ngOnInit(): void {
    this.loadBooks();
  }

  private loadBooks(): void {
    this.isLoading.set(true);
    this.bookService.getAll().subscribe({
      next: (books) => {
        this.books.set(books);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Ошибка загрузки книг:', error);
        this.isLoading.set(false);
      }
    });
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
  }

  protected onEdit(): void {
  }

  protected onDelete(): void {
    if (!this.hasSelection()) return;

    const selectedIds = Array.from(this.selectedBooks());
    const confirmMessage = selectedIds.length === 1
      ? 'Удалить эту книгу?'
      : `Удалить ${selectedIds.length} книг(и)?`;

    if (confirm(confirmMessage)) {
      this.deleteBooks(selectedIds, 0);
    }
  }

  private deleteBooks(ids: number[], index: number): void {
    if (index >= ids.length) {
      this.selectedBooks.set(new Set());
      return;
    }

    this.bookService.delete(ids[index]).subscribe({
      next: () => {
        this.loadBooks();
        this.deleteBooks(ids, index + 1);
      },
      error: () => {
        alert('Ошибка удаления книги');
      }
    });
  }

  protected onToggleReadStatus(): void {
    if (!this.hasSelection()) return;

    const selectedIds = Array.from(this.selectedBooks());
    const currentBooks = this.books();

    selectedIds.forEach(id => {
      const book = currentBooks.find(b => b.id === id);
      if (book) {
        this.bookService.update(id, { isRead: !book.isRead }).subscribe({
          next: () => {
            this.loadBooks();
          },
          error: (error) => {
            alert('Ошибка обновления статуса');
          }
        });
      }
    });
  }
}
