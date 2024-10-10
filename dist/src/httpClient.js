"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpClient = void 0;
const axios_1 = __importDefault(require("axios"));
const rxjs_1 = require("rxjs");
class HttpClient {
    get(url) {
        return new rxjs_1.Observable((observer) => {
            axios_1.default
                .get(url)
                .then((x) => {
                observer.next(x.data);
                observer.complete();
            })
                .catch((err) => {
                observer.error(err);
                observer.complete();
            });
        });
    }
    post(url, data) {
        return new rxjs_1.Observable((observer) => {
            axios_1.default
                .post(url, data)
                .then((x) => {
                observer.next(x.data);
                observer.complete();
            })
                .then((err) => {
                observer.error(err);
                observer.complete();
            });
        });
    }
    put(url, data) {
        return new rxjs_1.Observable((observer) => {
            axios_1.default
                .put(url, data)
                .then((x) => {
                observer.next(x.data);
                observer.complete();
            })
                .catch((err) => {
                observer.error(err);
                observer.complete();
            });
        });
    }
    delete(url) {
        return new rxjs_1.Observable((observer) => {
            axios_1.default
                .delete(url)
                .then((x) => {
                observer.next(x.data);
                observer.complete();
            })
                .catch((err) => {
                observer.error(err);
                observer.complete();
            });
        });
    }
    patch(url, data) {
        return new rxjs_1.Observable((observer) => {
            axios_1.default
                .patch(url, data)
                .then((x) => {
                observer.next(x.data);
                observer.complete();
            })
                .catch((err) => {
                observer.error(err);
                observer.complete();
            });
        });
    }
}
exports.HttpClient = HttpClient;
