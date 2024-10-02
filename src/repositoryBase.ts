import { BehaviorSubject, EMPTY, Observable, switchMap, tap } from "rxjs";
import { isDataChanged } from "./compare";
import { HttpClient } from "./httpClient";
import { IBaseModel } from "./model";
import { smartPolling } from "./smartPolling";

export class RepositoryBase<T extends IBaseModel> {
  constructor(
    private http: HttpClient,
    private url: string,
    pollingOptions?: { interval?: number; numberOfRetries?: number }
  ) {
    this.polling = smartPolling(
      () => this.getAll({ updateOnChange: true }),
      pollingOptions?.interval ?? 1000,
      pollingOptions?.numberOfRetries ?? 3
    );
  }

  data$ = new BehaviorSubject<T[]>([]);

  private setData(data: T[]) {
    this.data$.next(data);
  }
  updateDataOnChange = false;

  polling: { observable: Observable<T[]> };

  getAll(options?: { updateOnChange: boolean }): Observable<T[]> {
    return this.http.get<T[]>(this.url).pipe(
      tap((x) => {
        if ((this.updateDataOnChange || options?.updateOnChange) && isDataChanged(this.data$.value, x)) {
          this.setData(x);
        }
      })
    );
  }
  getOne(id: string): Observable<T> {
    return this.http.get<T>(this.url + "/" + id);
  }
  addOne(data: T): Observable<T[]> {
    return this.http.post(this.url, data).pipe(
      switchMap((_) => {
        if (this.updateDataOnChange) {
          return this.getAll();
        }
        return EMPTY;
      })
    );
  }
  updateOne(data: T): Observable<T[]> {
    return this.http.put(this.url + "/" + data.id, data).pipe(
      switchMap((_) => {
        if (this.updateDataOnChange) {
          return this.getAll();
        }
        return EMPTY;
      })
    );
  }
  updateMany(data: T[]): Observable<T[]> {
    return this.http.put(this.url, data).pipe(
      switchMap((_) => {
        if (this.updateDataOnChange) {
          return this.getAll();
        }
        return EMPTY;
      })
    );
  }
  deleteOne(id: string | number): Observable<T[]> {
    return this.http.delete(this.url + "/" + id).pipe(
      switchMap((_) => {
        if (this.updateDataOnChange) {
          return this.getAll();
        }
        return EMPTY;
      })
    );
  }
  deleteAll(): Observable<T[]> {
    return this.http.delete(this.url).pipe(
      switchMap((_) => {
        if (this.updateDataOnChange) {
          return this.getAll();
        }
        return EMPTY;
      })
    );
  }
}
