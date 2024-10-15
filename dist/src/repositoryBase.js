"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositoryBase = void 0;
const rxjs_1 = require("rxjs");
const compare_1 = require("./compare");
const smartPolling_1 = require("./smartPolling");
class RepositoryBase {
    constructor(http, url, options) {
        var _a, _b, _c;
        this.http = http;
        this.url = url;
        this.data$ = new rxjs_1.BehaviorSubject([]);
        this.updateDataOnChange = true;
        this.override = options === null || options === void 0 ? void 0 : options.override;
        this.routeOptions = this.setRoutes((_a = options === null || options === void 0 ? void 0 : options.routeOptions) !== null && _a !== void 0 ? _a : {});
        this.polling = (0, smartPolling_1.smartPolling)(() => this.getAll({ updateOnChange: true }), (_b = options === null || options === void 0 ? void 0 : options.pollingInterval) !== null && _b !== void 0 ? _b : 1000, (_c = options === null || options === void 0 ? void 0 : options.pollingNumOfRetries) !== null && _c !== void 0 ? _c : 3);
    }
    setRoutes(options) {
        const defaults = {
            getOne: "/one/",
            getAll: "/all/",
            addOne: "/one/",
            updateOne: "/one/",
            updateMany: "/many/",
            deleteOne: "/one/",
            deleteAll: "/all/",
        };
        Object.entries(defaults).forEach(([key, val]) => {
            if (!options[key]) {
                options[key] = defaults[key];
                return;
            }
            if (!options[key].startsWith("/")) {
                options[key] = "/" + options[key];
            }
            if (options[key] && !options[key].endsWith("/")) {
                options[key] = options[key] + "/";
            }
        });
        return options;
    }
    setData(data) {
        this.data$.next(data);
    }
    getAll(options) {
        var _a;
        // return this.http.get<T[]>(this.url + "/all").pipe(
        return this.http.get(this.url + ((_a = this.routeOptions) === null || _a === void 0 ? void 0 : _a.getAll)).pipe((0, rxjs_1.tap)((x) => {
            var _a;
            const update = options ? options.updateOnChange : this.updateDataOnChange;
            // const change =
            if (update) {
                if ((_a = this.override) !== null && _a !== void 0 ? _a : false) {
                    this.setData(x);
                }
                else {
                    if ((0, compare_1.isDataChanged)(this.data$.value, x)) {
                        this.setData(x);
                    }
                }
            }
        }));
    }
    getOne(id) {
        var _a;
        return this.http.get(this.url + ((_a = this.routeOptions) === null || _a === void 0 ? void 0 : _a.getOne) + id);
        // return this.http.get<T>(this.url + "/one/" + id);
    }
    addOne(data) {
        var _a;
        // return this.http.post(this.url + "/one/", data).pipe(
        return this.http.post(this.url + ((_a = this.routeOptions) === null || _a === void 0 ? void 0 : _a.addOne), data).pipe((0, rxjs_1.switchMap)((_) => {
            if (this.updateDataOnChange) {
                return this.getAll();
            }
            return rxjs_1.EMPTY;
        }));
    }
    updateOne(data) {
        var _a;
        // return this.http.put(this.url + "/one/" + data.id, data).pipe(
        return this.http.put(this.url + ((_a = this.routeOptions) === null || _a === void 0 ? void 0 : _a.updateOne) + data.id, data).pipe((0, rxjs_1.switchMap)((_) => {
            if (this.updateDataOnChange) {
                return this.getAll();
            }
            return rxjs_1.EMPTY;
        }));
    }
    updateMany(data) {
        var _a;
        // return this.http.put(this.url + "/many", data).pipe(
        return this.http.put(this.url + ((_a = this.routeOptions) === null || _a === void 0 ? void 0 : _a.updateMany), data).pipe((0, rxjs_1.switchMap)((_) => {
            if (this.updateDataOnChange) {
                return this.getAll();
            }
            return rxjs_1.EMPTY;
        }));
    }
    deleteOne(id) {
        var _a;
        // return this.http.delete(this.url + "/" + id).pipe(
        return this.http.delete(this.url + ((_a = this.routeOptions) === null || _a === void 0 ? void 0 : _a.deleteOne) + id).pipe((0, rxjs_1.switchMap)((_) => {
            if (this.updateDataOnChange) {
                return this.getAll();
            }
            return rxjs_1.EMPTY;
        }));
    }
    deleteAll() {
        var _a;
        // return this.http.delete(this.url + "/all").pipe(
        return this.http.delete(this.url + ((_a = this.routeOptions) === null || _a === void 0 ? void 0 : _a.deleteAll)).pipe((0, rxjs_1.switchMap)((_) => {
            if (this.updateDataOnChange) {
                return this.getAll();
            }
            return rxjs_1.EMPTY;
        }));
    }
}
exports.RepositoryBase = RepositoryBase;
