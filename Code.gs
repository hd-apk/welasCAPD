/**
 * WELAS CAPD - Backend Google Apps Script
 * Menyimpan data ke Google Sheet (dibuat otomatis) dan foto ke folder Google Drive (dibuat otomatis).
 *
 * LANGKAH: 1) Ganti TOKEN di bawah  2) Simpan  3) Deploy > Aplikasi web (Akses: Siapa saja)
 *          4) Jalankan fungsi buatLinkAktivasi() untuk mendapat link aktivasi.
 */
const TOKEN = 'GANTI_DENGAN_TOKEN_RAHASIA';            // minimal 16 karakter acak, JANGAN dibagikan umum
const APP_URL = 'https://USERNAME.github.io/NAMA-REPO/'; // isi setelah GitHub Pages aktif
const WEBAPP_URL = '';                                  // tempel URL "/exec" hasil deploy (disarankan)

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
function tokenOk_(t) {
  return TOKEN.length >= 16 && TOKEN !== 'GANTI_DENGAN_TOKEN_RAHASIA' && t === TOKEN;
}

function sheet_() {
  const p = PropertiesService.getScriptProperties();
  let ss = null, id = p.getProperty('SSID');
  if (id) { try { ss = SpreadsheetApp.openById(id); } catch (e) {} }
  if (!ss) {
    ss = SpreadsheetApp.create('WELAS CAPD - Data');
    p.setProperty('SSID', ss.getId());
  }
  let sh = ss.getSheetByName('data');
  if (!sh) {
    sh = ss.getSheets()[0].setName('data');
    sh.getRange('A:E').setNumberFormat('@');
    sh.getRange(1, 1, 1, 5).setValues([['key', 'v1', 'v2', 'v3', 'v4']]);
  }
  return sh;
}

function folder_() {
  const p = PropertiesService.getScriptProperties();
  let f = null, id = p.getProperty('FID');
  if (id) { try { f = DriveApp.getFolderById(id); } catch (e) {} }
  if (!f) { f = DriveApp.createFolder('WELAS CAPD - Foto'); p.setProperty('FID', f.getId()); }
  return f;
}

// Satu sel Sheet maks 50.000 karakter, jadi nilai panjang dipecah ke kolom v1..v4.
function split_(v) {
  const out = ['', '', '', ''];
  for (let i = 0; i < 4; i++) out[i] = v.substr(i * 45000, 45000);
  return out;
}

function doGet(e) {
  if (!tokenOk_(e.parameter.t)) return json_({ error: 'token' });
  const sh = sheet_(), n = sh.getLastRow();
  const out = {};
  if (n > 1) {
    sh.getRange(2, 1, n - 1, 5).getValues().forEach(r => {
      if (r[0]) out[r[0]] = r.slice(1).join('');
    });
  }
  return json_(out);
}

function doPost(e) {
  let b;
  try { b = JSON.parse(e.postData.contents); } catch (x) { return json_({ error: 'format' }); }
  if (!tokenOk_(b.t)) return json_({ error: 'token' });

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    if (b.foto) {
      const m = String(b.foto.d).match(/^data:(.+?);base64,(.+)$/);
      if (!m) return json_({ error: 'foto' });
      const name = String(b.foto.n).replace(/[^\w.\-]/g, '_');
      const fo = folder_(), old = fo.getFilesByName(name);
      while (old.hasNext()) old.next().setTrashed(true);
      const file = fo.createFile(Utilities.newBlob(Utilities.base64Decode(m[2]), m[1], name));
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      return json_({ id: file.getId() });
    }
    if (b.items) {
      const sh = sheet_(), n = sh.getLastRow(), idx = {};
      if (n > 1) sh.getRange(2, 1, n - 1, 1).getValues().forEach((r, i) => idx[r[0]] = i + 2);
      const add = [];
      b.items.forEach(it => {
        const row = [String(it.k)].concat(split_(String(it.v)));
        if (idx[it.k]) sh.getRange(idx[it.k], 1, 1, 5).setValues([row]);
        else add.push(row);
      });
      if (add.length) sh.getRange(sh.getLastRow() + 1, 1, add.length, 5).setValues(add);
      return json_({ ok: 1, n: b.items.length });
    }
    return json_({ error: 'kosong' });
  } finally {
    lock.releaseLock();
  }
}

/** Jalankan SEKALI dari editor (setelah deploy) lalu buka Log eksekusi: berisi link aktivasi untuk HP. */
function buatLinkAktivasi() {
  const url = WEBAPP_URL || ScriptApp.getService().getUrl();
  const o = JSON.stringify({ a: url, t: TOKEN });
  const k = Utilities.base64Encode(Utilities.newBlob(o).getBytes());
  Logger.log('LINK AKTIVASI (kirim pribadi ke pengguna, jangan diposting publik):\n' + APP_URL + '#k=' + k);
}

/** Jalankan SEKALI untuk memberi izin akses Sheet & Drive. */
function izinkanAkses() {
  sheet_(); folder_();
  Logger.log('Izin OK. Sheet dan folder foto sudah dibuat di Google Drive Anda.');
}
