import { IBaseModel } from "./model";

export function compareItems<T extends { version?: number; lastUpdate?: number }>(a: T, b: T): boolean {
  if (a.version !== undefined && b.version !== undefined) {
    return a.version !== b.version;
  }
  if ("lastUpdate" in a && "lastUpdate" in b) {
    return (a as any).lastUpdate !== (b as any).lastUpdate;
  }
  return JSON.stringify(a) !== JSON.stringify(b);
}

export function isDataChanged<T extends IBaseModel>(oldData: T | T[], newData: T | T[]): boolean {
  if (Array.isArray(oldData) && Array.isArray(newData)) {
    if (oldData.length !== newData.length) return true;
    return oldData.some((item, index) => compareItems(item, newData[index]));
  } else if (!Array.isArray(oldData) && !Array.isArray(newData)) {
    return compareItems(oldData, newData);
  }

  return true;
}
