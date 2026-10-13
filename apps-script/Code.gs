/**
 * NTM Virtual Lab — submission receiver (Google Apps Script, bound to a Google Sheet).
 * Setup: see SUBMISSIONS_SETUP.md. Each student submission is appended as one row
 * of the "Submissions" sheet. Rows with a wrong class code go to "Rejected".
 */
var COLUMNS = [
  ['received', 'Received (server time)'], ['reportId', 'Report ID'], ['process', 'Process'],
  ['name', 'Name'], ['usn', 'USN'], ['section', 'Sem / section'], ['batch', 'Batch'],
  ['faculty', 'Faculty'], ['institution', 'Institution'], ['reportDate', 'Report date'],
  ['safetyAck', 'Safety acknowledged'], ['preFirst', 'Pre-test first attempt'], ['preN', 'Pre-test out of'],
  ['postFirst', 'Post-test first attempt'], ['postN', 'Post-test out of'], ['gain', 'Normalised gain g'],
  ['preNow', 'Pre-test current'], ['postNow', 'Post-test current'],
  ['runsCorrect', 'Machine runs correct'], ['runsTotal', 'Machine runs'],
  ['numSolved', 'Numericals solved'], ['numAttempted', 'Numericals attempted'],
  ['observations', 'Observations recorded'], ['model', 'Simulator model'],
  ['conclusion', 'Conclusions'], ['disc1', 'Discussion 1'], ['disc2', 'Discussion 2'], ['disc3', 'Discussion 3'],
  ['version', 'Lab version'], ['clientTime', 'Student clock']
];
var MAX_TEXT = 5000;

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var d;
    try { d = JSON.parse(e.postData.contents); } catch (err) { return reply_({ ok: false, error: 'bad request' }); }
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var code = PropertiesService.getScriptProperties().getProperty('CLASS_CODE');
    if (code && norm_(d.classCode) !== norm_(code)) {
      var rj = ss.getSheetByName('Rejected') || ss.insertSheet('Rejected');
      if (rj.getLastRow() === 0) rj.appendRow(['Received', 'USN', 'Name', 'Process', 'Code entered']);
      rj.appendRow([new Date(), clean_(d.usn), clean_(d.name), clean_(d.process), clean_(d.classCode)]);
      return reply_({ ok: false, error: 'class code' });
    }
    if (!d.usn || !d.name) return reply_({ ok: false, error: 'name and USN required' });
    var sh = ss.getSheetByName('Submissions') || ss.insertSheet('Submissions');
    if (sh.getLastRow() === 0) {
      sh.appendRow(COLUMNS.map(function (c) { return c[1]; }));
      sh.setFrozenRows(1);
      sh.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold');
    }
    sh.appendRow(COLUMNS.map(function (c) { return c[0] === 'received' ? new Date() : clean_(d[c[0]]); }));
    return reply_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

function doGet() { return reply_({ ok: true, service: 'NTM Virtual Lab submissions' }); }

function norm_(s) { return String(s == null ? '' : s).trim().toUpperCase(); }
// Truncate long text and stop spreadsheet formula injection (=, +, -, @ at the start).
function clean_(v) {
  if (v == null) return '';
  if (typeof v === 'number' || typeof v === 'boolean') return v;
  var s = String(v).slice(0, MAX_TEXT);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}
function reply_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
