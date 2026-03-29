type Email = string & { readonly __brand: unique symbol };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createEmail = (raw: string): Email => {
  const trimmed = raw.trim().toLowerCase();
  if (!EMAIL_REGEX.test(trimmed)) {
    throw new InvalidEmailError(raw);
  }
  return trimmed as Email;
};

const isValidEmail = (raw: string): boolean => {
  return EMAIL_REGEX.test(raw.trim().toLowerCase());
};

class InvalidEmailError extends Error {
  constructor(email: string) {
    super(`Invalid email: ${email}`);
    this.name = "InvalidEmailError";
  }
}

export { InvalidEmailError, createEmail, isValidEmail };
export type { Email };

