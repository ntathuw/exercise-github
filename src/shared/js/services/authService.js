/**
 * Service xử lý đăng nhập (thuần logic, không phụ thuộc DOM/HTML).
 *
 * Luồng: nhận `identifier` (username hoặc email) + `password`,
 * tra bảng `user` → tìm account tương ứng trong bảng `account`
 * → gọi `account.login(password)`. Dùng callback thay async/await.
 */
const authService = {
  /**
   * Đăng nhập bằng username hoặc email kèm password.
   *
   * @param {string} identifier username hoặc email.
   * @param {string} password Mật khẩu.
   * @param {(error: Error|null, ok: boolean) => void} callback
   *   `ok` là `true` khi đăng nhập thành công; `error` chứa lý do khi thất bại.
   */
  login(identifier, password, callback) {
    readRecords(TABLES.user, (error, users) => {
      if (error) {
        return callback(error);
      }

      const userRecord = users.find(
        (record) => record.username === identifier || record.email === identifier,
      );

      if (!userRecord) {
        return callback(new AuthenticationFailedException('Sai username/email hoặc mật khẩu'));
      }

      readRecords(TABLES.account, (error, accounts) => {
        if (error) {
          return callback(error);
        }

        const accountRecord = accounts.find(
          (record) => record.accountId === userRecord.accountId,
        );

        if (!accountRecord) {
          return callback(new AuthenticationFailedException('Sai username/email hoặc mật khẩu'));
        }

        const account = new Account(
          accountRecord.accountId,
          accountRecord.password,
          accountRecord.role,
          { userId: accountRecord.userId },
        );

        account.login(password, (error, ok) => {
          if (error) {
            return callback(error);
          }
          callback(null, ok);
        });
      });
    });
  },
};
