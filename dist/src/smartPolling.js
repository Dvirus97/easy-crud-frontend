"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.smartPolling = void 0;
const rxjs_1 = require("rxjs");
function smartPolling(pollFn, _interval = 1000, maxRetries = 0) {
    const sharedPolling = new rxjs_1.Observable((observer) => {
        let retries = 0;
        const subscription = (0, rxjs_1.interval)(_interval)
            .pipe((0, rxjs_1.startWith)(0), (0, rxjs_1.switchMap)(() => pollFn().pipe((0, rxjs_1.tap)((newValue) => {
            retries = 0;
            observer.next(newValue);
        }), (0, rxjs_1.catchError)((error) => {
            if (++retries > maxRetries) {
                observer.error(error);
                return rxjs_1.EMPTY;
            }
            console.warn(`Polling error (attempt ${retries}):`, error);
            return rxjs_1.EMPTY;
        }))))
            .subscribe();
        return () => {
            subscription.unsubscribe();
            console.debug("%cSmart polling unsubscribe", "color:#3f3");
        };
    }).pipe((0, rxjs_1.share)({ resetOnRefCountZero: () => (0, rxjs_1.of)(true) }));
    return sharedPolling;
}
exports.smartPolling = smartPolling;
