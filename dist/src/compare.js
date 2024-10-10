"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDataChanged = exports.compareItems = void 0;
function compareItems(a, b) {
    if (a.version !== undefined && b.version !== undefined) {
        return a.version == b.version;
    }
    // if ("lastUpdate" in a && "lastUpdate" in b) {
    //   return (a as any).lastUpdate !== (b as any).lastUpdate;
    // }
    return JSON.stringify(a) == JSON.stringify(b);
}
exports.compareItems = compareItems;
function isDataChanged(oldData, newData) {
    if (Array.isArray(oldData) && Array.isArray(newData)) {
        if (oldData.length !== newData.length)
            return true;
        return oldData.some((item, index) => !compareItems(item, newData[index]));
    }
    else if (!Array.isArray(oldData) && !Array.isArray(newData)) {
        return !compareItems(oldData, newData);
    }
    return true;
}
exports.isDataChanged = isDataChanged;
