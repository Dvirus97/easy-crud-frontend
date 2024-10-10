"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeNotRegisteredError = void 0;
class TypeNotRegisteredError extends Error {
    constructor(type) {
        super("there is no such type " + type + ". please register");
    }
}
exports.TypeNotRegisteredError = TypeNotRegisteredError;
