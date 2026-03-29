type DisplayName = string & { readonly __brand: unique symbol };

const MIN_LENGTH = 2;

const createDisplayName = (raw: string): DisplayName => {
  const trimmed = raw.trim();
  if (trimmed.length < MIN_LENGTH) {
    throw new InvalidDisplayNameError(raw);
  }
  return trimmed as DisplayName;
};

const isValidDisplayName = (raw: string): boolean => {
  return raw.trim().length >= MIN_LENGTH;
};

class InvalidDisplayNameError extends Error {
  constructor(name: string) {
    super(`Display name must be at least ${MIN_LENGTH} characters: "${name}"`);
    this.name = "InvalidDisplayNameError";
  }
}

export { InvalidDisplayNameError, createDisplayName, isValidDisplayName };
export type { DisplayName };

