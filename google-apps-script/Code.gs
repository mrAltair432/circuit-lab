const ANSWER_KEY = [1, 2, 1, 3, 0, 1, 2, 0, 0, 2];
const HEADERS = ['Submission ID', 'Received at', 'Student', 'Class', 'Correct', 'Grade', 'Result', 'Answers', 'Email status'];

function doPost(event) {
  let nonce = '';
  let result;
  try {
    const payload = JSON.parse(event.parameter.payload);
    nonce = typeof payload.nonce === 'string' ? payload.nonce : '';
    result = saveSubmission(payload);
  } catch (error) {
    console.error('Submission failed: ' + error.message);
    result = { ok: false };
  }
  const message = JSON.stringify({ type: 'circuit-lab-submission', nonce, ok: result.ok }).replace(/</g, '\\u003c');
  return HtmlService.createHtmlOutput('<!doctype html><html><body><p>Returning to Circuit Lab…</p><script>window.top.postMessage(' + message + ', "*");</script></body></html>')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function saveSubmission(payload) {
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!payload || !uuid.test(payload.id) || !uuid.test(payload.nonce) ||
      typeof payload.name !== 'string' || !payload.name.trim() || payload.name.length > 100 ||
      typeof payload.course !== 'string' || !payload.course.trim() || payload.course.length > 40 ||
      !Array.isArray(payload.answers) || payload.answers.length !== ANSWER_KEY.length ||
      payload.answers.some(answer => !Number.isInteger(answer) || answer < 0 || answer > 3)) {
    throw new Error('Invalid submission');
  }
  const properties = PropertiesService.getScriptProperties();
  const spreadsheetId = properties.getProperty('SPREADSHEET_ID');
  const recipient = properties.getProperty('NOTIFICATION_EMAIL');
  if (!spreadsheetId || !recipient) throw new Error('Missing script configuration');

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    let sheet = spreadsheet.getSheetByName('Circuit Lab Results');
    if (!sheet) {
      sheet = spreadsheet.insertSheet('Circuit Lab Results');
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
    }
    const rows = sheet.getDataRange().getValues();
    let rowIndex = rows.findIndex((row, index) => index > 0 && row[0] === payload.id) + 1;
    const correct = payload.answers.reduce((sum, answer, index) => sum + (answer === ANSWER_KEY[index] ? 1 : 0), 0);
    const grade = correct / 2;
    const safe = value => /^[\s]*[=+\-@]/.test(value.trim()) ? "'" + value.trim() : value.trim();
    const answers = payload.answers.map(value => String.fromCharCode(65 + value)).join(', ');
    if (rowIndex && (rows[rowIndex - 1][2] !== safe(payload.name) ||
        rows[rowIndex - 1][3] !== safe(payload.course) || rows[rowIndex - 1][7] !== answers)) {
      throw new Error('Submission ID already exists with different data');
    }
    if (!rowIndex) {
      rowIndex = sheet.getLastRow() + 1;
      sheet.getRange(rowIndex, 1, 1, HEADERS.length).setValues([[
        payload.id, new Date(), safe(payload.name), safe(payload.course), correct, grade,
        grade >= 3.6 ? 'Passed' : 'Not passed', answers, 'Pending'
      ]]);
      SpreadsheetApp.flush();
    }
    if (sheet.getRange(rowIndex, 9).getValue() !== 'Sent') {
      MailApp.sendEmail(recipient, 'Circuit Lab assessment result',
        'A Circuit Lab result was submitted.\n\nStudent: ' + payload.name.trim() +
        '\nClass: ' + payload.course.trim() + '\nScore: ' + correct + '/10\nGrade: ' + grade.toFixed(1) +
        '/5.0\n\nView the results: ' + spreadsheet.getUrl());
      sheet.getRange(rowIndex, 9).setValue('Sent');
      SpreadsheetApp.flush();
    }
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}
