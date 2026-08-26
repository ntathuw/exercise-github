/**
 * Regex username theo quy tắc GitHub:
 * gồm chữ cái, số, `-`, `_`; không bắt đầu bằng `-`/`_`.
 */
const USERNAME_REGEX = /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Class `User` mô tả một người dùng GitHub.
 *
 * Kế thừa `AUser`: protected fields `_userId`, `_accountId`, `_displayName`;
 * override getters/setters. Fields riêng để `#private`.
 */
class User extends AUser {
  #pronouns;
  #username;
  #email;
  #avatarUrl;
  #bio;
  #followersCount;
  #followingCount;
  #company;
  #location;
  #localTime;
  #timezone;
  #websiteUrl;
  #socialAccounts;

  /**
   * @param {string} userId Mã định danh duy nhất của user.
   * @param {string} accountId Mã định danh account liên kết.
   * @param {string} displayName Tên hiển thị.
   * @param {object} [options] Các thuộc tính GitHub bổ sung.
   * @param {string} [options.pronouns] Đại từ xưng hô.
   * @param {string} [options.username] Tên đăng nhập (username).
   * @param {string} [options.email] Email.
   * @param {string} [options.avatarUrl] URL ảnh đại diện.
   * @param {string} [options.bio] Tiểu sử.
   * @param {number} [options.followersCount] Số người theo dõi.
   * @param {number} [options.followingCount] Số người đang theo dõi.
   * @param {string} [options.company] Công ty.
   * @param {string} [options.location] Vị trí.
   * @param {string} [options.localTime] Giờ địa phương.
   * @param {string} [options.timezone] Múi giờ.
   * @param {string} [options.websiteUrl] URL website cá nhân.
   * @param {string[]} [options.socialAccounts] Danh sách mạng xã hội (tối đa 4).
   */
  constructor(userId, accountId, displayName, options = {}) {
    super();

    this._userId = userId;
    this._accountId = accountId;
    this._displayName = displayName;

    this.#pronouns = options.pronouns ?? null;

    if (options.username !== undefined && options.username !== null) {
      this.#username = this.#validateUsername(options.username);
    }

    if (options.email !== undefined && options.email !== null) {
      this.email = options.email;
    }

    if (options.avatarUrl !== undefined && options.avatarUrl !== null) {
      this.avatarUrl = options.avatarUrl;
    }

    this.#bio = options.bio ?? null;
    this.#followersCount = options.followersCount ?? 0;
    this.#followingCount = options.followingCount ?? 0;
    this.#company = options.company ?? null;
    this.#location = options.location ?? null;
    this.#localTime = options.localTime ?? null;
    this.#timezone = options.timezone ?? null;

    if (options.websiteUrl !== undefined && options.websiteUrl !== null) {
      this.websiteUrl = options.websiteUrl; // qua setter để validate
    }

    this.socialAccounts = options.socialAccounts ?? [];
  }

  // ==================== Getters ====================

  get userId() {
    return this._userId;
  }

  get accountId() {
    return this._accountId;
  }

  get displayName() {
    return this._displayName;
  }

  /** @returns {string|null} pronouns. */
  get pronouns() {
    return this.#pronouns;
  }

  /** @returns {string} username. */
  get username() {
    return this.#username;
  }

  /** @returns {string|null} email. */
  get email() {
    return this.#email;
  }

  /** @returns {string|null} avatarUrl. */
  get avatarUrl() {
    return this.#avatarUrl;
  }

  /** @returns {string|null} bio. */
  get bio() {
    return this.#bio;
  }

  /** @returns {number} followersCount. */
  get followersCount() {
    return this.#followersCount;
  }

  /** @returns {number} followingCount. */
  get followingCount() {
    return this.#followingCount;
  }

  /** @returns {string|null} company. */
  get company() {
    return this.#company;
  }

  /** @returns {string|null} location. */
  get location() {
    return this.#location;
  }

  /** @returns {string|null} localTime. */
  get localTime() {
    return this.#localTime;
  }

  /** @returns {string|null} timezone. */
  get timezone() {
    return this.#timezone;
  }

  /** @returns {string|null} websiteUrl. */
  get websiteUrl() {
    return this.#websiteUrl;
  }

