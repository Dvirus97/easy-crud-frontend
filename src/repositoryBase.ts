import { BehaviorSubject, EMPTY, Observable, switchMap, tap } from "rxjs";
import { isDataChanged } from "./compare";
import { HttpClient } from "./httpClient";
import { IBaseModel, IRouteOptions } from "./model";
import { smartPolling } from "./smartPolling";

export class RepositoryBase<T extends IBaseModel> {
  routeOptions: IRouteOptions | undefined;
  constructor(
    private http: HttpClient,
    private url: string,
    options?: {
      pollingInterval?: number;
      pollingNumOfRetries?: number;
      override?: boolean;
      routeOptions?: IRouteOptions;
    }
  ) {
    this.override = options?.override;
    this.routeOptions = this.setRoutes(options?.routeOptions ?? {});
    this.polling = smartPolling(
      () => this.getAll({ updateOnChange: true }),
      options?.pollingInterval ?? 1000,
      options?.pollingNumOfRetries ?? 3
    );
  }

  private setRoutes(options: IRouteOptions) {
    const defaults: IRouteOptions = {
      getOne: "/one/",
      getAll: "/all/",
      addOne: "/one/",
      updateOne: "/one/",
      updateMany: "/many/",
      deleteOne: "/one/",
      deleteAll: "/all/",
    };
    Object.entries(defaults).forEach(([key, val]) => {
      if (!(options as any)[key]) {
        (options as any)[key] = (defaults as any)[key];
        return;
      }
      if (!(options as any)[key].startsWith("/")) {
        (options as any)[key] = "/" + (options as any)[key];
      }
      if ((options as any)[key] && !(options as any)[key].endsWith("/")) {
        (options as any)[key] = (options as any)[key] + "/";
      }
    });
    return options;
  }

  data$ = new BehaviorSubject<T[]>([]);

  private setData(data: T[]) {
    this.data$.next(data);
  }
  updateDataOnChange = true;
  private override: boolean | undefined;

  polling: Observable<T[]>;

  getAll(options?: { updateOnChange: boolean }): Observable<T[]> {
    // return this.http.get<T[]>(this.url + "/all").pipe(
    return this.http.get<T[]>(this.url + this.routeOptions?.getAll).pipe(
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
    return this.http.get<T>(this.url + this.routeOptions?.getOne + id);
    // return this.http.get<T>(this.url + "/one/" + id);
  }
  addOne(data: T): Observable<T[]> {
    // return this.http.post(this.url + "/one/", data).pipe(
    return this.http.post(this.url + this.routeOptions?.addOne, data).pipe(
      switchMap((_) => {
        if (this.updateDataOnChange) {
          return this.getAll();
        }
        return EMPTY;
      })
    );
  }
  updateOne(data: T): Observable<T[]> {
    // return this.http.put(this.url + "/one/" + data.id, data).pipe(
    return this.http.put(this.url + this.routeOptions?.updateOne + data.id, data).pipe(
      switchMap((_) => {
        if (this.updateDataOnChange) {
          return this.getAll();
        }
        return EMPTY;
      })
    );
  }
  updateMany(data: T[]): Observable<T[]> {
    // return this.http.put(this.url + "/many", data).pipe(
    return this.http.put(this.url + this.routeOptions?.updateMany, data).pipe(
      switchMap((_) => {
        if (this.updateDataOnChange) {
          return this.getAll();
        }
        return EMPTY;
      })
    );
  }
  deleteOne(id: string | number): Observable<T[]> {
    // return this.http.delete(this.url + "/" + id).pipe(
    return this.http.delete(this.url + this.routeOptions?.deleteOne + id).pipe(
      switchMap((_) => {
        if (this.updateDataOnChange) {
          return this.getAll();
        }
        return EMPTY;
      })
    );
  }
  deleteAll(): Observable<T[]> {
    // return this.http.delete(this.url + "/all").pipe(
    return this.http.delete(this.url + this.routeOptions?.deleteAll).pipe(
      switchMap((_) => {
        if (this.updateDataOnChange) {
          return this.getAll();
        }
        return EMPTY;
      })
    );
  }
}
