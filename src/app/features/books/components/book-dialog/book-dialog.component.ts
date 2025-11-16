import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Book } from '../../../../shared/models/book.model';

export interface BookDialogData {
  book?: Book;
  mode: 'add' | 'edit';
}

@Component({
  selector: 'app-book-dialog',
  templateUrl: './book-dialog.component.html',
  styleUrl: './book-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule
  ]
})
export class BookDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<BookDialogComponent>);
  private readonly data = inject<BookDialogData>(MAT_DIALOG_DATA);

  protected readonly title = this.data.mode === 'add' ? 'Добавить книгу' : 'Редактировать книгу';

  protected readonly form = this.fb.group({
    title: [this.data.book?.title || '', [Validators.required]],
    author: [this.data.book?.author || '', [Validators.required]],
    year: [this.data.book?.year || new Date().getFullYear(), [Validators.required, Validators.min(1000), Validators.max(9999)]],
    isRead: [this.data.book?.isRead || false]
  });

  protected onCancel(): void {
    this.dialogRef.close();
  }

  protected onSave(): void {
    if (this.form.valid) {
      const formValue = this.form.value;
      const result = {
        ...this.data.book,
        title: formValue.title!,
        author: formValue.author!,
        year: formValue.year!,
        isRead: formValue.isRead!
      };
      this.dialogRef.close(result);
    }
  }
}
