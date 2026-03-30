const ConnectionStatus = {
  Pending: "PENDING",
  Accepted: "ACCEPTED",
  Blocked: "BLOCKED",
} as const;

type ConnectionStatus =
  (typeof ConnectionStatus)[keyof typeof ConnectionStatus];

const ConnectionSearchStatus = {
  None: "NONE",
  PendingSent: "PENDING_SENT",
  PendingReceived: "PENDING_RECEIVED",
  Connected: "CONNECTED",
  Blocked: "BLOCKED",
} as const;

type ConnectionSearchStatus =
  (typeof ConnectionSearchStatus)[keyof typeof ConnectionSearchStatus];

type Connection = {
  sourceUserId: string;
  targetUserId: string;
  status: ConnectionStatus;
  isLocationShared: boolean;
  isVisible: boolean;
  notificationsEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

type Contact = {
  userId: string;
  isLocationShared: boolean;
  theyShareLocation: boolean;
  isVisible: boolean;
  notificationsEnabled: boolean;
  connectedAt: string;
};

type PendingRequest = {
  fromUserId: string;
  createdAt: string;
};

type SearchResult = {
  userId: string;
  displayName: string;
  name: string;
  avatarUrl: string | null;
  distanceKm: number | null;
  age: number | null;
  connectionStatus: ConnectionSearchStatus;
};

type PaginatedSearchResult = {
  data: SearchResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export { ConnectionSearchStatus, ConnectionStatus };
export type {
    Connection,
    Contact,
    PaginatedSearchResult,
    PendingRequest,
    SearchResult
};

