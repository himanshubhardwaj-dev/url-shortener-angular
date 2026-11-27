import { Component, OnInit, computed, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthState } from '../../../core/services/auth-state';
import { Analytics } from '../../../core/services/analytics';
import { AnalyticsOverview } from '../../../models/url/analytics-overview.model';
import { UrlListItem } from '../../../models/url/paged-url-response.model';

@Component({
  selector: 'app-url-analytics',
  standalone: true,
  imports: [DatePipe, DecimalPipe, RouterLink, RouterLinkActive],
  templateUrl: './url-analytics.html',
  styleUrl: './url-analytics.scss',
})
export class UrlAnalytics implements OnInit {
  readonly overview = signal<AnalyticsOverview | null>(null);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  readonly topUrls = computed(() =>
    [...(this.overview()?.urls ?? [])]
      .sort((first, second) => second.clickCount - first.clickCount)
      .slice(0, 5)
  );

  readonly maxClicks = computed(() =>
    Math.max(1, ...this.topUrls().map((url) => url.clickCount))
  );

  readonly averageClicks = computed(() => {
    const summary = this.overview()?.summary;
    return summary && summary.totalUrls > 0
      ? Math.round(summary.totalClicks / summary.totalUrls)
      : 0;
  });

  constructor(
    private analyticsService: Analytics,
    private authState: AuthState,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.analyticsService.getOverview().subscribe({
      next: (response) => {
        this.overview.set(response);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load analytics:', error);
        this.errorMessage.set('Unable to load analytics. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  getClickPercentage(clickCount: number): number {
    return (clickCount / this.maxClicks()) * 100;
  }

  getUrlStatus(url: UrlListItem): 'Active' | 'Expired' {
    return url.expiresAt && new Date(url.expiresAt).getTime() <= Date.now()
      ? 'Expired'
      : 'Active';
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
