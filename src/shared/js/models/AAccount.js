class AAccount {
  _accountId;
  _password;
  _role;

  constructor() {
    if (new.target === AAccount) {
      throw new TypeError('AAccount is an abstract class and cannot be instantiated directly.');
    }
  }

  get accountId() {
    throw new Error('accountId is an abstract getter and must be implemented by a subclass.');
  }

  set password(value) {
    throw new Error('password is an abstract setter and must be implemented by a subclass.');
  }

  get role() {
    throw new Error('role is an abstract getter and must be implemented by a subclass.');
  }

  set role(value) {
    throw new Error('role is an abstract setter and must be implemented by a subclass.');
  }

  isLogin() {
    throw new Error('isLogin() is an abstract method and must be implemented by a subclass.');
  }

  login() {
    throw new Error('login() is an abstract method and must be implemented by a subclass.');
  }
}
