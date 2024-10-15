"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientService = void 0;
const rxjs_1 = require("rxjs");
const error_1 = require("./error");
const httpClient_1 = require("./httpClient");
const repositoryBase_1 = require("./repositoryBase");
class ClientService {
    constructor() {
        this.map = new Map();
        this.http = new httpClient_1.HttpClient();
        this.pollingSubscriptionMap = new Map();
        /** start and stop polling data from server. for all or by type */
        this.polling = {
            /**
             * start polling data from backend.
             * - if type is not specified, start polling for all registered types
             * - if type is specified, start polling for specific type
             * @param type the type that you want to poll
             */
            start: (type) => {
                if (type) {
                    this.saveSubscription(type, this.getRepo({ type }));
                }
                else {
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
            stop: (type) => {
                if (type) {
                    this.removeSubscription(type);
                }
                else {
                    [...this.map.entries()].forEach(([type, _]) => {
                        this.removeSubscription(type);
                    });
                }
            },
        };
    }
    /**
     * config the base url of the server
     * @param baseUrl the base url of the server
     * @param options  specify the route to the server for each predation
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
    setBaseUrl(baseUrl, options) {
        this.baseUrl = baseUrl;
        this.routeOptions = options;
        return this;
    }
    getRepo(data) {
        if (!data.type) {
            throw new Error("there is not `type` property. Please provide a type");
        }
        const repo = this.map.get(data.type);
        if (!repo) {
            throw new error_1.TypeNotRegisteredError(data.type);
        }
        return repo;
    }
    tryGetRepo(data) {
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
    register(types, options) {
        (typeof types == "string" ? [types] : types).forEach((type) => {
            var _a;
            if (this.map.has(type)) {
                return;
            }
            if (!this.baseUrl) {
                throw new Error("No base URL, please configure using 'setBaseUrl()' method");
            }
            const repo = new repositoryBase_1.RepositoryBase(this.http, this.baseUrl + "/" + type, {
                pollingInterval: options === null || options === void 0 ? void 0 : options.pollingInterval,
                pollingNumOfRetries: options === null || options === void 0 ? void 0 : options.pollingRetries,
                override: options === null || options === void 0 ? void 0 : options.override,
                routeOptions: this.routeOptions,
            });
            repo.updateDataOnChange = (_a = options === null || options === void 0 ? void 0 : options.updateDataOnChange) !== null && _a !== void 0 ? _a : true;
            this.map.set(type, repo);
            repo.getAll().subscribe();
        });
    }
    saveSubscription(type, repo) {
        if (this.pollingSubscriptionMap.has(type))
            return;
        const subscription = repo.polling.subscribe();
        this.pollingSubscriptionMap.set(type, subscription);
    }
    removeSubscription(type) {
        var _a;
        if (this.pollingSubscriptionMap.has(type)) {
            (_a = this.pollingSubscriptionMap.get(type)) === null || _a === void 0 ? void 0 : _a.unsubscribe();
            this.pollingSubscriptionMap.delete(type);
        }
    }
    /**
     * listen for data from backend. If there are no changes to the data, this method will not emit value
     * @param type the type that you want to listen
     * @returns observable with an array of the data
     */
    select$(type) {
        return this.getRepo({ type }).data$.asObservable();
    }
    selectOne$(type, id) {
        if (!type || !id)
            return (0, rxjs_1.of)(undefined);
        return this.getRepo({ type }).data$.pipe((0, rxjs_1.map)((x) => x.find((x) => x.id == id)));
    }
    /**
     * create new entity
     * - this is an alias to `addOne` method
     * @param data the entity to create
     * @param onSuccess notify with the message form the backend
     */
    createEntity(data, onSuccess) {
        this.addOne(data).subscribe(onSuccess);
    }
    /**
     * update an existing entity to entities
     * - this is an alias to `updateOne` or `updateMany` method
     * @param data the data to update. one or array
     * @param onSuccess notify with the message form the backend
     */
    updateEntity(data, onSuccess) {
        if (Array.isArray(data) && data.length > 0) {
            this.updateMany(data[0].type, data).subscribe(onSuccess);
        }
        else {
            this.updateOne(data).subscribe(onSuccess);
        }
    }
    /**
     * delete entity
     * - this is an alias for `deleteOne` method
     * @param data the entity to delete. the important part is the `id` property
     * @param onSuccess notify with the message form the backend
     */
    deleteEntity(data, onSuccess) {
        this.deleteOne(data).subscribe(onSuccess);
    }
    /**
     * **http get "baseUrl/type/one/id"**
     * @param data must have `id` and `type`
     */
    getOne(data) {
        if (!data.id) {
            throw new Error("there is not `id` property. Please provide an id");
        }
        return this.getRepo(data).getOne(data.id);
    }
    /**
     * **http get "baseUrl/type/all/id"**
     * @param type the type of the entity
     */
    getAll(type) {
        return this.getRepo({ type }).getAll();
    }
    /**
     * **http post "baseUrl/type"**
     * @param data the value to create. must have `id` and `type`
     */
    addOne(data) {
        return this.getRepo(data).addOne(data);
    }
    /**
     * **http put "baseUrl/type/one/id"**
     * @param data the data to update, must have `id` and `type`
     */
    updateOne(data) {
        return this.getRepo(data).updateOne(data);
    }
    /**
     * **http put "baseUrl/type/many"**
     * @param type the type of the entities
     * @param data an array of all the entities to update
     */
    updateMany(type, data) {
        return this.getRepo({ type }).updateMany(data);
    }
    /**
     * **http delete "baseUrl/type"**
     * @param data the entity to delete. must have `id` and `type`
     */
    deleteOne(data) {
        if (!data.id) {
            throw new Error("there is not `id` property. Please provide an id");
        }
        return this.getRepo(data).deleteOne(data.id);
    }
    /**
     * ** http delete "baseUrl/type/all" **
     * @param type the type of entity to clear
     */
    deleteAll(type) {
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
    customAction(type, action, method, config) {
        let _action = action ? action + "/" : "";
        if (!this.baseUrl) {
            throw new Error("No base URL, please configure using 'setBaseUrl()' method");
        }
        let url = this.baseUrl + "/" + type + "/" + _action;
        if (config === null || config === void 0 ? void 0 : config.params) {
            url += config.params.join("/");
        }
        switch (method) {
            case "GET":
                return this.http.get(url);
            case "POST":
                return this.http.post(url, config === null || config === void 0 ? void 0 : config.data);
            case "PUT":
                return this.http.put(url, config === null || config === void 0 ? void 0 : config.data);
            case "DELETE":
                return this.http.delete(url + "/" + (config === null || config === void 0 ? void 0 : config.data));
            default:
                throw new Error("Unknown method");
        }
    }
}
exports.clientService = new ClientService();
