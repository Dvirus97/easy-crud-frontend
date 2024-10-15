import { map, Observable, of, Subscription } from "rxjs";
import { TypeNotRegisteredError } from "./error";
import { IBaseModel, IRouteOptions } from "./model";
import { HttpClient } from "./httpClient";
import { RepositoryBase } from "./repositoryBase";

class ClientService<T extends IBaseModel = IBaseModel> {
  private map = new Map<string, RepositoryBase<T>>();
  private http = new HttpClient();

  private baseUrl?: string;
  private routeOptions?: IRouteOptions;
  /**
   * config the base url of the server
   * @param baseUrl the base url of the server
   * @param options  specify the route to the server for each operation
   * ### default
   * ```
   * getOne : (get) baseUrl/one/id
   * getAll : (get) baseUrl/all
   * addOne : (post) baseUrl/one
   * updateOne : (put) baseUrl/one
   * updateMany : (put) baseUrl/many
   * deleteOne : (delete) baseUrl/one/id
   * deleteAll : (delete) baseUrl/all
   * ```
   *  example:
   * ```ts
   * setBaseUrl("http://localhost:5000", {
   *  getOne: "/"
   *  getAll: "getAll"
   * })
   * ```
   */
  setBaseUrl(baseUrl: string, options?: IRouteOptions) {
    this.baseUrl = baseUrl;
    this.routeOptions = options;
    return this;
  }

  private getRepo(data: { type: string }) {
    if (!data.type) {
      throw new Error("there is not `type` property. Please provide a type");
    }
    const repo = this.map.get(data.type);
    if (!repo) {
      throw new TypeNotRegisteredError(data.type);
    }
    return repo;
  }
  private tryGetRepo(data: { type: string }) {
    return this.map.get(data.type);
  }

  /**
   * register new type of entity to clientService
   * @param types the type of entity to register
   * @param options -
   * - override: if true, data will emit every time. if false, data will be emitted only if changed
   * - updateDataOnChange: specifies if when the data change you want to emit value to `select$` method.
   * this is good to keep the app up to date without polling
   * - pollingInterval: specifies the interval of polling
   * - pollingRetries: specifies the number of times the polling keep try to execute in case of error.
   */
  register(
    types: string | string[],
    options?: { updateDataOnChange?: boolean; pollingInterval?: number; pollingRetries?: number; override?: boolean }
  ) {
    (typeof types == "string" ? [types] : types).forEach((type) => {
      if (this.map.has(type)) {
        return;
      }
      if (!this.baseUrl) {
        throw new Error("No base URL, please configure using 'setBaseUrl()' method");
      }
      const repo = new RepositoryBase<T>(this.http, this.baseUrl + "/" + type, {
        pollingInterval: options?.pollingInterval,
        pollingNumOfRetries: options?.pollingRetries,
        override: options?.override,
        routeOptions: this.routeOptions,
      });
      repo.updateDataOnChange = options?.updateDataOnChange ?? true;
      this.map.set(type, repo);
      repo.getAll().subscribe();
    });
  }

  private pollingSubscriptionMap = new Map<string, Subscription>();
  private saveSubscription(type: string, repo: RepositoryBase<T>) {
    if (this.pollingSubscriptionMap.has(type)) return;
    const subscription = repo.polling.subscribe();
    this.pollingSubscriptionMap.set(type, subscription);
  }
  private removeSubscription(type: string) {
    if (this.pollingSubscriptionMap.has(type)) {
      this.pollingSubscriptionMap.get(type)?.unsubscribe();
      this.pollingSubscriptionMap.delete(type);
    }
  }

  /** start and stop polling data from server. for all or by type */
  polling = {
    /**
     * start polling data from backend.
     * - if type is not specified, start polling for all registered types
     * - if type is specified, start polling for specific type
     * @param type the type that you want to poll
     */
    start: (type?: string) => {
      if (type) {
        this.saveSubscription(type, this.getRepo({ type }));
      } else {
        [...this.map.entries()].forEach(([type, repo]) => {
          this.saveSubscription(type, repo);
        });
      }
    },
    /**
     * stop polling data from backend
     * - if type is not specified, stop polling for all registered types
     * - if type is specified, stop polling for specific type
     * @param type the type that you want to stop polling
     */
    stop: (type?: string) => {
      if (type) {
        this.removeSubscription(type);
      } else {
        [...this.map.entries()].forEach(([type, _]) => {
          this.removeSubscription(type);
        });
      }
    },
  };

