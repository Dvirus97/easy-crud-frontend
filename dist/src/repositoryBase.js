"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositoryBase = void 0;
const rxjs_1 = require("rxjs");
const compare_1 = require("./compare");
const smartPolling_1 = require("./smartPolling");
class RepositoryBase {
    constructor(http, url, options) {
        var _a, _b;
        this.http = http;
        this.url = url;
        this.data$ = new rxjs_1.BehaviorSubject([]);
        this.updateDataOnChange = true;
        this.override = options === null || options === void 0 ? void 0 : options.override;
        this.polling = (0, smartPolling_1.smartPolling)(() => this.getAll({ updateOnChange: true }), (_a = options === null || options === void 0 ? void 0 : options.pollingInterval) !== null && _a !== void 0 ? _a : 1000, (_b = options === null || options === void 0 ? void 0 : options.pollingNumOfRetries) !== null && _b !== void 0 ? _b : 3);
    }
    setData(data) {
        this.data$.next(data);
    }
    getAll(options) {
        return this.http.get(this.url + "/all").pipe((0, rxjs_1.tap)((x) => {
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
        return this.http.get(this.url + "/one/" + id);
    }
    addOne(data) {
        return this.http.post(this.url, data).pipe((0, rxjs_1.switchMap)((_) => {
            if (this.updateDataOnChange) {
                return this.getAll();
            }
            return rxjs_1.EMPTY;
        }));
    }
    updateOne(data) {
        return this.http.put(this.url + "/one/" + data.id, data).pipe((0, rxjs_1.switchMap)((_) => {
            if (this.updateDataOnChange) {
                return this.getAll();
            }
            return rxjs_1.EMPTY;
        }));
    }
    updateMany(data) {
        return this.http.put(this.url + "/many", data).pipe((0, rxjs_1.switchMap)((_) => {
            if (this.updateDataOnChange) {
                return this.getAll();
            }
            return rxjs_1.EMPTY;
        }));
    }
    deleteOne(id) {
        return this.http.delete(this.url + "/" + id).pipe((0, rxjs_1.switchMap)((_) => {
            if (this.updateDataOnChange) {
                return this.getAll();
            }
            return rxjs_1.EMPTY;
        }));
    }
    deleteAll() {
        return this.http.delete(this.url + "/all").pipe((0, rxjs_1.switchMap)((_) => {
            if (this.updateDataOnChange) {
                return this.getAll();
            }
            return rxjs_1.EMPTY;
        }));
    }
}
exports.RepositoryBase = RepositoryBase;