  /** @returns {string[]} socialAccounts (tối đa 4). */
  get socialAccounts() {
    return this.#socialAccounts;
  }

  // ==================== Setters ====================

  set displayName(value) {
    this._displayName = value;
  }

  /** @param {string|null} value Đại từ xưng hô. */
  set pronouns(value) {
    this.#pronouns = value ?? null;
  }

  /** @param {string|null} value Email. */
  set email(value) {
    if (value === null || value === undefined || value === '') {
      this.#email = null;
      return;
    }
    if (typeof value !== 'string' || !EMAIL_REGEX.test(value)) {
      throw new InvalidEmailException(`Email không hợp lệ: ${value}`);
    }
    this.#email = value;
  }

  /** @param {string|null} value URL ảnh đại diện. */
  set avatarUrl(value) {
    if (value === null || value === undefined || value === '') {
      this.#avatarUrl = null;
      return;
    }
    if (typeof value !== 'string') {
      throw new InvalidUrlException(`AvatarUrl không hợp lệ: ${value}`);
    }
    this.#avatarUrl = value;
  }

  /** @param {string|null} value Tiểu sử. */
  set bio(value) {
    this.#bio = value ?? null;
  }

  /** @param {number} value Số người theo dõi. */
  set followersCount(value) {
    this.#followersCount = Number(value) || 0;
  }

  /** @param {number} value Số người đang theo dõi. */
  set followingCount(value) {
    this.#followingCount = Number(value) || 0;
  }

  /** @param {string|null} value Công ty. */
  set company(value) {
    this.#company = value ?? null;
  }

  /** @param {string|null} value Vị trí. */
  set location(value) {
    this.#location = value ?? null;
  }

  /** @param {string|null} value Giờ địa phương. */
  set localTime(value) {
    this.#localTime = value ?? null;
  }

  /** @param {string|null} value Múi giờ. */
  set timezone(value) {
    this.#timezone = value ?? null;
  }

  /** @param {string|null} value Website URL (validate nếu không null). */
  set websiteUrl(value) {
    if (value === null || value === undefined || value === '') {
      this.#websiteUrl = null;
      return;
    }

    let parsed;
    try {
      parsed = new URL(value);
    } catch {
      throw new InvalidUrlException(`WebsiteUrl không hợp lệ: ${value}`);
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new InvalidUrlException(`WebsiteUrl phải dùng http/https: ${value}`);
    }

    this.#websiteUrl = value;
  }

  /** @param {string[]} value Danh sách mạng xã hội (tối đa 4). */
  set socialAccounts(value) {
    const accounts = Array.isArray(value) ? value : [];
    if (accounts.length > 4) {
      throw new Error('SocialAccounts tối đa 4 mục');
    }
    this.#socialAccounts = accounts;
  }

  // ==================== Public methods ====================

  /**
   * Trả về object gồm các trường hiển thị lên trang profile.
   * KHÔNG lộ `accountId` (thông tin nhạy cảm).
   *
   * @returns {object} Public profile.
   */
  getPublicProfile() {
    return {
      userId: this.userId,
      displayName: this.displayName,
      pronouns: this.#pronouns,
      username: this.#username,
      email: this.#email,
      avatarUrl: this.#avatarUrl,
      bio: this.#bio,
      followersCount: this.#followersCount,
      followingCount: this.#followingCount,
      company: this.#company,
      location: this.#location,
      localTime: this.#localTime,
      timezone: this.#timezone,
      websiteUrl: this.#websiteUrl,
      socialAccounts: this.#socialAccounts,
    };
  }

  // ==================== Private helpers ====================

  /**
   * Kiểm tra username theo quy tắc GitHub.
   *
   * @param {string} value Username cần kiểm tra.
   * @returns {string} Username hợp lệ.
   * @throws {InvalidUsernameException} Nếu không hợp lệ.
   */
  #validateUsername(value) {
    if (
      typeof value !== 'string' ||
      value.length < 1 ||
      value.length > 39 ||
      !USERNAME_REGEX.test(value)
    ) {
      throw new InvalidUsernameException(`Username không hợp lệ: ${value}`);
    }
    return value;
  }
}
