import { catchError, EMPTY, interval, Observable, of, share, startWith, switchMap, tap } from "rxjs";

export function smartPolling<R>(pollFn: () => Observable<R>, _interval: number = 1000, maxRetries: number = 0) {
  const sharedPolling = new Observable<R>((observer) => {
    let retries = 0;

    const subscription = interval(_interval)
      .pipe(
        startWith(0),
        switchMap(() =>
          pollFn().pipe(
            tap((newValue) => {
              retries = 0;
              observer.next(newValue);
            }),
            catchError((error) => {
              if (++retries > maxRetries) {
                observer.error(error);
                return EMPTY;
              }
              console.warn(`Polling error (attempt ${retries}):`, error);
              return EMPTY;
            })
          )
        )
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      console.debug("%cSmart polling unsubscribe", "color:#3f3");
    };
  }).pipe(share({ resetOnRefCountZero: () => of(true) }));

  return sharedPolling;
}
