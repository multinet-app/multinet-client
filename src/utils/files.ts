import type { ParseResult } from 'papaparse';
import Papa from 'papaparse';
import dayjs from 'dayjs';
import type { CSVColumnType } from '@/types';

function isBoolean(strings: Set<string>) {
  // This function tests whether both elements of an array belong to the string
  // set.
  const hasPair = ([a, b]: [string, string]) => strings.has(a) && strings.has(b);

  // This is a list of two-element arrays containing valid false/true value
  // pairs.
  const candidates: Array<[string, string]> = [
    ['0', '1'],
    ['no', 'yes'],
    ['No', 'Yes'],
    ['NO', 'YES'],
    ['n', 'y'],
    ['N', 'Y'],
    ['false', 'true'],
    ['False', 'True'],
    ['FALSE', 'TRUE'],
    ['off', 'on'],
    ['Off', 'On'],
    ['OFF', 'ON'],
  ];

  // Consider the string set to be compatible with the "boolean" semantic type
  // if it contains exactly two unique values, and that pair of values is
  // precisely one of the candidate pairs above.
  return strings.size === 2 && candidates.some(hasPair);
}

interface TypeScore {
  strings: Set<string>;
  number: number;
  date: number;
  total: number;
}

interface CSVAnalysis {
  typeRecs: Map<string, CSVColumnType>;
  sampleRows: Array<Record<string, unknown>>;
  delimiter: string;
}

export async function analyzeCSV(file: File, userDelim?: string, userQuote?: string): Promise<CSVAnalysis> {
  const parsePromise: Promise<CSVAnalysis> = new Promise((resolve) => {
    const columnTypes = new Map<string, TypeScore>();
    const typeRecs = new Map<string, CSVColumnType>();
    const sampleRows = [] as Array<Record<string, unknown>>;
    let delimiter = '';
    let rowsParsed = 0;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: userDelim === undefined ? '' : userDelim,
      quoteChar: userQuote === undefined ? '"' : userQuote,
      step(row: ParseResult<Record<string, unknown>>, parser) {
        // Set the delimiter
        delimiter = row.meta.delimiter;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = row.data as { [key: string]: any };

        if (sampleRows.length !== 30) {
          sampleRows.push({ ...data });
        }

        // Increment number of rows parsed and return if we've done 1000
        rowsParsed += 1;
        if (rowsParsed === 1000) {
          parser.abort();
        }

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
          if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value.trim()))) {
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
          const boolean = isBoolean(entry.strings);
          const category = entry.strings.size <= 10;
          const number = entry.number === entry.total;
          const date = entry.date === entry.total;

          let rec: CSVColumnType = 'label';
          if (isKey) {
            rec = 'label';
          } else if (boolean) {
            rec = 'boolean';
          } else if (category && !number && !date) {
            rec = 'category';
          } else if (number) {
            rec = 'number';
          } else if (date) {
            rec = 'date';
          }

          typeRecs.set(field, rec);
        });

        resolve({
          typeRecs,
          sampleRows,
          delimiter,
        });
      },
    });
  });

  return parsePromise;
}

export function guessJSONColumnTypes(sampleRows: { [key:string]: string }[]) {
  // Using the sample rows, guess a column type
  let numNumbers = 0;
  let numDates = 0;

  return Object.keys(sampleRows[0]).map((field) => {
    const valuesInSample = sampleRows.map((row) => {
      if (typeof field === 'string' && field.trim() !== '' && !Number.isNaN(Number(field.trim()))) {
        numNumbers += 1;
      }

      // See if the value looks like a date.
      if (dayjs(field).isValid()) {
        numDates += 1;
      }
      return row[field];
    });
    const uniqueValuesInSample = new Set(valuesInSample);

    const isKey = field === '_key' || field === '_from' || field === '_to';
    const boolean = isBoolean(uniqueValuesInSample);
    const category = uniqueValuesInSample.size <= 10;
    const number = numNumbers === valuesInSample.length;
    const date = numDates === valuesInSample.length;

    let rec: CSVColumnType = 'label';
    if (isKey) {
      rec = 'label';
    } else if (boolean) {
      rec = 'boolean';
    } else if (category && !number && !date) {
      rec = 'category';
    } else if (number) {
      rec = 'number';
    } else if (date) {
      rec = 'date';
    }
    return { [field]: rec };
  }).reduce((accumulator, currentVal) => ({ ...accumulator, ...currentVal }), {});
}
