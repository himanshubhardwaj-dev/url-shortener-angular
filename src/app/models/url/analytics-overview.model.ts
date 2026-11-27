import { DashboardSummary } from './dashboard-summary.model';
import { UrlListItem } from './paged-url-response.model';

export interface AnalyticsOverview {
  summary: DashboardSummary;
  urls: UrlListItem[];
}
