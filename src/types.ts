import { UploadType, TableUploadType, GraphUploadType } from 'multinet';

export type CSVColumnType = 'label' | 'boolean' | 'category' | 'number' | 'date';

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
  extension: string[];
  queryCall: UploadType;
}

export interface TableFileType extends FileType{
  queryCall: TableUploadType;
}
export interface GraphFileType extends FileType{
  queryCall: GraphUploadType;
}

export interface FileTypeTable {
  [key: string]: FileType;
}
