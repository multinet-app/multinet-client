import Papa from 'papaparse';
import dayjs from 'dayjs';
import type { ColumnType } from 'multinet';

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

function generateColumnTypes(sampleRows: Record<string, unknown>[]) {
  /*
  recommendations are in the following order:
  keys
  boolean
  category
  date
  number

  label is fallback
  */

  const columnTypes: Record<string, ColumnType> = {};

  // Using the sample rows, guess a column type
  const columnNames = new Set(Object.keys(sampleRows[0]));
  sampleRows.forEach((row) => {
    Object.keys(row).forEach((field) => columnNames.add(field));
  });

  columnNames.forEach((field) => {
    const valuesInSample = sampleRows.map((row) => `${row[field]}`);
    const uniqueValuesInSample = new Set(valuesInSample);

    const isKey = field === '_key' || field === 'id';
    const isSource = field === '_from' || field === 'source';
    const isTarget = field === '_to' || field === 'target';
    const boolean = isBoolean(uniqueValuesInSample);
    const category = uniqueValuesInSample.size <= 10;
    const number = valuesInSample.every((value) => !Number.isNaN(Number(value)));
    const date = valuesInSample.every((value) => dayjs(value).isValid());

    let rec: ColumnType = 'label';
    if (isKey) {
      rec = 'primary key';
    } else if (isSource) {
      rec = 'edge source';
    } else if (isTarget) {
      rec = 'edge target';
    } else if (boolean) {
      rec = 'boolean';
    } else if (category && !number && !date) {
      rec = 'category';
    } else if (date) {
      rec = 'date';
    } else if (number) {
      rec = 'number';
    }

    columnTypes[field] = rec;
  });

  return columnTypes;
}

interface Analysis {
  columnTypes: Record<string, ColumnType>;
  sampleRows: Array<Record<string, unknown>>;
}

interface CSVAnalysis extends Analysis {
  delimiter: string;
}

export async function analyzeCSV(file: File, userDelim?: string, userQuote?: string) {
  const parsePromise: Promise<CSVAnalysis> = new Promise((resolve) => {
    const sampleRows = [] as Array<Record<string, unknown>>;
    let delimiter = '';

    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: userDelim === undefined ? '' : userDelim,
      quoteChar: userQuote === undefined ? '"' : userQuote,

      step(row, parser) {
        // Set the delimiter
        delimiter = row.meta.delimiter;

        sampleRows.push(row.data as unknown as Record<string, unknown>);

        if (sampleRows.length === 30) {
          parser.abort();
        }
      },

      complete: () => {
        // Generate the column types
        const columnTypes = generateColumnTypes(sampleRows);

        resolve({
          columnTypes,
          sampleRows,
          delimiter,
        });
      },
    });
  });

  return parsePromise;
}

export function guessJSONColumnTypes(sampleRows: { [key:string]: string }[]) {
  return generateColumnTypes(sampleRows);
}
