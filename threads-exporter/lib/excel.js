'use strict';

const path = require('path');
const XLSX = require('xlsx');

/**
 * Writes the Excel file the same way the Chrome extension does:
 *   json_to_sheet(rows) -> book_new -> book_append_sheet(..., "Sheet1") -> writeFile
 * The file is named T_USER_THREADS_<username>_<row count>.xlsx.
 */
function exportFileName(username, rowCount) {
  return `T_USER_THREADS_${username}_${rowCount}.xlsx`;
}

function writeExcel(rows, username, outDir = '.') {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  const file = path.resolve(outDir, exportFileName(username, rows.length));
  XLSX.writeFile(wb, file);
  return file;
}

module.exports = { writeExcel, exportFileName };
