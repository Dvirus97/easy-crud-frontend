# easy crud frontend

> https://github.com/Dvirus97/easy-crud-frontend

This package help create fast basic curd api.

extend `IBaseModel` in your types for this package

```ts
interface Person extends IBaseModel {
  name: string;
  age: number;
}
```

use `clientService`

```ts
// clientService is a singleton service
const service = clientService;
// set the url of the server
service.setBaseUrl("http://localhost:5000");
// you can also change the default path of each route
service.setBaseUrl("http://localhost:5000",{
  getAll: "/getAll",
  delete: "/"
});

// you can also write it like this:
const service = clientServices.setBaseUrl("http://localhost:5000");

// register entity type to the service.
service.register("person")
// you can pass options
service.register("person", {
    updateDataOnChange: true;
    pollingInterval: 2000;
    pollingRetries: 2,
    override: true
});

// you can also register many types at ones.
// if you pass options, the types will share the same options
service.register(['person', 'car', 'table']);

// listen to changes of this type from the server
// this method emit value only if there are changes in the data base on `version` property
service.select$("person").subscribe(...)
service.selectOne$("person", "id1").subscribe(...)
```

you can use polling to keep the data up to date
polling is an interval that get data from the server.

```ts
// start polling only for a specified type
service.polling.start("person");
// start polling for all registered types
service.polling.start();

// same for stop
service.polling.stop();
```

use crud operations

```ts
const p1 = { id: "1", type: "person", name: "name1" };
service.createEntity(p1);

p1.name = "name2";
service.updateEntity(p1);

service.deleteEntity(p1);
```

there are more operations

```ts
const p1 = { id: "1", type: "person", name: "name" };

// all of these methods are one time stream. they are complete after one emit
getOne(p1).subscribe();
getAll("person").subscribe();
addOne(p1).subscribe();
updateOne(p1).subscribe();
updateMany("person", [p1, p2]).subscribe();
deleteOne(p1).subscribe();
deleteAll("person").subscribe();
```

but there it also custom action

```ts
service.customAction("person", "hello", "POST", { data: "world" }).subscribe();
```

#### For Angular

if you want this service as an Angular service you can do this:

```ts
import { InjectionToken } from "@angular/core";
import { clientService } from "easy-crud-frontend";

const service = clientService.setBaseUrl("http://localhost:5000");

export const ClientService = new InjectionToken("ClientService", {
  factory() {
    return service;
  },
});
```

and know you have access to ClientService as an Angular Service.

```ts
class AppComponent {
  clientService = inject(ClientService);
}
```

---

# Other things in this package

## HttpClient

use `axios` and `rxjs` to create observable based http request.

```ts
const http = new HttpClient();
http.get("path").subscribe((res) => console.log(res));
http.post("path", data).subscribe((res) => console.log(res));
http.put("path", data).subscribe((res) => console.log(res));
http.patch("path", data).subscribe((res) => console.log(res));
http.delete("path").subscribe((res) => console.log(res));
```

---

## Compare

### compareItems()

pass 2 objects and check if the are the same.
if there is a `version` property, it compare by version

> a.version == b.version

if there is no `version` property, it compare by json

> JSON.stringify(a) == JSON.stringify(b)

### isDataChanged()

pass 2 arrays and check if they are equal.
it use `compareItems()` function to compare

---

## smartPolling()

call a function in an interval.
if more than one subscribers are listening, they will get the same data.

```ts
function foo() {
  const name = "value";
  return of(name); // of() in rxjs convert any value to observable
}

const polling = smartPolling(foo, 1000);
const subscription = polling.subscribe((x) => console.log(x));

setTimeout(() => subscription.unsubscribe(), 4000);

/*
logs:
value // after one sec (1)
value // after one sec (2)
value // after one sec (3)
value // after one sec (4)
//  stop polling
 */
```
