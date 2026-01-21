import { z } from 'zod';
import path from 'path';
import * as XLSX from 'xlsx';
import iconv from 'iconv-lite';

export const InputType = z.object({
  file: z.string(),
  table_fields: z.record(z.any()).optional().nullable()
});

export const OutputType = z.object({
  result: z.array(z.record(z.string(), z.union([z.string(), z.null()])))
});

type FieldMapping = Record<string, string>;
type RowObject = Record<string, string | null>;

const supportedExt = new Set(['.csv', '.xlsx', '.xls']);

function normalizeSpaces(value: string) {
  return value.replace(/[\s\u00a0\u3000\r\n\t]+/g, ' ').trim();
}

function cleanColumnName(name: unknown) {
  if (typeof name !== 'string') return String(name ?? '').trim();
  const cleaned = normalizeSpaces(name);
  return cleaned;
}

function parseFieldMapping(tableFields: Record<string, any> | null | undefined): FieldMapping {
  if (!tableFields || Object.keys(tableFields).length === 0) {
    return {};
  }

  const mapping: FieldMapping = {};
  for (const [field, alias] of Object.entries(tableFields)) {
    if (typeof field !== 'string' || !field.trim()) {
      throw new Error(`Invalid column name: ${String(field)}`);
    }
    if (alias === null || alias === undefined) {
      throw new Error(`Invalid output field name for column ${field}`);
    }
    mapping[cleanColumnName(field)] = String(alias).trim();
  }

  return mapping;
}

function decodeCsv(buffer: ArrayBuffer) {
  const u8 = new Uint8Array(buffer);
  try {
    const decoder = new TextDecoder('utf-8', { fatal: true });
    return decoder.decode(u8);
  } catch {
    try {
      return iconv.decode(Buffer.from(u8), 'gbk');
    } catch (error) {
      throw new Error(`CSV decoding failed: ${(error as Error).message}`);
    }
  }
}

function readWorkbook(ext: string, buffer: ArrayBuffer): string[][] {
  if (!supportedExt.has(ext)) {
    throw new Error(`Unsupported file type ${ext}. Only .csv, .xls, .xlsx are supported`);
  }

  let workbook: XLSX.WorkBook;
  if (ext === '.csv') {
    const content = decodeCsv(buffer);
    workbook = XLSX.read(content, { type: 'string' });
  } else {
    workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
  }

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error('Spreadsheet is empty, no sheets found');

  const sheet = workbook.Sheets[sheetName];
  const rows: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  return rows;
}

function buildRecords(rows: string[][], mapping: FieldMapping): RowObject[] {
  if (rows.length === 0) return [];

  const headerRow = rows[0] ?? [];
  const headers = headerRow.map((name) => cleanColumnName(name)).filter((name) => name.length > 0);

  const headerIndex = new Map<string, number>();
  headerRow.forEach((name, idx) => {
    const cleaned = cleanColumnName(name);
    if (cleaned.length > 0 && !headerIndex.has(cleaned)) {
      headerIndex.set(cleaned, idx);
    }
  });

  const hasCustomMapping = Object.keys(mapping).length > 0;
  const targetColumns = hasCustomMapping ? mapping : Object.fromEntries(headers.map((h) => [h, h]));

  const missing = Object.keys(targetColumns).filter((key) => !headerIndex.has(key));
  if (missing.length) {
    throw new Error(`Missing columns: ${missing.join(', ')}. Available columns: ${headers.join(', ')}`);
  }

  const bodyRows = rows.slice(1);
  return bodyRows.map((row) => {
    const record: RowObject = {};
    for (const [columnName, alias] of Object.entries(targetColumns)) {
      const idx = headerIndex.get(columnName);
      const raw = idx === undefined ? undefined : row[idx ?? 0];
      if (raw === undefined || raw === null || raw === '') {
        record[alias] = null;
      } else {
        record[alias] = typeof raw === 'string' ? raw : String(raw);
      }
    }
    return record;
  });
}

export async function tool({ file, table_fields }: z.infer<typeof InputType>): Promise<z.infer<typeof OutputType>> {
  if (!file) {
    return Promise.reject('Please provide a spreadsheet file');
  }

  const ext = path.extname(file.split('?')[0] || '').toLowerCase();
  const res = await fetch(file);
  if (!res.ok) {
    return Promise.reject(`Failed to read file: ${res.status} ${res.statusText}`);
  }

  const buffer = await res.arrayBuffer();
  const fieldMapping = parseFieldMapping(table_fields);
  const rows = readWorkbook(ext, buffer);
  const result = buildRecords(rows, fieldMapping);

  return { result };
}
