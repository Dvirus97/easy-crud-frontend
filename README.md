# easy crud frontend

> https://github.com/Dvirus97/easy-crud-frontend

This package help create fast basic curd api.

use `clientService`

```ts
// clientService is a singleton service
const service = clientService;
// set the url of the server
service.setBaseUrl("http://localhost:3010");

// this is a short way
const service = clientServices.setBaseUrl("http://localhost:3010");

// register entity type to the service.
// you can pass options
service.register("person", {
    updateDataOnChange: true;
    pollingInterval: 2000;
    pollingRetries: 2
});

// you can also register many types at ones
service.register(["person", 'car', 'table'], {
    updateDataOnChange: true;
    pollingInterval: 2000;
    pollingRetries: 2
});

// listen to changes of this type form the server
// this method emit value only if there are changes in the data
service.select$("person").subscribe(...)
```

you can use polling to keep the data up to date

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

// all of there methods are one time stream. they are complete after one emit
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
