export type SubDocConditionValue = boolean | Date | null | number | string | undefined;
export type SubDocConditions = Record<string, SubDocConditionValue>;

export interface SubDocConfig {
  path: string;
  idAttribute?: string;
  idParam?: string;
  conditions?: SubDocConditions;
  subDoc?: SubDocConfig;
}

export interface SubDocRecord {
  [key: string]: SubDocValue;
}

export type SubDocValue =
  | boolean
  | Date
  | null
  | number
  | string
  | SubDocRecord
  | Array<SubDocRecord>;

export type SubDocResult = SubDocRecord | Array<SubDocRecord> | null | undefined;
export type SubDocCallback = (err: Error | null, data?: SubDocResult) => void;
