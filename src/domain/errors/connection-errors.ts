class ConnectionAlreadyExistsError extends Error {
  constructor() {
    super("A connection already exists with this user");
    this.name = "ConnectionAlreadyExistsError";
  }
}

class ConnectionNotFoundError extends Error {
  constructor(userId: string) {
    super(`Connection not found for user: ${userId}`);
    this.name = "ConnectionNotFoundError";
  }
}

class ConnectionBlockedError extends Error {
  constructor() {
    super("Cannot connect with this user");
    this.name = "ConnectionBlockedError";
  }
}

class SelfConnectionError extends Error {
  constructor() {
    super("Cannot send a connection request to yourself");
    this.name = "SelfConnectionError";
  }
}

export {
    ConnectionAlreadyExistsError,
    ConnectionBlockedError,
    ConnectionNotFoundError,
    SelfConnectionError
};

