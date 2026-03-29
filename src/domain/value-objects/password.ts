type Password = string & { readonly __brand: unique symbol };

const MIN_LENGTH = 8;

const createPassword = (raw: string): Password => {
  if (raw.length < MIN_LENGTH) {
    throw new InvalidPasswordError();
  }
  return raw as Password;
};

const isValidPassword = (raw: string): boolean => {
  return raw.length >= MIN_LENGTH;
};

class InvalidPasswordError extends Error {
  constructor() {
    super(`Password must be at least ${MIN_LENGTH} characters`);
    this.name = "InvalidPasswordError";
  }
}

export { InvalidPasswordError, createPassword, isValidPassword };
export type { Password };

