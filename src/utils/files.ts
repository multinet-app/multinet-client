import Papa, { ParseResult } from 'papaparse';
import dayjs from 'dayjs';
import { validUploadType } from 'multinet';
import { FileType, CSVColumnType } from '@/types';

const fileExtension = (file: File) => file.name.split('.').slice(-1)[0];
const fileName = (file: File) => file.name.split('.')[0];

function validFileType(file: File, allowedTypes: FileType[]) {
  const extension = fileExtension(file);
  return allowedTypes.some((type) => type.extension.includes(extension) && validUploadType(type.queryCall));
}

interface TypeScore {
  strings: Set<string>;
  number: number;
  date: number;
  total: number;
}

async function csvFileTypeRecommendations(file: File): Promise<Map<string, CSVColumnType>> {
  const parsePromise: Promise<Map<string, CSVColumnType>> = new Promise((resolve) => {
    const columnTypes = new Map<string, TypeScore>();
    const typeRecs = new Map<string, CSVColumnType>();

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      step(row: ParseResult<{}>) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = row.data as { [key: string]: any };

        Object.keys(data).forEach((key: string) => {
          if (!columnTypes.has(key)) {
            columnTypes.set(key, {
              strings: new Set<string>(),
              number: 0,
              date: 0,
              total: 0,
            });
          }

          const entry = columnTypes.get(key);
          if (entry === undefined) {
            throw new Error('impossible');
          }

          // Pass the value through a gauntlet of heuristics to see what types
          // it can convert to.
          const value = data[key];
          entry.total += 1;

          // Test for categoriness by counting up all the unique strings in
          // the column.
          entry.strings.add(value);

          // See if the value can be converted to a number. Empty strings
          // convert to 0, so those are excluded specifically. Trim the string
          // here and not above to preserve its literal string value in case
          // it's not a number.
          if (value.trim() !== '' && !Number.isNaN(Number(value.trim()))) {
            entry.number += 1;
          }

          // See if the value looks like a date.
          if (dayjs(value).isValid()) {
            entry.date += 1;
          }
        });
      },

      complete: () => {
        columnTypes.forEach((entry, field) => {
          const isKey = field === '_key' || field === '_from' || field === '_to';
          const category = entry.strings.size <= 10;
          const number = entry.number === entry.total;
          const date = entry.date === entry.total;

          let rec: CSVColumnType = 'label';
          if (isKey) {
            rec = 'label';
          } else if (category && !number && !date) {
            rec = 'category';
          } else if (number) {
            rec = 'number';
          } else if (date) {
            rec = 'date';
          }

          typeRecs.set(field, rec);
        });

        resolve(typeRecs);
      },
    });
  });

  return parsePromise;
}

export {
  fileName,
  validFileType,
  csvFileTypeRecommendations,
};
