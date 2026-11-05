import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environemnt } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Url {

  private readonly apiUrl = `${environemnt.apiUrl}api/Url`;

  constructor(private http: HttpClient) {}

  getAll(pageNumber: number = 1, pageSize: number = 10): Observable<unknown> {

    return this.http.get(
      `${this.apiUrl}?pageNumber=${pageNumber}&pageSize=${pageSize}`
    );
  }
}