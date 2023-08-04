export interface App {
  name: string;
  url: string;
}

export interface KeyValue {
  key: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
}

export interface TableRow {
  _key: string;
  _id: string;
  _rev: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}
export interface FileType {
  displayName: string;
  hint: string;
  extension: string;
  type: 'network' | 'table';
}

export interface CheckboxTable {
  [index: string]: boolean;
}

export interface Upload {
  id: number;
  blob: string;
  status: 'PENDING' | 'STARTED' | 'FAILED' | 'FINISHED';
  data_type: string;
  created: string;
  error_messages: string[];
}
