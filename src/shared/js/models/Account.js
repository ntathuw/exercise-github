/**
 * Class `Account` mô tả tài khoản đăng nhập GitDemo, liên kết 1-1 với `User`.
 *
 * Kế thừa `AAccount`: protected fields `_accountId`, `_password`, `_role`;
 * override getters/setters + 2 abstract method `isLogin()`/`login()`.
 * Fields riêng (`userId`, `lastLoginAt`) để `#private`.
 *
 * Scope hiện tại chỉ đăng nhập: xác thực password + role `user`,
 * ghi phiên vào bảng `session`. Dùng callback thay async/await.
 */
class Account extends AAccount {
  #userId;
  #lastLoginAt;

  /**
   * @param {string} accountId Mã định danh account.
   * @param {string} password Mật khẩu (plain-text).
   * @param {string} role Vai trò (role).
   * @param {object} [options] Thuộc tính bổ sung.
   * @param {string} [options.userId] Mã user liên kết.
   */
  constructor(accountId, password, role, options = {}) {
    super();

    this._accountId = accountId;
    this._password = password;
    this._role = role;
    this.#userId = options.userId ?? null;
    this.#lastLoginAt = null;
  }

  // ==================== Getters / Setters ====================

  get accountId() {
    return this._accountId;
  }

  set password(value) {
    this._password = value;
  }

  get role() {
    return this._role;
  }

  set role(value) {
    this._role = value;
  }

  /** @returns {string|null} userId liên kết. */
  get userId() {
    return this.#userId;
  }

  /** @returns {Date|null} lastLoginAt. */
  get lastLoginAt() {
    return this.#lastLoginAt;
  }

  // ==================== Abstract method overrides ====================

  /**
   * Kiểm tra account hiện tại có đang đăng nhập hay không — dựa trên
   * bảng `session` (danh sách user đang đăng nhập).
   * {@inheritdoc}
   *
   * @param {(error: Error|null, isLogin: boolean) => void} callback
   */
  isLogin(callback) {
    readRecords(TABLES.session, (error, sessions) => {
      if (error) {
        return callback(error);
      }
      callback(null, sessions.some((session) => session.accountId === this.accountId));
    });
  }

  /**
   * Đăng nhập cho account hiện tại.
   * {@inheritdoc}
   *
   * Chỉ cho phép role `user`; sai mật khẩu hoặc sai role → trả lỗi qua callback.
   * Đăng nhập thành công → ghi phiên vào bảng `session`.
   *
   * @param {string} passwordInput Mật khẩu do người dùng nhập.
   * @param {(error: Error|null, ok: boolean) => void} callback
   */
  login(passwordInput, callback) {
    if (this.role !== 'user') {
      return callback(new AuthenticationFailedException('Chỉ user mới được đăng nhập'));
    }

    if (passwordInput !== this._password) {
      return callback(new AuthenticationFailedException('Mật khẩu không đúng'));
    }

    const lastLoginAt = new Date();
    this.#saveSession(lastLoginAt, (error) => {
      if (error) {
        return callback(error);
      }
      this.#lastLoginAt = lastLoginAt;
      callback(null, true);
    });
  }

  // ==================== Private helpers ====================

  /**
   * Ghi (upsert) phiên của account hiện tại vào bảng `session`.
   *
   * @param {Date} lastLoginAt Thời điểm đăng nhập.
   * @param {(error: Error|null, ok: boolean) => void} callback
   */
  #saveSession(lastLoginAt, callback) {
    upsertRecord(
      TABLES.session,
      (session) => session.accountId === this.accountId,
      {
        accountId: this.accountId,
        userId: this.#userId,
        loginAt: lastLoginAt.toISOString(),
      },
      callback,
    );
  }
}
