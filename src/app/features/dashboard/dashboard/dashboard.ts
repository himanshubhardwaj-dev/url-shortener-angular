import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthState } from '../../../core/services/auth-state';
import { PagedUrlResponse, UrlListItem } from '../../../models/url/paged-url-response.model';
import { Url } from '../../../core/services/url';
import { environemnt } from '../../../../environments/environment';
import { DatePipe } from '@angular/common';
import { DashboardSummary } from '../../../models/url/dashboard-summary.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit {
  readonly baseUrl = environemnt.apiUrl;
  readonly urls = signal<UrlListItem[]>([]);
  readonly copiedShortCode = signal<string | null>(null);
  readonly dashboardSummary = signal<DashboardSummary | null>(null);
  readonly totalUrls = signal(0);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  constructor(
    private authState: AuthState,
    private router: Router,
    private urlService: Url
  ) { }
  ngOnInit(): void {
    this.loadDashboardData();
  }
  loadDashboardData(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.urlService.getAll(1, 10).subscribe({
      next: (response: PagedUrlResponse) => {
        this.urls.set(response.items);
        this.totalUrls.set(response.totalRecords);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load dashboard data:', error);
        this.errorMessage.set('Unable to load dashboard data. Please try again.');
        this.isLoading.set(false);
      }
    });
    this.urlService.getDashboardSummary().subscribe({
      next: (response) => {
        this.dashboardSummary.set(response);
      },
      error: (error) => {
        console.error('Failed to load dashboard summary:', error);
      }
    });
  }
  get currentUser() {
    return this.authState.currentUser();
  }

  get userInitial(): string {
    const email = this.currentUser?.email;

    return email ? email.charAt(0).toUpperCase() : 'U';
  }

  logout(): void {
    this.authState.logout();
    this.router.navigate(['/']);
  }
  getTotalClicks(): number {
    return this.urls().reduce(
      (total, url) => total + url.clickCount, 0
    );
  }
  async copyShortUrl(shortCode: string): Promise<void> {
    const shortUrl = `${this.baseUrl}${shortCode}`;

    try {
      await navigator.clipboard.writeText(shortUrl);
      this.copiedShortCode.set(shortCode);

      setTimeout(() => {
        if (this.copiedShortCode() === shortCode) {
          this.copiedShortCode.set(null);
        }
      }, 2000);

    } catch {
      console.error('Unable to copy short URL.');
    }
  }
  getActiveUrls(): number {
    const now = new Date();

    return this.urls().filter(url =>
      !url.expiresAt || new Date(url.expiresAt) > now
    ).length;
  }

  getExpiredUrls(): number {
    const now = new Date();

    return this.urls().filter(url =>
      url.expiresAt && new Date(url.expiresAt) <= now
    ).length;
  }

}