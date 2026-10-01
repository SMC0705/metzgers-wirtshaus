/**
 * Metzgers Wirtshaus Abende – Zusagen
 * In eine Google-Tabelle einfügen: Erweiterungen → Apps Script → alles ersetzen → Speichern.
 * Dann: Bereitstellen → Neue Bereitstellung → Typ „Web-App“
 *       Ausführen als: Ich   ·   Zugriff: Jeder   → Bereitstellen → URL kopieren.
 */
const BLATT = "Zusagen";

function blatt_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(BLATT);
  if (!sh) { sh = ss.insertSheet(BLATT); sh.appendRow(["Abend", "Name", "Status", "Zeit"]); }
  return sh;
}
function antwort_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
function liste_() {
  return blatt_().getDataRange().getValues().slice(1)
    .filter(r => r[0] && r[1])
    .map(r => ({ abend: String(r[0]), name: String(r[1]).replace(/^'/, ""), status: String(r[2]) }));
}
function doGet() {
  return antwort_({ ok: true, zusagen: liste_() });
}
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents || "{}");
    const abend = String(d.abend || "").slice(0, 40);
    let name = String(d.name || "").trim().replace(/\s+/g, " ").slice(0, 30);
    const status = ["ja", "nein", "weg"].indexOf(d.status) >= 0 ? d.status : null;
    if (!abend || name.length < 2 || !status) return antwort_({ ok: false });
    if (/^[=+\-@]/.test(name)) name = "'" + name;   // keine Formeln in der Tabelle
    const sh = blatt_();
    const werte = sh.getDataRange().getValues();
    let zeile = -1;
    for (let i = 1; i < werte.length; i++) {
      if (String(werte[i][0]) === abend &&
          String(werte[i][1]).replace(/^'/, "").toLowerCase() === name.replace(/^'/, "").toLowerCase()) { zeile = i + 1; break; }
    }
    if (status === "weg") { if (zeile > 0) sh.deleteRow(zeile); }
    else if (zeile > 0) sh.getRange(zeile, 3, 1, 2).setValues([[status, new Date()]]);
    else sh.appendRow([abend, name, status, new Date()]);
    return antwort_({ ok: true, zusagen: liste_() });
  } finally {
    lock.releaseLock();
  }
}
