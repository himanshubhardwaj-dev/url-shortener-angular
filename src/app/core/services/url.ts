import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PagedUrlResponse } from '../../models/url/paged-url-response.model';
import { environemnt } from '../../../environments/environment';
import { DashboardSummary } from '../../models/url/dashboard-summary.model';
import { CreateShortUrlRequest, CreateShortUrlResponse } from '../../models/url/create-short-url-request.model';

@Injectable({
  providedIn: 'root'
})
export class Url {

  private readonly apiUrl = `${environemnt.apiUrl}api/Url`;

  constructor(private http: HttpClient) { }

  getAll(pageNumber: number = 1, pageSize: number = 10): Observable<PagedUrlResponse> {

    return this.http.get<PagedUrlResponse>(
      `${this.apiUrl}?pageNumber=${pageNumber}&pageSize=${pageSize}`
    );
  }
  getDashboardSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(
      `${this.apiUrl}/dashboard-summary`
    );
  }
  create(data: CreateShortUrlRequest): Observable<CreateShortUrlResponse> {
    return this.http.post<CreateShortUrlResponse>(this.apiUrl, data);
  }
}