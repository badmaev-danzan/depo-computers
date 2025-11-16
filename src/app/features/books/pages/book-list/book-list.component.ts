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
}
