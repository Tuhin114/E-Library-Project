/**
 * Minimal RFC 4180-ish CSV serializer — no dependency, since this app's
 * only CSV need is "turn an array of flat objects into a downloadable
 * file," not full spreadsheet-grade CSV (no multi-line cells, no
 * embedded formulas to guard against). Quotes a field only when it
 * actually contains a comma, quote, or newline; doubles internal quotes
 * per the standard escaping rule.
 *
 * @param {Array<Record<string, any>>} rows
 * @param {Array<{ key: string, label: string }>} columns - order and
 *   header text; `key` is looked up on each row (supports dot paths,
 *   e.g. "user.name").
 * @returns {string} CSV text, CRLF line endings, header row included.
 */
const getValueAtPath = (row, path) =>
  path.split(".").reduce((value, segment) => value?.[segment], row);

const escapeCsvField = (value) => {
  if (value === null || value === undefined) return "";
  const stringValue = String(value);
  if (/[",\r\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

export const toCsv = (rows, columns) => {
  const header = columns.map((col) => escapeCsvField(col.label)).join(",");
  const lines = rows.map((row) =>
    columns.map((col) => escapeCsvField(getValueAtPath(row, col.key))).join(","),
  );
  return [header, ...lines].join("\r\n");
};
