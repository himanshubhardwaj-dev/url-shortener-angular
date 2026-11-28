import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AuthState } from '../../../core/services/auth-state';
import { Url } from '../../../core/services/url';
import { CreateShortUrlRequest } from '../../../models/url/create-short-url-request.model';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class LandingComponent {
  longUrl = '';
  shortUrl = '';
  errorMessage = '';
  copied = false;
  isShortening = false;
  authRequired = false;

  constructor(
    private readonly urlService: Url,
    private readonly authState: AuthState
  ) {}

  get isAuthenticated(): boolean {
    return this.authState.isAuthenticated();
  }

  scrollToShortener(): void {
    document.getElementById('shortener')?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }

  scrollToHowItWorks(): void {
    document.getElementById('how-it-works')?.scrollIntoView({
      behavior: 'smooth',
    });
  }

  shortenUrl(): void {
    this.errorMessage = '';
    this.shortUrl = '';
    this.copied = false;
    this.authRequired = false;

    if (!this.isAuthenticated) {
      this.authRequired = true;
      this.errorMessage = 'Please sign in or create an account before shortening a URL.';
      return;
    }

    const originalUrl = this.longUrl.trim();

    if (!originalUrl) {
      this.errorMessage = 'Please enter a URL first.';
      return;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(originalUrl);
    } catch {
      this.errorMessage = 'Please enter a valid URL (example: https://google.com).';
      return;
    }

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      this.errorMessage = 'Only HTTP and HTTPS URLs can be shortened.';
      return;
    }

    const request: CreateShortUrlRequest = {
      originalUrl,
      expiresAt: null,
      customShortCode: null,
    };

    this.isShortening = true;

    this.urlService.create(request).subscribe({
      next: (response) => {
        this.isShortening = false;

        if (!response.shortUrl) {
          this.errorMessage = 'The API created the link but did not return a short URL. Please try again.';
          return;
        }

        // Use the URL returned by the API. Do not generate a code in the browser.
        this.shortUrl = response.shortUrl;
      },
      error: (error: HttpErrorResponse) => {
        this.isShortening = false;

        if (error.status === 401) {
          this.authRequired = true;
          this.errorMessage = 'Your session has expired. Please sign in again.';
          return;
        }

        this.errorMessage = this.getErrorMessage(error);
      },
    });
  }

  async copyShortUrl(): Promise<void> {
    if (!this.shortUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(this.shortUrl);
      this.copied = true;
      window.setTimeout(() => (this.copied = false), 2000);
    } catch {
      this.errorMessage = 'Unable to copy the link. Please copy it manually.';
    }
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Unable to reach the server. Please check that the API is running.';
    }

    if (typeof error.error === 'string' && error.error.trim()) {
      return error.error;
    }

    return error.error?.message
      ?? error.error?.title
      ?? 'Something went wrong while creating your short link. Please try again.';
  }
}
