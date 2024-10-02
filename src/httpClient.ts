import axios from "axios";
import { Observable } from "rxjs";

export class HttpClient {
  get<T>(url: string) {
    return new Observable<T>((observer) => {
      axios
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

  post<T>(url: string, data: T) {
    return new Observable<T>((observer) => {
      axios
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

  put<T>(url: string, data: T) {
    return new Observable((observer) => {
      axios
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

  delete<T>(url: string) {
    return new Observable((observer) => {
      axios
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

  patch<T>(url: string, data: T) {
    return new Observable((observer) => {
      axios
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
