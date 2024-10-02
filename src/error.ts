export class TypeNotRegisteredError extends Error {
  constructor(type?: string) {
    super("there is no such type " + type + ". please register");
  }
}
