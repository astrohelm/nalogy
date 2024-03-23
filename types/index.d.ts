// all exports = module.exports items
export const lib: {};

type Transport = {
  lvl?: string;
  target: string;
  options?: Object;
};

type Options = {
  depthLimit?: number;
  itemsLimit?: number;
  lvlComparison?: 'ASC' | 'DESC';
  customLevels?: { [key: string]: number };
  useOnlyCustomLevels?: boolean;
  serializers?: { [key: string]: (value: unknown) => unknown };
  level?: string;
  base?: { [key: string]: unknown };
  transports?: Transport | Transport[];
};
