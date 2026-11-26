
import { Component, signal, output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Url } from '../../../core/services/url';
import { RouterLink } from '@angular/router';
import { CreateShortUrlRequest, CreateShortUrlResponse } from '../../../models/url/create-short-url-request.model';
@Component({
  selector: 'app-create-link',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './create-link.html',
  styleUrl: './create-link.scss',
})
export class CreateLinkComponent {
  readonly isCopied = signal(false);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');
  readonly successResponse = signal<CreateShortUrlResponse | null>(null);
  private readonly formBuilder = inject(FormBuilder);

  readonly createLinkForm = this.formBuilder.group({
    originalUrl: ['', [
      Validators.required,
      Validators.pattern(/^https?:\/\/.+/i)
    ]],
    expiresAt: [''],
    customShortCode: ['', [
      Validators.minLength(3),
      Validators.maxLength(20),
      Validators.pattern(/^[a-zA-Z0-9_-]*$/)
    ]]
  });

  constructor(private urlService: Url) { }

  onSubmit(): void {
    if (this.createLinkForm.invalid || this.isSubmitting()) {
      this.createLinkForm.markAllAsTouched();
      return;
    }

    const formValue = this.createLinkForm.getRawValue();

    const request: CreateShortUrlRequest = {
      originalUrl: formValue.originalUrl!.trim(),
      expiresAt: formValue.expiresAt
        ? new Date(formValue.expiresAt).toISOString()
        : null,
      customShortCode: formValue.customShortCode?.trim() || null
    };

    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.successResponse.set(null);

    this.urlService.create(request).subscribe({
      next: (response) => {
        this.successResponse.set(response);
        this.isSubmitting.set(false);
        this.createLinkForm.reset();
      },
      error: (error) => {
        console.error('Create URL failed:', error);

        this.errorMessage.set(
          error.status === 409
            ? 'This custom short code is already in use.'
            : error.error?.message || 'Unable to create your short link. Please try again.'
        );

        this.isSubmitting.set(false);
      }
    });
  }

  async copyShortUrl(shortUrl: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(shortUrl);

      this.isCopied.set(true);

      setTimeout(() => {
        this.isCopied.set(false);
      }, 2000);

    } catch (error) {
      console.error('Unable to copy short URL:', error);
      this.errorMessage.set('Unable to copy the short URL. Please try again.');
    }
  }
}
