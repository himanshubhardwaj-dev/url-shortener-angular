import { Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { Url } from './url';
import { AnalyticsOverview } from '../../models/url/analytics-overview.model';

@Injectable({
  providedIn: 'root',
})
export class Analytics {
  private readonly pageSize = 100;

  constructor(private urlService: Url) {}

  getOverview(): Observable<AnalyticsOverview> {
    return forkJoin({
      summary: this.urlService.getDashboardSummary(),
      firstPage: this.urlService.getAll(1, this.pageSize),
    }).pipe(
      switchMap(({ summary, firstPage }) => {
        const remainingPages = Array.from(
          { length: Math.max(firstPage.totalPages - 1, 0) },
          (_, index) => this.urlService.getAll(index + 2, this.pageSize)
        );

        if (remainingPages.length === 0) {
          return of({ summary, urls: firstPage.items });
        }

        return forkJoin(remainingPages).pipe(
          map((pages) => ({
            summary,
            urls: [...firstPage.items, ...pages.flatMap((page) => page.items)],
          }))
        );
      })
    );
  }
}
