import { UploadType } from 'multinet';

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

export interface FileTypeTable {
  [key: string]: FileType;
}

export interface UserInfo {
  family_name: string;
  given_name: string;
  name: string;
  picture: string;
  email: string;
  sub: string;
}
