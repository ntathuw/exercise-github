// Kho dữ liệu: user/account đọc từ file (nạp qua `loadRecords`),
// session lưu `localStorage` (đọc/ghi).

const TABLES = Object.freeze({
  account: 'account',
  user: 'user',
  session: 'session',
});

const store = {
  account: [],
  user: [],
};

const SESSION_KEY = 'session';

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
      return [];
    }
    const records = JSON.parse(raw);
    return Array.isArray(records) ? records : [];
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return [];
  }
}

function writeSession(records) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(records));
    return null;
  } catch (error) {
    return error;
  }
}

/**
 * Nạp records (đã parse từ file) vào một bảng.
 *
 * @param {string} table Tên bảng (dùng `TABLES`).
 * @param {object[]} records Danh sách records.
 * @param {(error: Error|null) => void} callback
 */
function loadRecords(table, records, callback) {
  if (table === TABLES.session) {
    callback(writeSession(records));
    return;
  }
  if (!store[table]) {
    return callback(new Error(`Bảng "${table}" không tồn tại`));
  }
  store[table] = records;
  callback(null);
}

/**
 * Đọc toàn bộ records của một bảng (trả bản sao).
 *
 * @param {string} table Tên bảng (dùng `TABLES`).
 * @param {(error: Error|null, records: object[]) => void} callback
 */
function readRecords(table, callback) {
  if (table === TABLES.session) {
    callback(null, readSession());
    return;
  }
  const records = store[table];
  if (!records) {
    return callback(new Error(`Bảng "${table}" không tồn tại`));
  }
  callback(null, [...records]);
}

/**
 * Ghi (upsert) một record: thay thế nếu khớp `matchFn`, ngược lại thêm vào cuối.
 *
 * @param {string} table Tên bảng (dùng `TABLES`).
 * @param {(record: object) => boolean} matchFn Hàm xác định record cần thay thế.
 * @param {object} record Record mới.
 * @param {(error: Error|null, records: object[]) => void} callback
 */
function upsertRecord(table, matchFn, record, callback) {
  let records;
  if (table === TABLES.session) {
    records = readSession();
  } else {
    records = store[table];
    if (!records) {
      return callback(new Error(`Bảng "${table}" không tồn tại`));
    }
  }

  const index = records.findIndex(matchFn);
  if (index === -1) {
    records.push(record);
  } else {
    records[index] = record;
  }

  if (table === TABLES.session) {
    const error = writeSession(records);
    if (error) {
      return callback(error);
    }
  }

  callback(null, records);
}
