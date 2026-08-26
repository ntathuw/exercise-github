class AUser {
  _userId;
  _accountId;
  _displayName;

  constructor() {
    if (new.target === AUser) {
      throw new TypeError('AUser is an abstract class and cannot be instantiated directly.');
    }
  }

  get userId() {
    throw new Error('userId is an abstract getter and must be implemented by a subclass.');
  }

  get accountId() {
    throw new Error('accountId is an abstract getter and must be implemented by a subclass.');
  }

  get displayName() {
    throw new Error('displayName is an abstract getter and must be implemented by a subclass.');
  }

  set displayName(value) {
    throw new Error('displayName is an abstract setter and must be implemented by a subclass.');
  }
}
