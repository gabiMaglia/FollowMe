type DateOfBirth = string & { readonly __brand: unique symbol };

const createDateOfBirth = (raw: string): DateOfBirth => {
  const date = new Date(raw);
  if (isNaN(date.getTime())) {
    throw new InvalidDateOfBirthError("Invalid date format");
  }
  if (date >= new Date()) {
    throw new InvalidDateOfBirthError("Date of birth must be in the past");
  }
  const iso = date.toISOString().split("T")[0];
  return iso as DateOfBirth;
};

const isValidDateOfBirth = (raw: string): boolean => {
  const date = new Date(raw);
  return !isNaN(date.getTime()) && date < new Date();
};

class InvalidDateOfBirthError extends Error {
  constructor(reason: string) {
    super(`Invalid date of birth: ${reason}`);
    this.name = "InvalidDateOfBirthError";
  }
}

export { InvalidDateOfBirthError, createDateOfBirth, isValidDateOfBirth };
export type { DateOfBirth };