  /**
   * listen for data from backend. If there are no changes to the data, this method will not emit value
   * @param type the type that you want to listen
   * @returns observable with an array of the data
   */
  select$<K extends T = T>(type: string): Observable<K[]> {
    return this.getRepo({ type }).data$.asObservable() as Observable<K[]>;
  }

  selectOne$<K extends T = T>(type: string, id: string): Observable<K | undefined> {
    if (!type || !id) return of(undefined);
    return this.getRepo({ type }).data$.pipe(map((x) => x.find((x) => x.id == id))) as Observable<K>;
  }

  /**
   * create new entity
   * - this is an alias to `addOne` method
   * @param data the entity to create
   * @param onSuccess notify with the message form the backend
   */
  createEntity<K extends T = T>(data: K, onSuccess?: (x: any) => void) {
    this.addOne(data).subscribe(onSuccess);
  }
  /**
   * update an existing entity to entities
   * - this is an alias to `updateOne` or `updateMany` method
   * @param data the data to update. one or array
   * @param onSuccess notify with the message form the backend
   */
  updateEntity<K extends T = T>(data: K | K[], onSuccess?: (x: any) => void) {
    if (Array.isArray(data) && data.length > 0) {
      this.updateMany(data[0].type, data).subscribe(onSuccess);
    } else {
      this.updateOne(data as K).subscribe(onSuccess);
    }
  }
  /**
   * delete entity
   * - this is an alias for `deleteOne` method
   * @param data the entity to delete. the important part is the `id` property
   * @param onSuccess notify with the message form the backend
   */
  deleteEntity<K extends T = T>(data: K, onSuccess?: (x: any) => void) {
    this.deleteOne(data).subscribe(onSuccess);
  }

  /**
   * **http get "baseUrl/type/one/id"**
   * @param data must have `id` and `type`
   */
  getOne(data: T) {
    if (!data.id) {
      throw new Error("there is not `id` property. Please provide an id");
    }
    return this.getRepo(data).getOne(data.id);
  }
  /**
   * **http get "baseUrl/type/all/id"**
   * @param type the type of the entity
   */
  getAll<K extends T = T>(type: string): Observable<K[]> {
    return this.getRepo({ type }).getAll() as Observable<K[]>;
  }
  /**
   * **http post "baseUrl/type"**
   * @param data the value to create. must have `id` and `type`
   */
  addOne(data: T) {
    return this.getRepo(data).addOne(data);
  }
  /**
   * **http put "baseUrl/type/one/id"**
   * @param data the data to update, must have `id` and `type`
   */
  updateOne(data: T) {
    return this.getRepo(data).updateOne(data);
  }
  /**
   * **http put "baseUrl/type/many"**
   * @param type the type of the entities
   * @param data an array of all the entities to update
   */
  updateMany(type: string, data: T[]) {
    return this.getRepo({ type }).updateMany(data);
  }
  /**
   * **http delete "baseUrl/type"**
   * @param data the entity to delete. must have `id` and `type`
   */
  deleteOne(data: T) {
    if (!data.id) {
      throw new Error("there is not `id` property. Please provide an id");
    }
    return this.getRepo(data).deleteOne(data.id);
  }
  /**
   * ** http delete "baseUrl/type/all" **
   * @param type the type of entity to clear
   */
  deleteAll(type: string) {
    return this.getRepo({ type }).deleteAll();
  }

  /**
   * send a custom http request to the server.
   * the route will look like this: `baseUrl`/`type`/`action`/`config.params`
   * @param type
   * @param action
   * @param method
   * @param config you can pass data, or params
   * @returns observable with the data from the server
   */
  customAction(
    type: string,
    action: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    config?: { data?: any; params?: string[] }
  ): Observable<any> {
    let _action = action ? action + "/" : "";
    if (!this.baseUrl) {
      throw new Error("No base URL, please configure using 'setBaseUrl()' method");
    }
    let url = this.baseUrl + "/" + type + "/" + _action;
    if (config?.params) {
      url += config.params.join("/");
    }
    switch (method) {
      case "GET":
        return this.http.get(url);
      case "POST":
        return this.http.post(url, config?.data);
      case "PUT":
        return this.http.put(url, config?.data);
      case "DELETE":
        return this.http.delete(url + "/" + config?.data);
      default:
        throw new Error("Unknown method");
    }
  }
}

export const clientService = new ClientService();
