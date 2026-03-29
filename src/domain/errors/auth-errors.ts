class AuthenticationError extends Error {
  constructor(message = "Invalid credentials") {
    super(message);
    this.name = "AuthenticationError";
  }
}

class EmailAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`Email already registered: ${email}`);
    this.name = "EmailAlreadyExistsError";
  }
}

class TokenExpiredError extends Error {
  constructor() {
    super("Session expired. Please sign in again.");
    this.name = "TokenExpiredError";
  }
}

class OnboardingAlreadyCompletedError extends Error {
  constructor() {
    super("Onboarding has already been completed");
    this.name = "OnboardingAlreadyCompletedError";
  }
}

class OnboardingNotCompletedError extends Error {
  constructor() {
    super("Onboarding not completed");
    this.name = "OnboardingNotCompletedError";
  }
}

class NetworkError extends Error {
  constructor(message = "Network error. Please check your connection.") {
    super(message);
    this.name = "NetworkError";
  }
}

export {
    AuthenticationError,
    EmailAlreadyExistsError, NetworkError, OnboardingAlreadyCompletedError,
    OnboardingNotCompletedError, TokenExpiredError
};

