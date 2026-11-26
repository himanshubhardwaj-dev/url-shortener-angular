import { Component, OnInit, computed, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Url } from '../../../core/services/url';
import { AuthState } from '../../../core/services/auth-state';
import { environemnt } from '../../../../environments/environment';
import { PagedUrlResponse, UrlListItem } from '../../../models/url/paged-url-response.model';

@Component({
  selector: 'app-url-list',
  standalone: true,
  imports: [DatePipe, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './url-list.html',
  styleUrl: './url-list.scss',
})
export class UrlList implements OnInit {
  readonly baseUrl = environemnt.apiUrl;
  readonly urls = signal<UrlListItem[]>([]);
  readonly searchTerm = signal('');
  readonly pageNumber = signal(1);
  readonly pageSize = 10;
  readonly totalRecords = signal(0);
  readonly totalPages = signal(0);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly copiedShortCode = signal<string | null>(null);
  readonly editingUrl = signal<UrlListItem | null>(null);
  readonly editOriginalUrl = signal('');
  readonly editExpiresAt = signal('');

  readonly filteredUrls = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.urls();

    return this.urls().filter(url =>
      url.shortCode.toLowerCase().includes(term) ||
      url.originalUrl.toLowerCase().includes(term)
    );
  });

  constructor(
    private urlService: Url,
    private authState: AuthState,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadUrls();
  }

  loadUrls(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.urlService.getAll(this.pageNumber(), this.pageSize).subscribe({
      next: (response: PagedUrlResponse) => {
        this.urls.set(response.items);
        this.totalRecords.set(response.totalRecords);
        this.totalPages.set(response.totalPages);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load URLs:', error);
        this.errorMessage.set('Unable to load your URLs. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.pageNumber()) return;
    this.pageNumber.set(page);
    this.loadUrls();
  }

  async copyShortUrl(shortCode: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(`${this.baseUrl}${shortCode}`);
      this.copiedShortCode.set(shortCode);
      window.setTimeout(() => {
        if (this.copiedShortCode() === shortCode) this.copiedShortCode.set(null);
      }, 2000);
    } catch {
      this.errorMessage.set('Unable to copy the link. Please copy it manually.');
    }
  }

  openEdit(url: UrlListItem): void {
    this.editingUrl.set(url);
    this.editOriginalUrl.set(url.originalUrl);
    this.editExpiresAt.set(url.expiresAt ? url.expiresAt.substring(0, 10) : '');
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  closeEdit(): void {
    if (!this.isSaving()) this.editingUrl.set(null);
  }

  saveEdit(): void {
    const url = this.editingUrl();
    const originalUrl = this.editOriginalUrl().trim();

    if (!url) return;
    if (!this.isValidUrl(originalUrl)) {
      this.errorMessage.set('Enter a valid destination URL starting with http:// or https://.');
      return;
    }

    const expiresAt = this.editExpiresAt()
      ? new Date(`${this.editExpiresAt()}T23:59:59`).toISOString()
      : null;

    this.isSaving.set(true);
    this.errorMessage.set('');

    this.urlService.update(url.shortCode, { originalUrl, expiresAt }).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.editingUrl.set(null);
        this.successMessage.set('Your short link was updated successfully.');
        this.loadUrls();
      },
      error: (error) => {
        console.error('Failed to update URL:', error);
        this.isSaving.set(false);
        this.errorMessage.set(error?.error || 'Unable to update this URL. Please try again.');
      }
    });
  }

  deleteUrl(url: UrlListItem): void {
    const confirmed = window.confirm(`Delete the short link "${url.shortCode}"? This action cannot be undone.`);
    if (!confirmed) return;

    this.errorMessage.set('');
    this.successMessage.set('');

    this.urlService.delete(url.shortCode).subscribe({
      next: () => {
        this.successMessage.set(`Short link "${url.shortCode}" was deleted.`);
        if (this.urls().length === 1 && this.pageNumber() > 1) {
          this.pageNumber.update(page => page - 1);
        }
        this.loadUrls();
      },
      error: (error) => {
        console.error('Failed to delete URL:', error);
        this.errorMessage.set('Unable to delete this URL. Please try again.');
      }
    });
  }

  isExpired(expiresAt: string | null): boolean {
    return !!expiresAt && new Date(expiresAt).getTime() <= Date.now();
  }

  isValidUrl(value: string): boolean {
    try {
      const parsed = new URL(value);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  get currentUser() {
    return this.authState.currentUser();
  }

  get userInitial(): string {
    return this.currentUser?.email?.charAt(0).toUpperCase() ?? 'U';
  }

  logout(): void {
    this.authState.logout();
    this.router.navigate(['/']);
  }
}
