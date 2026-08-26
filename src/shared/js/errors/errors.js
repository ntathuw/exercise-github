/**
 * Các exception dùng chung cho domain (User, Account).
 * Mỗi exception kế thừa `Error` và có thêm `code`, `statusCode`.
 */

/** Exception cơ sở cho domain — không dùng trực tiếp. */
class DomainError extends Error {
  /**
   * @param {string} message Thông điệp lỗi.
   * @param {string} code Mã lỗi ngắn gọn, ổn định.
   * @param {number} statusCode Mã trạng thái HTTP tương ứng.
   */
  constructor(message, code, statusCode) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
  }
}

/** Ném khi username không hợp lệ (quy tắc GitHub). */
class InvalidUsernameException extends DomainError {
  constructor(message = 'Username không hợp lệ') {
    super(message, 'INVALID_USERNAME', 400);
  }
}

/** Ném khi email không đúng định dạng. */
class InvalidEmailException extends DomainError {
  constructor(message = 'Email không hợp lệ') {
    super(message, 'INVALID_EMAIL', 400);
  }
}

/** Ném khi URL không hợp lệ. */
class InvalidUrlException extends DomainError {
  constructor(message = 'URL không hợp lệ') {
    super(message, 'INVALID_URL', 400);
  }
}

/** Ném khi xác thực đăng nhập thất bại. */
class AuthenticationFailedException extends DomainError {
  constructor(message = 'Xác thực thất bại') {
    super(message, 'AUTHENTICATION_FAILED', 401);
  }
}

/** Ném khi không tìm thấy user. */
class UserNotFoundException extends DomainError {
  constructor(message = 'Không tìm thấy user') {
    super(message, 'USER_NOT_FOUND', 404);
  }
}
