import { validUploadType } from 'multinet';
import { FileType } from '@/types';

const fileExtension = (file: File) => file.name.split('.').slice(-1)[0];
const fileName = (file: File) => file.name.split('.')[0];

function validFileType(file: File, allowedTypes: FileType[]) {
  const extension = fileExtension(file);
  return allowedTypes.some((type) => type.extension.includes(extension) && validUploadType(type.queryCall));
}

export {
  fileName,
  validFileType,
};
