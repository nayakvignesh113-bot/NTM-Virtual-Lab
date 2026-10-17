/**
 * NTM Virtual Lab — submission receiver (Google Apps Script, bound to a Google Sheet).
 * Setup: see SUBMISSIONS_SETUP.md. Each student submission is appended as one row
 * of the "Submissions" sheet; each feedback form becomes one row of the "Feedback"
 * sheet. Rows with a wrong class code go to "Rejected".
 * Certificate requests go to the "Certificates" sheet. A certificate becomes
 * available to the student only after the faculty ticks "Approved" (in the sheet,
 * or on the lab's Faculty page using the FACULTY_KEY script property).
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
  ['numWithHints', 'Numericals solved with hints'], ['explRight', 'Explainer checks right (first try)'], ['explN', 'Explainer checks'], ['explReplays', 'Explainer scene replays'],
  ['feedbackAt', 'Feedback given'], ['version', 'Lab version'], ['clientTime', 'Student clock'],
  ['reportFile', 'Full report (Drive)']
];
var FB_COLUMNS = [
  ['received', 'Received (server time)'], ['reportId', 'Report ID'], ['process', 'Process'],
  ['name', 'Name'], ['usn', 'USN'], ['section', 'Sem / section'], ['batch', 'Batch'], ['institution', 'Institution'],
  ['q1', 'Theory helped understanding (1-5)'], ['q2', 'Operating the machine helped (1-5)'],
  ['q3', 'Experiment and plots helped (1-5)'], ['q4', 'Tests at right difficulty (1-5)'],
  ['q5', 'Easy to use on device (1-5)'], ['q6', 'Would recommend (1-5)'],
  ['time', 'Time spent'], ['device', 'Device'], ['helped', 'What helped most'],
  ['confusing', 'What was confusing'], ['suggest', 'Suggestion'], ['version', 'Lab version'], ['clientTime', 'Student clock']
];
var MAX_TEXT = 5000;
var CERT_COLUMNS = [
  ['certId', 'Certificate ID'], ['requested', 'Requested'], ['name', 'Name'], ['usn', 'USN'],
  ['section', 'Sem / section'], ['process', 'Process'], ['processName', 'Process name'],
  ['postScore', 'Post-test score'], ['reportId', 'Report ID'], ['approved', 'Approved'],
  ['approvedOn', 'Approved on'], ['token', 'Access token (do not edit)']
];
var TZ = 'Asia/Kolkata';
var REPORT_FOLDER = 'NTM Virtual Lab reports';

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var d;
    try { d = JSON.parse(e.postData.contents); } catch (err) { return reply_({ ok: false, error: 'bad request' }); }
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (d.action === 'approve' || d.action === 'revoke') return facultySet_(ss, d);
    if (d.action === 'issue') return facultyIssue_(ss, d);
    if (d.action === 'subs') return subsList_(ss, d);
    if (d.action === 'report') return reportGet_(ss, d);
    var code = PropertiesService.getScriptProperties().getProperty('CLASS_CODE');
    if (code && norm_(d.classCode) !== norm_(code)) {
      var rj = ss.getSheetByName('Rejected') || ss.insertSheet('Rejected');
      if (rj.getLastRow() === 0) rj.appendRow(['Received', 'USN', 'Name', 'Process', 'Code entered']);
      rj.appendRow([new Date(), clean_(d.usn), clean_(d.name), clean_(d.process), clean_(d.classCode)]);
      return reply_({ ok: false, error: 'class code' });
    }
    if (!d.usn || !d.name) return reply_({ ok: false, error: 'name and USN required' });
    if (d.type === 'certreq') return certRequest_(ss, d);
    var isFb = d.type === 'feedback';
    var cols = isFb ? FB_COLUMNS : COLUMNS;
    var name = isFb ? 'Feedback' : 'Submissions';
    var sh = ss.getSheetByName(name) || ss.insertSheet(name);
    ensureHeader_(sh, cols);
    var fileUrl = '';
    if (!isFb && d.reportHtml) fileUrl = saveReport_(d);
    sh.appendRow(cols.map(function (c) { return c[0] === 'received' ? new Date() : c[0] === 'reportFile' ? fileUrl : clean_(d[c[0]]); }));
    return reply_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  var p = (e && e.parameter) || {};
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (p.action === 'status') return certStatus_(ss, p);
  if (p.action === 'verify') return certVerify_(ss, p);
  if (p.action === 'list') return certList_(ss, p);
  if (p.action === 'subs') return subsList_(ss, p);
  if (p.action === 'report') return reportGet_(ss, p);
  return reply_({ ok: true, service: 'NTM Virtual Lab submissions' });
}

// Writes (or completes) the header row, so columns added in later versions get their headings.
function ensureHeader_(sh, cols) {
  if (sh.getLastRow() === 0) {
    sh.appendRow(cols.map(function (c) { return c[1]; }));
    sh.setFrozenRows(1);
  } else if (sh.getRange(1, 1, 1, cols.length).getValues()[0].join('|') !== cols.map(function (c) { return c[1]; }).join('|')) {
    sh.getRange(1, 1, 1, cols.length).setValues([cols.map(function (c) { return c[1]; })]);
  }
  sh.getRange(1, 1, 1, cols.length).setFontWeight('bold');
}
// Saves the student's full report as an HTML file in Drive and returns its link.
function saveReport_(d) {
  try {
    var it = DriveApp.getFoldersByName(REPORT_FOLDER);
    var folder = it.hasNext() ? it.next() : DriveApp.createFolder(REPORT_FOLDER);
    var nm = String(d.reportId || 'report') + ' ' + norm_(d.usn) + ' ' + Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HHmm') + '.html';
    return folder.createFile(nm, String(d.reportHtml), 'text/html').getUrl();
  } catch (err) { return 'not saved: ' + err; }
}
function subRows_(ss) {
  var sh = ss.getSheetByName('Submissions'); if (!sh || sh.getLastRow() < 2) return [];
  var n = sh.getLastRow() - 1, w = COLUMNS.length;
  return sh.getRange(2, 1, n, w).getValues().map(function (r) { var o = {}; COLUMNS.forEach(function (c, i) { o[c[0]] = r[i]; }); return o; });
}

// ---------- certificates ----------
function certSheet_(ss) {
  var sh = ss.getSheetByName('Certificates') || ss.insertSheet('Certificates');
  if (sh.getLastRow() === 0) {
    sh.appendRow(CERT_COLUMNS.map(function (c) { return c[1]; }));
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, CERT_COLUMNS.length).setFontWeight('bold');
  }
  return sh;
}
function col_(key) { for (var i = 0; i < CERT_COLUMNS.length; i++) if (CERT_COLUMNS[i][0] === key) return i; return -1; }
function certRows_(sh) { var n = sh.getLastRow(); return n < 2 ? [] : sh.getRange(2, 1, n - 1, CERT_COLUMNS.length).getValues(); }
function findCert_(rows, usn, process) {
  for (var i = 0; i < rows.length; i++) if (norm_(rows[i][col_('usn')]) === norm_(usn) && norm_(rows[i][col_('process')]) === norm_(process)) return i;
  return -1;
}
function fmtDate_(v) { return v instanceof Date ? Utilities.formatDate(v, TZ, 'dd MMM yyyy') : String(v || ''); }
function certPublic_(r) {
  return { certId: r[col_('certId')], name: r[col_('name')], usn: r[col_('usn')], section: r[col_('section')], process: r[col_('process')],
    processName: r[col_('processName')], postScore: r[col_('postScore')], approvedOn: fmtDate_(r[col_('approvedOn')]) };
}
function certRequest_(ss, d) {
  if (!d.process || !d.token) return reply_({ ok: false, error: 'bad request' });
  var sh = certSheet_(ss), rows = certRows_(sh), i = findCert_(rows, d.usn, d.process);
  if (i >= 0) {
    var row = i + 2;
    ['name', 'section', 'processName', 'postScore', 'reportId', 'token'].forEach(function (k) { sh.getRange(row, col_(k) + 1).setValue(clean_(d[k])); });
    sh.getRange(row, col_('requested') + 1).setValue(new Date());
    var ok = rows[i][col_('approved')] === true;
    return reply_({ ok: true, certId: rows[i][col_('certId')], status: ok ? 'approved' : 'pending' });
  }
  var id = 'NTM-' + String(d.process).replace(/[^A-Za-z0-9]/g, '').toUpperCase() + '-' + Utilities.getUuid().slice(0, 6).toUpperCase();
  sh.appendRow(CERT_COLUMNS.map(function (c) {
    if (c[0] === 'certId') return id;
    if (c[0] === 'requested') return new Date();
    if (c[0] === 'approved') return false;
    if (c[0] === 'approvedOn') return '';
    if (c[0] === 'usn') return norm_(d.usn);
    return clean_(d[c[0]]);
  }));
  sh.getRange(sh.getLastRow(), col_('approved') + 1).insertCheckboxes();
  return reply_({ ok: true, certId: id, status: 'pending' });
}
function certStatus_(ss, p) {
  var sh = ss.getSheetByName('Certificates'); if (!sh) return reply_({ ok: true, status: 'none' });
  var rows = certRows_(sh), i = findCert_(rows, p.usn, p.process);
  if (i < 0) return reply_({ ok: true, status: 'none' });
  if (String(rows[i][col_('token')]) !== String(p.token || '')) return reply_({ ok: false, error: 'token' });
  if (rows[i][col_('approved')] !== true) return reply_({ ok: true, status: 'pending', certId: rows[i][col_('certId')] });
  return reply_({ ok: true, status: 'approved', cert: certPublic_(rows[i]) });
}
function certVerify_(ss, p) {
  var sh = ss.getSheetByName('Certificates'); var rows = sh ? certRows_(sh) : [];
  for (var i = 0; i < rows.length; i++) if (norm_(rows[i][col_('certId')]) === norm_(p.id))
    return reply_(rows[i][col_('approved')] === true ? { ok: true, valid: true, cert: certPublic_(rows[i]) } : { ok: true, valid: false, reason: 'not approved' });
  return reply_({ ok: true, valid: false, reason: 'not found' });
}
function facultyOk_(key) {
  var k = PropertiesService.getScriptProperties().getProperty('FACULTY_KEY');
  return !!k && String(key || '') === k;
}
function certList_(ss, p) {
  if (!facultyOk_(p.key)) return reply_({ ok: false, error: 'faculty key' });
  var sh = ss.getSheetByName('Certificates'); var rows = sh ? certRows_(sh) : [];
  return reply_({ ok: true, rows: rows.map(function (r) {
    var o = certPublic_(r); o.requested = fmtDate_(r[col_('requested')]); o.reportId = r[col_('reportId')]; o.approved = r[col_('approved')] === true; return o; }) });
}
function facultySet_(ss, d) {
  if (!facultyOk_(d.key)) return reply_({ ok: false, error: 'faculty key' });
  var sh = ss.getSheetByName('Certificates'); var rows = sh ? certRows_(sh) : [];
  var ids = [].concat(d.certIds || d.certId || []).map(norm_), n = 0;
  for (var i = 0; i < rows.length; i++) if (ids.indexOf(norm_(rows[i][col_('certId')])) >= 0) {
    var on = d.action === 'approve';
    sh.getRange(i + 2, col_('approved') + 1).setValue(on);
    sh.getRange(i + 2, col_('approvedOn') + 1).setValue(on ? new Date() : '');
    n++;
  }
  return reply_({ ok: true, changed: n });
}
// Faculty: list submissions (latest per student and process) with report and certificate status.
function subsList_(ss, p) {
  if (!facultyOk_(p.key)) return reply_({ ok: false, error: 'faculty key' });
  var subs = subRows_(ss), sh = ss.getSheetByName('Certificates'), certs = sh ? certRows_(sh) : [], latest = {};
  subs.forEach(function (o) { latest[norm_(o.usn) + '|' + norm_(o.process)] = o; });
  var out = Object.keys(latest).map(function (k) {
    var o = latest[k], i = findCert_(certs, o.usn, o.process);
    return { received: fmtDate_(o.received), reportId: o.reportId, process: o.process, name: o.name, usn: o.usn, section: o.section,
      post: o.postN ? o.postNow + '/' + o.postN : '', hasReport: /^https:/.test(String(o.reportFile || '')),
      cert: i < 0 ? 'none' : (certs[i][col_('approved')] === true ? 'approved' : 'pending'), certId: i < 0 ? '' : certs[i][col_('certId')] };
  });
  return reply_({ ok: true, rows: out });
}
// Faculty: fetch one stored report.
function reportGet_(ss, p) {
  if (!facultyOk_(p.key)) return reply_({ ok: false, error: 'faculty key' });
  var subs = subRows_(ss), hit = null;
  subs.forEach(function (o) { if (String(o.reportId) === String(p.reportId) && /^https:/.test(String(o.reportFile || ''))) hit = o; });
  if (!hit) return reply_({ ok: false, error: 'no report' });
  var id = (String(hit.reportFile).match(/[-\w]{25,}/) || [])[0];
  try { return reply_({ ok: true, html: DriveApp.getFileById(id).getBlob().getDataAsString() }); }
  catch (err) { return reply_({ ok: false, error: 'report file missing' }); }
}
// Faculty: issue an approved certificate for a submission that has no request.
function facultyIssue_(ss, d) {
  if (!facultyOk_(d.key)) return reply_({ ok: false, error: 'faculty key' });
  var subs = subRows_(ss), o = null;
  subs.forEach(function (x) { if (norm_(x.usn) === norm_(d.usn) && norm_(x.process) === norm_(d.process)) o = x; });
  if (!o) return reply_({ ok: false, error: 'no submission' });
  var sh = certSheet_(ss), rows = certRows_(sh), i = findCert_(rows, o.usn, o.process);
  if (i >= 0) {
    sh.getRange(i + 2, col_('approved') + 1).setValue(true);
    sh.getRange(i + 2, col_('approvedOn') + 1).setValue(new Date());
    return reply_({ ok: true, certId: rows[i][col_('certId')] });
  }
  var pct = o.postN ? Math.round(o.postNow / o.postN * 100) : 0;
  var id = 'NTM-' + String(o.process).replace(/[^A-Za-z0-9]/g, '').toUpperCase() + '-' + Utilities.getUuid().slice(0, 6).toUpperCase();
  var v = { certId: id, requested: new Date(), name: clean_(o.name), usn: norm_(o.usn), section: clean_(o.section), process: clean_(o.process),
    processName: clean_(d.processName || o.process), postScore: o.postN ? o.postNow + '/' + o.postN + ' (' + pct + ' %)' : '', reportId: clean_(o.reportId),
    approved: true, approvedOn: new Date(), token: '' };
  sh.appendRow(CERT_COLUMNS.map(function (c) { return v[c[0]]; }));
  var r = sh.getLastRow();
  sh.getRange(r, col_('approved') + 1).insertCheckboxes();
  sh.getRange(r, col_('approved') + 1).setValue(true);
  return reply_({ ok: true, certId: id });
}
// Ticking or unticking "Approved" directly in the sheet records the approval date.
function onEdit(e) {
  var sh = e.range.getSheet();
  if (sh.getName() !== 'Certificates' || e.range.getRow() < 2 || e.range.getColumn() !== col_('approved') + 1) return;
  sh.getRange(e.range.getRow(), col_('approvedOn') + 1).setValue(e.range.getValue() === true ? new Date() : '');
}

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
