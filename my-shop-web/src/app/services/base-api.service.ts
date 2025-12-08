import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export abstract class BaseApiService<T extends { id?: number | string }> {

  protected http = inject(HttpClient);

  /** مثال: 'vendors' أو 'items' */
  protected abstract resourcePath: string;

  /** base + resource => http://..../api/vendors */
  protected get url(): string {
    return `${environment.apiBaseUrl}/${this.resourcePath}`;
  }

  getAll(): Observable<T[]> {
    return this.http.get<T[]>(this.url);
  }

  getById(id: number | string): Observable<T> {
    return this.http.get<T>(`${this.url}/${id}`);
  }

  create(entity: T): Observable<T> {
    return this.http.post<T>(this.url, entity);
  }

  update(entity: T & { id: number | string }): Observable<void> {
    return this.http.put<void>(`${this.url}/${entity.id}`, entity);
  }

  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}

  // لو حاب تضيف ميثودز خاصة بالموردين:
  // مثال:
  // search(term: string): Observable<Vendor[]> {
  //   return this.http.get<Vendor[]>(`${this.url}/search`, { params: { term } });
  // }
