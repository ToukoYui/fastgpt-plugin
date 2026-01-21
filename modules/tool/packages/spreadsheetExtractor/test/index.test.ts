import { describe, expect, test, vi, afterEach } from 'vitest';
import tool from '..';

const encoder = new TextEncoder();
const csvBuffer = encoder.encode('Name,Age\nAlice,30\nBob,\n').buffer;

afterEach(() => {
  vi.restoreAllMocks();
});

describe('spreadsheet extractor tool', () => {
  test('should have basic structure', () => {
    expect(tool.name).toBeDefined();
    expect(tool.description).toBeDefined();
    expect(tool.cb).toBeDefined();
  });

  test('should output complete rows with default column mapping', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, status: 200, statusText: 'OK', arrayBuffer: async () => csvBuffer });
    global.fetch = fetchMock as any;

    const res = await tool.cb({ file: 'https://example.com/data.csv' }, {} as any);
    expect(res.output?.result).toEqual([
      { Name: 'Alice', Age: '30' },
      { Name: 'Bob', Age: null }
    ]);
  });

  test('should handle custom column mapping', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, status: 200, statusText: 'OK', arrayBuffer: async () => csvBuffer });
    global.fetch = fetchMock as any;

    const res = await tool.cb(
      { file: 'https://example.com/data.csv', table_fields: { Name: 'username', Age: 'age' } as any },
      {} as any
    );
    expect(res.output?.result).toEqual([
      { username: 'Alice', age: '30' },
      { username: 'Bob', age: null }
    ]);
  });

  test('should return error when columns are missing', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, status: 200, statusText: 'OK', arrayBuffer: async () => csvBuffer });
    global.fetch = fetchMock as any;

    const res = await tool.cb(
      { file: 'https://example.com/data.csv', table_fields: { Missing: 'x' } as any },
      {} as any
    );
    expect(res.error?.message).toMatch(/Missing columns/);
  });

  test('should return error for unsupported file types', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, status: 200, statusText: 'OK', arrayBuffer: async () => csvBuffer });
    global.fetch = fetchMock as any;

    const res = await tool.cb({ file: 'https://example.com/data.txt' }, {} as any);
    expect(res.error?.message).toMatch(/Unsupported file type/);
  });
});
