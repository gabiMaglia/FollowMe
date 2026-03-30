# FollowMe API — Guía de Endpoints para Frontend

**Base URL**: `http://<host>:<port>/api/v1`  
**Swagger UI**: `http://<host>:<port>/docs`  
**Autenticación**: Bearer Token JWT en header `Authorization: Bearer {accessToken}`

---

## Índice

1. [Auth](#1-auth)
2. [Users](#2-users)
3. [Contacts](#3-contacts)
4. [Saved Locations](#4-saved-locations)
5. [Location Tracks](#5-location-tracks)
6. [Realtime Location](#6-realtime-location)
7. [Groups](#7-groups)
8. [WebSocket — Location en Tiempo Real](#8-websocket--location-en-tiempo-real)
9. [Notas Generales](#notas-generales)

---

## 1. Auth

Base path: `/auth`  
**Ningún endpoint de auth requiere JWT** (excepto `logout-all`).

### 1.1 Registro

```
POST /auth/register
```

| Campo         | Tipo     | Validación       | Requerido |
| ------------- | -------- | ---------------- | --------- |
| `email`       | `string` | Email válido     | ✅        |
| `displayName` | `string` | Min 2 caracteres | ✅        |
| `password`    | `string` | Min 8 caracteres | ✅        |

**Response** `201`

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "John"
  }
}
```

---

### 1.2 Login

```
POST /auth/login
```

| Campo      | Tipo     | Validación   | Requerido |
| ---------- | -------- | ------------ | --------- |
| `email`    | `string` | Email válido | ✅        |
| `password` | `string` | String       | ✅        |

**Response** `200` → `AuthResponseDto`

```json
{
  "accessToken": "jwt...",
  "refreshToken": "uuid-token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "John",
    "onboardingCompleted": false
  }
}
```

---

### 1.3 Refresh Token

```
POST /auth/refresh
```

| Campo          | Tipo     | Requerido |
| -------------- | -------- | --------- |
| `refreshToken` | `string` | ✅        |

**Response** `200`

```json
{
  "accessToken": "new-jwt...",
  "refreshToken": "new-refresh-token"
}
```

> ⚠️ El refresh token anterior se invalida (rotación). Si se reutiliza un token ya rotado, se invalidan TODOS los tokens del usuario (protección contra replay).

---

### 1.4 Logout

```
POST /auth/logout
```

| Campo          | Tipo     | Requerido |
| -------------- | -------- | --------- |
| `refreshToken` | `string` | ✅        |

**Response** `200`

```json
{ "message": "Logged out successfully" }
```

---

### 1.5 Logout de todas las sesiones

```
POST /auth/logout-all
```

🔒 **Requiere JWT**

**Body**: ninguno

**Response** `200`

```json
{ "message": "All sessions revoked" }
```

---

### 1.6 Google OAuth — Mobile (idToken)

```
POST /auth/google
```

| Campo     | Tipo     | Requerido |
| --------- | -------- | --------- |
| `idToken` | `string` | ✅        |

**Response** `200` → `AuthResponseDto` (mismo formato que login)

---

### 1.7 Google OAuth — Web (redirect flow)

```
GET /auth/google/redirect
```

Redirige al consent screen de Google. No se llama desde la app mobile.

```
GET /auth/google/callback
```

Callback de Google → **Response** `200` → `AuthResponseDto`

---

## 2. Users

Base path: `/users`  
🔒 **Todos los endpoints requieren JWT**

### 2.1 Completar Onboarding

```
POST /users/onboarding
```

| Campo         | Tipo     | Validación              | Requerido |
| ------------- | -------- | ----------------------- | --------- |
| `dateOfBirth` | `string` | ISO 8601 (`YYYY-MM-DD`) | ✅        |

**Response** `200`

```json
{
  "message": "Onboarding completed",
  "onboardingCompleted": true,
  "isMinor": false
}
```

> Si `isMinor: true` (< 16 años), se aplican restricciones de control parental.

---

### 2.2 Buscar Usuarios

```
GET /users/search
```

| Query Param           | Tipo      | Validación       | Default | Requerido |
| --------------------- | --------- | ---------------- | ------- | --------- |
| `q`                   | `string`  | Min 2 caracteres | —       | ❌        |
| `minAge`              | `number`  | Entero, min 1    | —       | ❌        |
| `maxAge`              | `number`  | Entero, max 120  | —       | ❌        |
| `latitude`            | `number`  | -90 a 90         | —       | ❌        |
| `longitude`           | `number`  | -180 a 180       | —       | ❌        |
| `maxDistanceKm`       | `number`  | 0.1 a 500        | `10`    | ❌        |
| `onboardingCompleted` | `boolean` | —                | `true`  | ❌        |
| `page`                | `number`  | Entero, min 1    | `1`     | ❌        |
| `limit`               | `number`  | Entero, 1-100    | `20`    | ❌        |

> Para búsqueda por proximidad, enviar `latitude` + `longitude` juntos.

**Response** `200` → `PaginatedSearchResultDto`

```json
{
  "data": [
    {
      "userId": "uuid",
      "displayName": "John Doe",
      "name": "John",
      "avatarUrl": "https://...",
      "distanceKm": 2.5,
      "age": 25,
      "connectionStatus": "NONE"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

**Valores de `connectionStatus`**:

| Valor              | Significado                                 |
| ------------------ | ------------------------------------------- |
| `NONE`             | Sin relación                                |
| `PENDING_SENT`     | Tú enviaste solicitud, esperando respuesta  |
| `PENDING_RECEIVED` | Te enviaron solicitud, pendiente de aceptar |
| `CONNECTED`        | Son contactos mutuos                        |
| `BLOCKED`          | Bloqueado                                   |

> Usuarios con `isDiscoverable: false` NO aparecen en esta búsqueda.

---

### 2.3 Toggle Descubrimiento

```
PATCH /users/discoverability
```

| Campo            | Tipo      | Requerido |
| ---------------- | --------- | --------- |
| `isDiscoverable` | `boolean` | ✅        |

**Response** `200`

```json
{ "isDiscoverable": false }
```

---

## 3. Contacts

Base path: `/contacts`  
🔒 **Todos los endpoints requieren JWT**

### Modelo de Datos — Directed Edge (Arista Dirigida)

La relación entre contactos se modela como **aristas dirigidas** en la tabla `user_connections`. Cada arista tiene un `sourceUserId` (quien la creó) y un `targetUserId` (hacia quién apunta).

Cuando dos usuarios son contactos mutuos, existen **2 filas**:

- `A → B` (arista de A hacia B)
- `B → A` (arista de B hacia A)

Cada usuario controla **su propia arista** de forma independiente.

### Interfaces TypeScript para el Frontend

```typescript
// ── Enums ──

enum ConnectionStatus {
  PENDING = "PENDING", // Solicitud enviada, esperando respuesta
  ACCEPTED = "ACCEPTED", // Contacto mutuo aceptado
  BLOCKED = "BLOCKED", // Usuario bloqueado
}

// En búsqueda de usuarios, el status se resuelve así:
type ConnectionSearchStatus =
  | "NONE" // Sin relación
  | "PENDING_SENT" // Yo envié solicitud, esperando su respuesta
  | "PENDING_RECEIVED" // Ellos me enviaron solicitud, debo aceptar/rechazar
  | "CONNECTED" // Somos contactos mutuos
  | "BLOCKED"; // Bloqueado (por mí o por ellos)

// ── DTOs de Response ──

interface ConnectionResponseDto {
  sourceUserId: string; // Quién creó la arista
  targetUserId: string; // Hacia quién apunta
  status: "PENDING" | "ACCEPTED" | "BLOCKED";
  isLocationShared: boolean; // ¿Comparto mi ubicación con este contacto?
  isVisible: boolean; // ¿Soy visible para este contacto?
  notificationsEnabled: boolean; // ¿Recibo notificaciones de este contacto?
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

interface ContactResponseDto {
  userId: string; // ID del otro usuario
  isLocationShared: boolean; // ¿YO comparto MI ubicación con él?
  theyShareLocation: boolean; // ¿ELLOS comparten SU ubicación conmigo?
  isVisible: boolean; // ¿Soy visible para este contacto?
  notificationsEnabled: boolean; // ¿Recibo notificaciones de este contacto?
  connectedAt: string; // ISO 8601
}

interface PendingRequestResponseDto {
  fromUserId: string; // El userId del otro (quien envió o a quien envié)
  createdAt: string; // ISO 8601
}

interface WatcherResponseDto {
  userId: string; // ID del contacto que puede ver mi ubicación
  since: string; // ISO 8601 — desde cuándo comparto mi ubicación con él
}
```

### Diagrama de Flujo — Agregar Contacto

```
┌─────────────────────────────────────────────────────────┐
│                 FLUJO DE CONEXIÓN                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Usuario A busca a Usuario B                         │
│     GET /users/search?q=nombre                          │
│     → connectionStatus: "NONE"                          │
│                                                         │
│  2. Usuario A envía solicitud                           │
│     POST /contacts/request { targetUserId: B }          │
│     → Se crea arista A→B (PENDING)                      │
│     → connectionStatus cambia a "PENDING_SENT"          │
│                                                         │
│  3. Usuario B ve la solicitud                           │
│     GET /contacts/requests/incoming                     │
│     → [{ fromUserId: A, createdAt: "..." }]             │
│                                                         │
│  4a. Usuario B ACEPTA                                   │
│      PATCH /contacts/accept/:A                          │
│      → Arista A→B pasa a ACCEPTED                       │
│      → Se crea arista B→A (ACCEPTED)                    │
│      → Ambos aparecen en GET /contacts del otro         │
│                                                         │
│  4b. Usuario B RECHAZA                                  │
│      PATCH /contacts/reject/:A                          │
│      → Arista A→B se ELIMINA                            │
│      → Vuelven a "NONE", pueden reenviar solicitud      │
│                                                         │
│  ⚡ CASO ESPECIAL: Solicitud mutua simultánea           │
│     Si B envía POST /contacts/request { targetUserId: A}│
│     cuando ya existe A→B (PENDING):                     │
│     → AUTO-ACCEPT: ambas aristas pasan a ACCEPTED       │
│     → Se conectan automáticamente sin aceptar manual    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Diagrama de Estados

```
         ┌──────┐
         │ NONE │ ← Sin relación (no existe arista)
         └──┬───┘
            │ POST /contacts/request
            ▼
    ┌──────────────┐
    │   PENDING    │ ← Arista A→B creada
    └──┬───────┬───┘
       │       │
  ACCEPT    REJECT
       │       │
       ▼       ▼
 ┌──────────┐ ┌──────┐
 │ ACCEPTED │ │ NONE │ ← Arista eliminada, puede reenviar
 └──┬───────┘ └──────┘
    │
    │ POST /contacts/block/:userId
    ▼
 ┌──────────┐
 │ BLOCKED  │ ← Ambas aristas eliminadas + arista BLOCKED creada
 └──┬───────┘
    │ DELETE /contacts/block/:userId
    ▼
 ┌──────┐
 │ NONE │ ← Arista BLOCKED eliminada, pueden reenviar solicitud
 └──────┘
```

### Tabla de Acciones y Errores

| Acción                   | Endpoint                         | Condición previa | Resultado                           | Error posible                                                        |
| ------------------------ | -------------------------------- | ---------------- | ----------------------------------- | -------------------------------------------------------------------- |
| Enviar solicitud         | `POST /contacts/request`         | NONE             | Crea arista PENDING                 | `409` si ya existe arista; `409` si bloqueado; `400` si es uno mismo |
| Enviar solicitud (mutua) | `POST /contacts/request`         | PENDING_RECEIVED | AUTO-ACCEPT: ambos ACCEPTED         | —                                                                    |
| Aceptar                  | `PATCH /contacts/accept/:userId` | PENDING_RECEIVED | Ambos ACCEPTED                      | `404` no existe; `400` si no es PENDING                              |
| Rechazar                 | `PATCH /contacts/reject/:userId` | PENDING_RECEIVED | Arista eliminada → NONE             | `404` no existe; `400` si no es PENDING                              |
| Bloquear                 | `POST /contacts/block/:userId`   | Cualquiera       | Elimina toda conexión, crea BLOCKED | `400` si es uno mismo                                                |
| Desbloquear              | `DELETE /contacts/block/:userId` | BLOCKED          | Elimina arista → NONE               | —                                                                    |
| Eliminar contacto        | `DELETE /contacts/:userId`       | ACCEPTED         | Elimina ambas aristas → NONE        | —                                                                    |

### Configuración por Contacto (después de ACCEPTED)

Una vez conectados, cada usuario controla **3 configuraciones independientes** en su arista:

| Configuración          | Default | Endpoint                                   | Efecto                                                   |
| ---------------------- | ------- | ------------------------------------------ | -------------------------------------------------------- |
| `isLocationShared`     | `false` | `PATCH /contacts/:userId/location-sharing` | Si `true`, el contacto puede ver mi ubicación en el mapa |
| `isVisible`            | `true`  | `PATCH /contacts/:userId/settings`         | Si `false`, me hago invisible para ese contacto          |
| `notificationsEnabled` | `true`  | `PATCH /contacts/:userId/settings`         | Si `false`, no recibo notificaciones de ese contacto     |

> **Importante**: Cada usuario controla SU propia arista. Si A pone `isLocationShared: true`, B puede ver la ubicación de A. Pero A no puede ver la de B a menos que B también active `isLocationShared: true` en su arista.

### Flujo Recomendado para el Frontend

```
1. BÚSQUEDA → GET /users/search?q=...
   → Mostrar resultados con `connectionStatus` para saber qué botón mostrar:
     - "NONE"             → Botón "Enviar solicitud"
     - "PENDING_SENT"     → Botón "Solicitud enviada" (disabled/cancelable)
     - "PENDING_RECEIVED" → Botones "Aceptar" / "Rechazar"
     - "CONNECTED"        → Botón "Ver perfil" o "Mensaje"
     - "BLOCKED"          → Nada (o "Desbloquear" si fui yo)

2. ENVIAR SOLICITUD → POST /contacts/request { targetUserId }
   → Si 201 con status "PENDING" → mostrar "Solicitud enviada"
   → Si 201 con status "ACCEPTED" → ¡auto-aceptado! ya son contactos

3. VER SOLICITUDES → GET /contacts/requests/incoming
   → Mostrar lista con botones "Aceptar" / "Rechazar" por cada una

4. ACEPTAR → PATCH /contacts/accept/:userId
   → Ahora aparece en GET /contacts

5. MIS CONTACTOS → GET /contacts
   → Mostrar lista con opciones de privacidad por contacto:
     - Toggle "Compartir ubicación" (isLocationShared)
     - Toggle "Visible para este contacto" (isVisible)
     - Toggle "Notificaciones" (notificationsEnabled)

6. MAPA → GET /location/contacts
   → Recibir ubicaciones de contactos que comparten conmigo
   → Conectar WebSocket para actualizaciones en tiempo real
```

---

### 3.1 Enviar Solicitud de Conexión

```
POST /contacts/request
```

| Campo          | Tipo     | Validación | Requerido |
| -------------- | -------- | ---------- | --------- |
| `targetUserId` | `string` | UUID       | ✅        |

**Response** `201` → `ConnectionResponseDto`

```json
{
  "sourceUserId": "my-uuid",
  "targetUserId": "their-uuid",
  "status": "PENDING",
  "isLocationShared": false,
  "isVisible": true,
  "notificationsEnabled": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

> Si ambos usuarios se envían solicitud mutuamente, se auto-acepta → `status: "ACCEPTED"`.

---

### 3.2 Aceptar Solicitud

```
PATCH /contacts/accept/:userId
```

| Param    | Descripción                             |
| -------- | --------------------------------------- |
| `userId` | UUID del usuario que te envió solicitud |

**Response** `200` → `ConnectionResponseDto` con `status: "ACCEPTED"`

---

### 3.3 Rechazar Solicitud

```
PATCH /contacts/reject/:userId
```

| Param    | Descripción                             |
| -------- | --------------------------------------- |
| `userId` | UUID del usuario que te envió solicitud |

**Response** `204` No Content

---

### 3.4 Bloquear Usuario

```
POST /contacts/block/:userId
```

| Param    | Descripción                 |
| -------- | --------------------------- |
| `userId` | UUID del usuario a bloquear |

**Response** `201` → `ConnectionResponseDto` con `status: "BLOCKED"`

---

### 3.5 Desbloquear Usuario

```
DELETE /contacts/block/:userId
```

| Param    | Descripción                    |
| -------- | ------------------------------ |
| `userId` | UUID del usuario a desbloquear |

**Response** `204` No Content

---

### 3.6 Eliminar Contacto

```
DELETE /contacts/:userId
```

| Param    | Descripción                  |
| -------- | ---------------------------- |
| `userId` | UUID del contacto a eliminar |

**Response** `204` No Content

---

### 3.7 Listar Contactos

```
GET /contacts
```

**Response** `200` → `ContactResponseDto[]`

```json
[
  {
    "userId": "uuid",
    "isLocationShared": true,
    "theyShareLocation": false,
    "isVisible": true,
    "notificationsEnabled": true,
    "connectedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

| Campo                  | Descripción                                       |
| ---------------------- | ------------------------------------------------- |
| `isLocationShared`     | Si **tú** compartes ubicación con este contacto   |
| `theyShareLocation`    | Si **ellos** comparten ubicación contigo          |
| `isVisible`            | Si **tú** eres visible para este contacto         |
| `notificationsEnabled` | Si **tú** recibes notificaciones de este contacto |

---

### 3.8 Solicitudes Entrantes

```
GET /contacts/requests/incoming
```

**Response** `200` → `PendingRequestResponseDto[]`

```json
[
  {
    "fromUserId": "uuid",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

---

### 3.9 Solicitudes Enviadas

```
GET /contacts/requests/sent
```

**Response** `200` → `PendingRequestResponseDto[]`

```json
[
  {
    "fromUserId": "uuid",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

---

### 3.10 Toggle Compartir Ubicación

```
PATCH /contacts/:userId/location-sharing
```

| Campo              | Tipo      | Requerido |
| ------------------ | --------- | --------- |
| `isLocationShared` | `boolean` | ✅        |

| Param    | Descripción       |
| -------- | ----------------- |
| `userId` | UUID del contacto |

**Response** `200` → `ConnectionResponseDto`

> Esto controla si **tú** compartes tu ubicación con el contacto. El contacto controla por separado si comparte la suya contigo.

---

### 3.11 Actualizar Configuración de Privacidad con Contacto

```
PATCH /contacts/:userId/settings
```

| Param    | Descripción       |
| -------- | ----------------- |
| `userId` | UUID del contacto |

| Campo                  | Tipo      | Requerido |
| ---------------------- | --------- | --------- |
| `isVisible`            | `boolean` | ❌        |
| `notificationsEnabled` | `boolean` | ❌        |

**Response** `200` → `ConnectionResponseDto`

> `isVisible: false` → te haces invisible para ese contacto (no te verá en el mapa).  
> `notificationsEnabled: false` → no recibís notificaciones de ese contacto.

---

### 3.12 Quién Me Ve (Watchers)

```
GET /contacts/watchers
```

**Response** `200` → `WatcherResponseDto[]`

```json
[
  {
    "userId": "uuid",
    "since": "2025-01-01T00:00:00.000Z"
  }
]
```

> Lista de contactos que pueden ver tu ubicación en tiempo real.

---

### 3.13 Buscar entre Contactos

```
GET /contacts/search
```

Mismos query params que [`GET /users/search`](#22-buscar-usuarios).

**Response** `200` → `PaginatedSearchResultDto` (mismo formato)

> Solo busca entre tus contactos aceptados. No aplica filtro de `isDiscoverable`.

---

## 4. Saved Locations

Base path: `/locations/saved`  
🔒 **Todos los endpoints requieren JWT**

### 4.1 Crear Ubicación Guardada

```
POST /locations/saved
```

| Campo       | Tipo     | Validación      | Requerido |
| ----------- | -------- | --------------- | --------- |
| `name`      | `string` | Max 100 chars   | ✅        |
| `address`   | `string` | —               | ❌        |
| `latitude`  | `number` | Latitud válida  | ✅        |
| `longitude` | `number` | Longitud válida | ✅        |
| `icon`      | `string` | Max 50 chars    | ❌        |

**Response** `201` → `SavedLocationResponseDto`

```json
{
  "id": "uuid",
  "name": "Casa",
  "address": "Av. Siempre Viva 742",
  "latitude": -34.6037,
  "longitude": -58.3816,
  "icon": "home",
  "sharedWith": [],
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

---

### 4.2 Listar Mis Ubicaciones

```
GET /locations/saved
```

**Response** `200` → `SavedLocationResponseDto[]`

---

### 4.3 Ubicaciones Compartidas Conmigo

```
GET /locations/saved/shared-with-me
```

**Response** `200` → `SavedLocationResponseDto[]`

---

### 4.4 Actualizar Ubicación

```
PATCH /locations/saved/:id
```

| Campo       | Tipo     | Validación      | Requerido |
| ----------- | -------- | --------------- | --------- |
| `name`      | `string` | Max 100 chars   | ❌        |
| `address`   | `string` | —               | ❌        |
| `latitude`  | `number` | Latitud válida  | ❌        |
| `longitude` | `number` | Longitud válida | ❌        |
| `icon`      | `string` | Max 50 chars    | ❌        |

**Response** `200` → `SavedLocationResponseDto`

---

### 4.5 Eliminar Ubicación

```
DELETE /locations/saved/:id
```

**Response** `204` No Content

---

### 4.6 Compartir Ubicación con Contacto

```
POST /locations/saved/:id/share
```

| Campo           | Tipo     | Validación | Requerido |
| --------------- | -------- | ---------- | --------- |
| `contactUserId` | `string` | UUID       | ✅        |

**Response** `200`

```json
{ "message": "Location shared successfully" }
```

---

### 4.7 Dejar de Compartir Ubicación

```
DELETE /locations/saved/:id/share/:userId
```

| Param    | Descripción                   |
| -------- | ----------------------------- |
| `id`     | UUID de la ubicación guardada |
| `userId` | UUID del contacto             |

**Response** `204` No Content

---

## 5. Location Tracks

Base path: `/locations/tracks`  
🔒 **Todos los endpoints requieren JWT**

### 5.1 Crear Track

```
POST /locations/tracks
```

| Campo       | Tipo                      | Validación  | Requerido |
| ----------- | ------------------------- | ----------- | --------- |
| `startedAt` | `string`                  | ISO 8601    | ✅        |
| `metadata`  | `Record<string, unknown>` | Objeto JSON | ❌        |

**Response** `201` → `TrackResponseDto`

```json
{
  "id": "uuid",
  "userId": "uuid",
  "startedAt": "2025-01-01T10:00:00.000Z",
  "endedAt": null,
  "distanceMeters": null,
  "durationSeconds": null,
  "metadata": { "activity": "running" },
  "createdAt": "2025-01-01T10:00:00.000Z",
  "points": []
}
```

---

### 5.2 Listar Tracks

```
GET /locations/tracks
```

| Query Param | Tipo     | Validación | Default | Requerido |
| ----------- | -------- | ---------- | ------- | --------- |
| `from`      | `string` | ISO 8601   | —       | ❌        |
| `to`        | `string` | ISO 8601   | —       | ❌        |
| `limit`     | `number` | 1-100      | `20`    | ❌        |
| `offset`    | `number` | Min 0      | `0`     | ❌        |

**Response** `200` → `TrackListResponseDto`

```json
{
  "tracks": [
    /* TrackResponseDto[] sin points */
  ],
  "total": 50,
  "limit": 20,
  "offset": 0
}
```

---

### 5.3 Exportar Tracks

```
GET /locations/tracks/export
```

| Query Param | Tipo     | Requerido |
| ----------- | -------- | --------- |
| `from`      | `string` | ❌        |
| `to`        | `string` | ❌        |

**Response** `200`

```json
{
  "tracks": [
    /* full track data with points */
  ]
}
```

---

### 5.4 Obtener Track por ID

```
GET /locations/tracks/:id
```

**Response** `200` → `TrackResponseDto` (incluye `points[]`)

Cada punto:

```json
{
  "id": "uuid",
  "latitude": -34.6037,
  "longitude": -58.3816,
  "altitude": 25.0,
  "accuracy": 5.0,
  "speed": 1.2,
  "heading": 180.0,
  "recordedAt": "2025-01-01T10:00:05.000Z"
}
```

---

### 5.5 Finalizar Track

```
PATCH /locations/tracks/:id/finish
```

| Campo             | Tipo     | Validación | Requerido |
| ----------------- | -------- | ---------- | --------- |
| `endedAt`         | `string` | ISO 8601   | ✅        |
| `distanceMeters`  | `number` | —          | ❌        |
| `durationSeconds` | `number` | —          | ❌        |

**Response** `200` → `TrackResponseDto`

---

### 5.6 Agregar Puntos a Track

```
POST /locations/tracks/:id/points
```

| Campo    | Tipo              | Requerido  |
| -------- | ----------------- | ---------- |
| `points` | `TrackPointDto[]` | ✅ (min 1) |

Cada `TrackPointDto`:

| Campo        | Tipo     | Validación      | Requerido |
| ------------ | -------- | --------------- | --------- |
| `latitude`   | `number` | Latitud válida  | ✅        |
| `longitude`  | `number` | Longitud válida | ✅        |
| `altitude`   | `number` | —               | ❌        |
| `accuracy`   | `number` | —               | ❌        |
| `speed`      | `number` | m/s             | ❌        |
| `heading`    | `number` | Grados (0-360)  | ❌        |
| `recordedAt` | `string` | ISO 8601        | ✅        |

**Response** `200`

```json
{ "added": 5 }
```

---

### 5.7 Eliminar Track

```
DELETE /locations/tracks/:id
```

**Response** `204` No Content

---

### 5.8 Importar Backup de Tracks

```
POST /locations/tracks/backup/import
```

| Campo    | Tipo               | Requerido  |
| -------- | ------------------ | ---------- |
| `tracks` | `BackupTrackDto[]` | ✅ (min 1) |

Cada `BackupTrackDto`:

| Campo             | Tipo                      | Requerido  |
| ----------------- | ------------------------- | ---------- |
| `startedAt`       | `string` (ISO 8601)       | ✅         |
| `endedAt`         | `string` (ISO 8601)       | ❌         |
| `distanceMeters`  | `number`                  | ❌         |
| `durationSeconds` | `number`                  | ❌         |
| `metadata`        | `Record<string, unknown>` | ❌         |
| `points`          | `BackupPointDto[]`        | ✅ (min 1) |

Cada `BackupPointDto`: mismos campos que `TrackPointDto`.

**Response** `200`

```json
{ "importedTracks": 3 }
```

---

## 6. Realtime Location

Base path: `/location`  
🔒 **Todos los endpoints requieren JWT**

### 6.1 Actualizar Mi Ubicación (HTTP)

```
POST /location/update
```

⏱️ Rate limit: **60 requests / minuto**

| Campo       | Tipo     | Validación  | Requerido |
| ----------- | -------- | ----------- | --------- |
| `latitude`  | `number` | -90 a 90    | ✅        |
| `longitude` | `number` | -180 a 180  | ✅        |
| `accuracy`  | `number` | Metros, ≥ 0 | ❌        |

**Response** `200` → `LocationUpdateResponseDto`

```json
{
  "userId": "uuid",
  "latitude": -34.6037,
  "longitude": -58.3816,
  "accuracy": 5.0,
  "updatedAt": "2025-01-01T10:00:00.000Z"
}
```

> También emite la ubicación por WebSocket a todos los contactos que tengan `isLocationShared: true` contigo.

---

### 6.2 Ubicaciones de Contactos

```
GET /location/contacts
```

Obtiene la última ubicación conocida de contactos que **comparten su ubicación conmigo**.

**Response** `200` → `ContactLocationResponseDto[]`

```json
[
  {
    "userId": "uuid",
    "latitude": -34.6037,
    "longitude": -58.3816,
    "accuracy": 5.0,
    "updatedAt": "2025-01-01T10:00:00.000Z"
  }
]
```

> Solo incluye contactos donde ELLOS tienen `isLocationShared: true` EN SU EDGE hacia vos. Es decir, ellos decidieron compartir su ubicación conmigo.

---

## 7. Groups

Base path: `/groups`  
🔒 **Todos los endpoints requieren JWT**

### Concepto

Los grupos permiten organizar contactos con jerarquía de roles:

- **OWNER**: Creador del grupo. Puede hacer todo, incluyendo cambiar roles y eliminar grupo.
- **ADMIN**: Puede invitar y remover MEMBERS. No puede remover otros ADMINs ni al OWNER.
- **MEMBER**: Puede ver el grupo y configurar sus propios settings.

Cada miembro del grupo controla individualmente:

- `isLocationSharedWithGroup` → si comparte su ubicación con los demás miembros
- `isVisibleInGroup` → si es visible dentro del grupo
- `notificationsEnabled` → si recibe notificaciones del grupo

Tipos de grupo: `CUSTOM`, `FAMILY`, `WORK`.

---

### 7.1 Crear Grupo

```
POST /groups
```

| Campo         | Tipo     | Validación                 | Requerido              |
| ------------- | -------- | -------------------------- | ---------------------- |
| `name`        | `string` | Min 1 char                 | ✅                     |
| `description` | `string` | —                          | ❌                     |
| `type`        | `string` | `CUSTOM`, `FAMILY`, `WORK` | ❌ (default: `CUSTOM`) |
| `avatarUrl`   | `string` | URL válida                 | ❌                     |

**Response** `201` → `GroupResponseDto`

```json
{
  "id": "uuid",
  "name": "Mi Familia",
  "description": "Grupo familiar",
  "type": "FAMILY",
  "createdById": "my-uuid",
  "avatarUrl": null,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z",
  "members": [
    {
      "id": "uuid",
      "userId": "my-uuid",
      "role": "OWNER",
      "isLocationSharedWithGroup": false,
      "isVisibleInGroup": true,
      "notificationsEnabled": true,
      "joinedAt": "2025-01-01T00:00:00.000Z",
      "invitedById": null
    }
  ]
}
```

> El creador se agrega automáticamente como `OWNER`.

---

### 7.2 Listar Mis Grupos

```
GET /groups
```

**Response** `200` → `GroupListResponseDto[]`

```json
[
  {
    "id": "uuid",
    "name": "Mi Familia",
    "description": "Grupo familiar",
    "type": "FAMILY",
    "createdById": "uuid",
    "avatarUrl": null,
    "memberCount": 5,
    "myRole": "OWNER",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

---

### 7.3 Detalle de Grupo

```
GET /groups/:id
```

| Param | Descripción    |
| ----- | -------------- |
| `id`  | UUID del grupo |

**Response** `200` → `GroupResponseDto` (incluye `members[]`)

> Solo pueden ver el detalle los miembros del grupo. Si no sos miembro, `404`.

---

### 7.4 Actualizar Grupo

```
PATCH /groups/:id
```

🔐 **Solo ADMIN/OWNER**

| Campo         | Tipo     | Requerido |
| ------------- | -------- | --------- |
| `name`        | `string` | ❌        |
| `description` | `string` | ❌        |
| `avatarUrl`   | `string` | ❌        |

**Response** `200` → `GroupResponseDto`

---

### 7.5 Eliminar Grupo

```
DELETE /groups/:id
```

🔐 **Solo OWNER**

**Response** `204` No Content

---

### 7.6 Invitar Miembro al Grupo

```
POST /groups/:id/members
```

🔐 **Solo ADMIN/OWNER**

| Campo    | Tipo     | Validación | Requerido |
| -------- | -------- | ---------- | --------- |
| `userId` | `string` | UUID       | ✅        |

**Response** `201` → `GroupInvitationResponseDto`

```json
{
  "id": "invitation-uuid",
  "groupId": "group-uuid",
  "groupName": "Mi Familia",
  "invitedById": "my-uuid",
  "status": "PENDING",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

> Si el usuario ya es miembro o tiene una invitación pendiente, devuelve `409`.

---

### 7.7 Cambiar Rol de Miembro

```
PATCH /groups/:id/members/:userId/role
```

🔐 **Solo OWNER**

| Campo  | Tipo     | Validación                 | Requerido |
| ------ | -------- | -------------------------- | --------- |
| `role` | `string` | `OWNER`, `ADMIN`, `MEMBER` | ✅        |

**Response** `200` → `GroupMemberResponseDto`

```json
{
  "id": "uuid",
  "userId": "target-uuid",
  "role": "ADMIN",
  "isLocationSharedWithGroup": false,
  "isVisibleInGroup": true,
  "notificationsEnabled": true,
  "joinedAt": "2025-01-01T00:00:00.000Z",
  "invitedById": "inviter-uuid"
}
```

---

### 7.8 Remover Miembro del Grupo

```
DELETE /groups/:id/members/:userId
```

🔐 **OWNER**: puede remover a cualquiera  
🔐 **ADMIN**: solo puede remover MEMBERs

**Response** `204` No Content

---

### 7.9 Salir del Grupo

```
POST /groups/:id/leave
```

**Response** `204` No Content

> El OWNER **no puede** salir. Debe transferir ownership (cambiar rol a otro usuario como OWNER) o eliminar el grupo.

---

### 7.10 Actualizar Mi Configuración en Grupo

```
PATCH /groups/:id/members/me/settings
```

| Campo                       | Tipo      | Requerido |
| --------------------------- | --------- | --------- |
| `isLocationSharedWithGroup` | `boolean` | ❌        |
| `isVisibleInGroup`          | `boolean` | ❌        |
| `notificationsEnabled`      | `boolean` | ❌        |

**Response** `200` → `GroupMemberResponseDto`

> Cada miembro controla su propia configuración. Esto NO afecta la configuración de privacidad a nivel de contactos individuales.

---

### 7.11 Mis Invitaciones Pendientes

```
GET /groups/invitations
```

**Response** `200` → `GroupInvitationResponseDto[]`

```json
[
  {
    "id": "invitation-uuid",
    "groupId": "group-uuid",
    "groupName": "Amigos del Trabajo",
    "invitedById": "inviter-uuid",
    "status": "PENDING",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

---

### 7.12 Aceptar Invitación

```
PATCH /groups/invitations/:invitationId/accept
```

**Response** `200` → `GroupMemberResponseDto`

> Se agrega al grupo como `MEMBER` con settings por defecto.

---

### 7.13 Rechazar Invitación

```
PATCH /groups/invitations/:invitationId/reject
```

**Response** `204` No Content

---

### 7.14 Ubicaciones de Miembros del Grupo

```
GET /groups/:id/members/locations
```

**Response** `200` → `GroupMemberLocationDto[]`

```json
[
  {
    "userId": "member-uuid",
    "latitude": -34.6037,
    "longitude": -58.3816,
    "accuracy": 5.0,
    "updatedAt": "2025-01-01T10:00:00.000Z"
  }
]
```

> Solo incluye miembros cuyo `isLocationSharedWithGroup: true`. Debés ser miembro del grupo para acceder.

---

## 8. WebSocket — Location en Tiempo Real

### Conexión

```
Namespace: /location
URL: ws://<host>:<port>/location
```

### Autenticación

Enviar el JWT al conectarse de una de estas formas:

**Opción 1: Auth object** (recomendado)

```javascript
const socket = io("ws://host:port/location", {
  auth: { token: "jwt-access-token" },
});
```

**Opción 2: Header**

```javascript
const socket = io("ws://host:port/location", {
  extraHeaders: { Authorization: "Bearer jwt-access-token" },
});
```

> Si el token es inválido o falta, el servidor desconecta inmediatamente.

---

### Enviar Ubicación

**Emit** → `location:update`

```javascript
socket.emit("location:update", {
  latitude: -34.6037,
  longitude: -58.3816,
  accuracy: 5.0, // opcional
});
```

**Response** → `location:updated`

```json
{ "success": true }
```

---

### Recibir Ubicaciones de Contactos

**Listen** → `location:update`

```javascript
socket.on("location:update", (data) => {
  // data:
  // {
  //   userId: "contact-uuid",
  //   latitude: -34.6037,
  //   longitude: -58.3816,
  //   accuracy: 5.0,
  //   updatedAt: "2025-01-01T10:00:00.000Z"
  // }
});
```

> Solo recibes ubicaciones de contactos que tienen `isLocationShared: true` hacia vos.

### Flujo completo para el frontend

1. **Conectar** al WebSocket con JWT
2. **Escuchar** `location:update` para recibir ubicaciones de contactos
3. **Emitir** `location:update` periódicamente (ej: cada 10s) con tu ubicación
4. **Alternativamente**, usar `POST /location/update` desde HTTP (también envía por WS a contactos)
5. **Al abrir el mapa**, hacer `GET /location/contacts` para obtener la última ubicación de todos los contactos que comparten ubicación conmigo (snapshot inicial)
6. Luego las actualizaciones llegan en tiempo real por el WebSocket

---

## Notas Generales

### Autenticación

Todos los endpoints marcados con 🔒 requieren el header:

```
Authorization: Bearer {accessToken}
```

El `accessToken` expira en **15 minutos**. Usar `POST /auth/refresh` para obtener uno nuevo.  
El `refreshToken` expira en **7 días**.

### Formato de Errores

Todas las respuestas de error siguen este formato:

```json
{
  "statusCode": 400,
  "message": "Validation failed" | ["field must be a string"],
  "error": "Bad Request"
}
```

Códigos comunes:

| Código | Significado                          |
| ------ | ------------------------------------ |
| `400`  | Validación fallida / datos inválidos |
| `401`  | Token inválido o expirado            |
| `403`  | Sin permisos (recurso de otro user)  |
| `404`  | Recurso no encontrado                |
| `409`  | Conflicto (ej: ya existe conexión)   |
| `429`  | Rate limit excedido                  |

### IDs

Todos los IDs son **UUID v4**.

### Fechas

Todas las fechas se envían y reciben en formato **ISO 8601**: `2025-01-26T15:30:00.000Z`

### Paginación

Dos modelos según el endpoint:

**Page-based** (users/search, contacts/search):

```json
{ "data": [...], "total": 42, "page": 1, "limit": 20, "totalPages": 3 }
```

**Offset-based** (tracks):

```json
{ "tracks": [...], "total": 50, "limit": 20, "offset": 0 }
```

### Resumen de Endpoints

| Módulo         | Método | Path                                       | Auth |
| -------------- | ------ | ------------------------------------------ | ---- |
| **Auth**       | POST   | `/auth/register`                           | ❌   |
|                | POST   | `/auth/login`                              | ❌   |
|                | POST   | `/auth/refresh`                            | ❌   |
|                | POST   | `/auth/logout`                             | ❌   |
|                | POST   | `/auth/logout-all`                         | ✅   |
|                | POST   | `/auth/google`                             | ❌   |
|                | GET    | `/auth/google/redirect`                    | ❌   |
|                | GET    | `/auth/google/callback`                    | ❌   |
| **Users**      | POST   | `/users/onboarding`                        | ✅   |
|                | GET    | `/users/search`                            | ✅   |
|                | PATCH  | `/users/discoverability`                   | ✅   |
| **Contacts**   | POST   | `/contacts/request`                        | ✅   |
|                | PATCH  | `/contacts/accept/:userId`                 | ✅   |
|                | PATCH  | `/contacts/reject/:userId`                 | ✅   |
|                | POST   | `/contacts/block/:userId`                  | ✅   |
|                | DELETE | `/contacts/block/:userId`                  | ✅   |
|                | DELETE | `/contacts/:userId`                        | ✅   |
|                | GET    | `/contacts`                                | ✅   |
|                | GET    | `/contacts/requests/incoming`              | ✅   |
|                | GET    | `/contacts/requests/sent`                  | ✅   |
|                | PATCH  | `/contacts/:userId/location-sharing`       | ✅   |
|                | PATCH  | `/contacts/:userId/settings`               | ✅   |
|                | GET    | `/contacts/watchers`                       | ✅   |
|                | GET    | `/contacts/search`                         | ✅   |
| **Saved Loc.** | POST   | `/locations/saved`                         | ✅   |
|                | GET    | `/locations/saved`                         | ✅   |
|                | GET    | `/locations/saved/shared-with-me`          | ✅   |
|                | PATCH  | `/locations/saved/:id`                     | ✅   |
|                | DELETE | `/locations/saved/:id`                     | ✅   |
|                | POST   | `/locations/saved/:id/share`               | ✅   |
|                | DELETE | `/locations/saved/:id/share/:userId`       | ✅   |
| **Tracks**     | POST   | `/locations/tracks`                        | ✅   |
|                | GET    | `/locations/tracks`                        | ✅   |
|                | GET    | `/locations/tracks/export`                 | ✅   |
|                | GET    | `/locations/tracks/:id`                    | ✅   |
|                | PATCH  | `/locations/tracks/:id/finish`             | ✅   |
|                | POST   | `/locations/tracks/:id/points`             | ✅   |
|                | DELETE | `/locations/tracks/:id`                    | ✅   |
|                | POST   | `/locations/tracks/backup/import`          | ✅   |
| **Realtime**   | POST   | `/location/update`                         | ✅   |
|                | GET    | `/location/contacts`                       | ✅   |
| **Groups**     | POST   | `/groups`                                  | ✅   |
|                | GET    | `/groups`                                  | ✅   |
|                | GET    | `/groups/invitations`                      | ✅   |
|                | GET    | `/groups/:id`                              | ✅   |
|                | PATCH  | `/groups/:id`                              | ✅   |
|                | DELETE | `/groups/:id`                              | ✅   |
|                | POST   | `/groups/:id/members`                      | ✅   |
|                | PATCH  | `/groups/:id/members/:userId/role`         | ✅   |
|                | DELETE | `/groups/:id/members/:userId`              | ✅   |
|                | POST   | `/groups/:id/leave`                        | ✅   |
|                | PATCH  | `/groups/:id/members/me/settings`          | ✅   |
|                | PATCH  | `/groups/invitations/:invitationId/accept` | ✅   |
|                | PATCH  | `/groups/invitations/:invitationId/reject` | ✅   |
|                | GET    | `/groups/:id/members/locations`            | ✅   |

**Total: 55 endpoints** (+ 1 WebSocket namespace `/location`)
