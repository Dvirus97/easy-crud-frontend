export type IBaseModel = {
  id?: string;
  type: string;
  version?: number;
};

export type IRouteOptions = {
  getOne?: string;
  getAll?: string;
  addOne?: string;
  updateOne?: string;
  updateMany?: string;
  deleteOne?: string;
  deleteAll?: string;
};
