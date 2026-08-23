// Script điều khiển form đăng nhập trên `login.html`.
// Dùng callback: đọc user/account từ file bằng `XMLHttpRequest`,
// xác thực qua `authService.login`, session lưu localStorage.

const form = document.querySelector('.login-form');
const usernameInput = document.getElementById('login-username');
const passwordInput = document.getElementById('login-password');
const submitButton = document.querySelector('.login-form__submit');

// Khu vực hiển thị lỗi (tự tạo nếu DOM chưa có).
let errorBox = document.querySelector('.login-form__error');
if (!errorBox) {
  errorBox = document.createElement('p');
  errorBox.className = 'login-form__error';
  errorBox.hidden = true;
  form.appendChild(errorBox);
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.hidden = false;
}

function clearError() {
  errorBox.textContent = '';
  errorBox.hidden = true;
}

function parseRecords(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const record = JSON.parse(line);
      if (typeof record !== 'object' || record === null || Array.isArray(record)) {
        throw new Error('Record không phải object');
      }
      return record;
    });
}

const FILES = [
  { url: '../js/data/user.txt', table: TABLES.user },
  { url: '../js/data/account.txt', table: TABLES.account },
];

function readText(url, callback) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.timeout = 10000;

  xhr.onload = () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      callback(null, xhr.responseText);
    } else {
      callback(new Error(`Không đọc được ${url} (status ${xhr.status})`));
    }
  };
  xhr.onerror = () => callback(new Error(`Không đọc được ${url}`));
  xhr.ontimeout = () => callback(new Error(`Đọc ${url} quá thời gian chờ`));
  xhr.send();
}

function loadDataFiles(callback) {
  let remaining = FILES.length;
  let failed = false;

  const done = (error) => {
    if (failed) {
      return;
    }
    if (error) {
      failed = true;
      callback(error);
      return;
    }
    remaining -= 1;
    if (remaining === 0) {
      callback(null);
    }
  };

  FILES.forEach((file) => {
    readText(file.url, (error, text) => {
      if (error) {
        done(error);
        return;
      }

      let records;
      try {
        records = parseRecords(text);
      } catch (parseError) {
        done(new Error(`File ${file.url} không đúng định dạng JSON Lines`));
        return;
      }

      if (records.length === 0) {
        done(new Error(`File ${file.url} rỗng`));
        return;
      }

      loadRecords(file.table, records, done);
    });
  });
}

let loading = false;

form.addEventListener('submit', (event) => {
  event.preventDefault();
  clearError();

  if (loading) {
    return;
  }

  const identifier = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!identifier || !password) {
    showError('Vui lòng nhập username/email và mật khẩu.');
    return;
  }

  loading = true;
  submitButton.disabled = true;

  loadDataFiles((error) => {
    if (error) {
      loading = false;
      submitButton.disabled = false;
      showError(error.message);
      return;
    }

    authService.login(identifier, password, (error, ok) => {
      loading = false;
      submitButton.disabled = false;

      if (error) {
        showError(error.message || 'Đăng nhập thất bại.');
        return;
      }

      if (ok) {
        readRecords(TABLES.user, (error, users) => {
          if (error) {
            showError(error.message);
            return;
          }

          const userRecord = users.find(
            (record) => record.username === identifier || record.email === identifier,
          );

          if (userRecord) {
            localStorage.setItem('currentUser', JSON.stringify(userRecord));
          }

          window.location.href = 'profile.html';
        });
      }
    });
  });
});
