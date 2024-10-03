import { BehaviorSubject, EMPTY, Observable, switchMap, tap } from "rxjs";
import { isDataChanged } from "./compare";
import { HttpClient } from "./httpClient";
import { IBaseModel } from "./model";
import { smartPolling } from "./smartPolling";

export class RepositoryBase<T extends IBaseModel> {
  constructor(
    private http: HttpClient,
    private url: string,
    options?: { pollingInterval?: number; pollingNumOfRetries?: number; override?: boolean }
  ) {
    this.override = options?.override;
    this.polling = smartPolling(
      () => this.getAll({ updateOnChange: true }),
      options?.pollingInterval ?? 1000,
      options?.pollingNumOfRetries ?? 3
    );
  }

  data$ = new BehaviorSubject<T[]>([]);

  private setData(data: T[]) {
    this.data$.next(data);
  }
  updateDataOnChange = true;
  private override: boolean | undefined;

  polling: Observable<T[]>;

  getAll(options?: { updateOnChange: boolean }): Observable<T[]> {
    return this.http.get<T[]>(this.url + "/all").pipe(
      tap((x) => {
        const update = options ? options.updateOnChange : this.updateDataOnChange;
        // const change =
        if (update) {
          if (this.override ?? false) {
            this.setData(x);
          } else {
            if (isDataChanged(this.data$.value, x)) {
              this.setData(x);
            }
          }
        }
      })
    );
  }
  getOne(id: string): Observable<T> {
    return this.http.get<T>(this.url + "/one/" + id);
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
    return this.http.put(this.url + "/one/" + data.id, data).pipe(
      switchMap((_) => {
        if (this.updateDataOnChange) {
          return this.getAll();
        }
        return EMPTY;
      })
    );
  }
  updateMany(data: T[]): Observable<T[]> {
    return this.http.put(this.url + "/many", data).pipe(
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
    return this.http.delete(this.url + "/all").pipe(
      switchMap((_) => {
        if (this.updateDataOnChange) {
          return this.getAll();
        }
        return EMPTY;
      })
    );
  }
}
