# CakeShop API

Everything the frontend needs to talk to the Django backend.

- **Dev base URL:** `http://127.0.0.1:8000`
- **Interactive docs:** `http://127.0.0.1:8000/api/docs/` (Swagger UI)
- **OpenAPI schema:** `http://127.0.0.1:8000/api/schema/`
- **Content type:** `application/json` for every request body.

> **Important for local dev:** open the frontend on the *same host* as the API
> (`127.0.0.1` everywhere, or `localhost` everywhere). The auth cookies are
> `SameSite=Lax` in development, so `localhost:5173` → `127.0.0.1:8000` counts
> as cross-site and the browser drops them.

---

## 1. How auth works

Tokens live in **HttpOnly cookies**, never in JavaScript. The browser sends
them automatically, so every `fetch` must include credentials:

```ts
fetch(url, { credentials: "include" })
```

### Cookies

| Cookie          | Lifetime                             | Sent to          |
| --------------- | ------------------------------------ | ---------------- |
| `access_token`  | 15 minutes                           | all paths (`/`)  |
| `refresh_token` | 7 days, or until browser closes      | `/api/auth/` only |

- `refresh_token` is **rotated** on every `/api/auth/refresh/` call: the old
  one is blacklisted and a new one is set in the same response.
- Only send the refresh token to auth endpoints. It is not available to JS, so
  you cannot send it yourself — just call `/api/auth/refresh/` with no body.

### The `remember` choice

`POST /api/auth/login/` accepts `remember`:

| `remember`        | Result                                      |
| ----------------- | ------------------------------------------- |
| `true`            | 7-day persistent cookie (survives restart)  |
| `false`/omitted   | browser-session cookie (dies on close)      |

The choice is stored inside the refresh token, so rotation keeps it. If you
omit `remember`, users are logged out when they close the browser.

### Logout and session revocation

- `POST /api/auth/logout/` blacklists the refresh token and clears both cookies.
  It works even if the access token has already expired.
- Changing a password (`set-password`) or completing a reset blacklists **all**
  refresh tokens for that user — every device is signed out. Redirect to
  `/login` afterwards.

### Session check on page load

Call `POST /api/auth/refresh/` once at startup:

- `200` → user is signed in; use the returned user object.
- `401` → no valid session; treat as anonymous. Do **not** redirect on this
  call (the login page would bounce).

An empty `access_token` cookie is treated as anonymous (`401`), so a logged-out
visitor can still open `/login/` and `/register/` without errors.

---

## 2. User object

Every auth endpoint that returns a user returns this shape:

```json
{
  "id": "3f1c2a9e-7b4d-4c1a-9f2e-8d5b6c7a8e9f",
  "username": "Sara",
  "email": "sara@example.com",
  "phone_number": "+1 555 0100",
  "first_name": "Sara",
  "last_name": "Ahmadi"
}
```

- `id` is a UUID **string**, not a number.
- `phone_number` is `null` when unset.
- Emails are always stored lowercase; `User@Example.com` and
  `user@example.com` are the same account.
- `email` and `username` cannot be changed through the API.

---

## 3. Errors

Two shapes are used.

**Validation errors** (bad input) come as a field map:

```json
{
  "email": ["A user with this email already exists."],
  "password": ["This password is too short."]
}
```

**Action errors** (auth, not found, conflicts) come as:

```json
{ "error": "Invalid credentials" }
```

| Status | Meaning                                                  |
| ------ | -------------------------------------------------------- |
| `400`  | Validation failed. Show the field messages.              |
| `401`  | Not signed in, or invalid/expired token. Refresh, retry. |
| `403`  | Origin not allowed, or permission denied.                |
| `404`  | Item not found (product, cart item, order).              |
| `409`  | Conflict (email already registered, data conflict).      |
| `429`  | Rate limited. Show "Too many attempts, try again later." |
| `503`  | Google verification temporarily unavailable.             |

---

## 4. Auth endpoints

Base: `/api/auth/`

| Method | Path                     | Auth | Body                                       |
| ------ | ------------------------ | ---- | ------------------------------------------ |
| POST   | `register/`              | no   | `{username, email, password}`              |
| POST   | `login/`                 | no   | `{email, password, remember?}`             |
| POST   | `google/`                | no   | `{credential}`                             |
| POST   | `refresh/`               | no   | none (uses cookie)                         |
| POST   | `logout/`                | no   | none                                       |
| GET    | `me/`                    | yes  | none                                       |
| PATCH  | `me/`                    | yes  | `{phone_number?, first_name?, last_name?}` |
| POST   | `set-password/`          | yes  | `{new_password, current_password?}`        |
| POST   | `password-reset/`        | no   | `{email}`                                  |
| POST   | `password-reset/confirm/`| no   | `{uid, token, password}`                   |

### POST `register/`

```json
{ "username": "Sara", "email": "sara@example.com", "password": "Str0ng-Passw0rd!" }
```

- `201` → user object. Does **not** set cookies; call `login/` next.
- `400` → duplicate email/username, weak password, or invalid email.

Password rules are Django's defaults: at least 8 characters, not all digits,
not too common, not too similar to the username/email.

### POST `login/`

```json
{ "email": "sara@example.com", "password": "Str0ng-Passw0rd!", "remember": true }
```

- `200` → user object + `access_token` / `refresh_token` cookies.
- `401` → `{"error": "Invalid credentials"}`.
- `429` → more than 5 attempts per minute from one IP.

### POST `google/`

```json
{ "credential": "<Google ID token from Google Identity Services>" }
```

- `200` → user object + cookies (always the persistent 7-day cookie).
- `401` → invalid Google credential.
- `409` → the email is already tied to a **different** Google account, or the
  backend has `ALLOW_GOOGLE_ACCOUNT_LINKING=false`. With the default
  (linking on), an existing password account with the same verified email is
  simply linked and signed in, so this is rare.
- `503` → Google's verification service is down; try again shortly.

The frontend needs `VITE_GOOGLE_CLIENT_ID` with the same value as the backend's
`GOOGLE_OAUTH_CLIENT_ID`.

### POST `refresh/`

No body. Reads the `refresh_token` cookie.

- `200` → user object + new `access_token` and `refresh_token` cookies.
- `401` → missing, expired, blacklisted, or already-used token. Treat as
  signed out.

If many requests fail at once, call this only once and retry them after it
resolves.

### POST `logout/`

No body. Blacklists the refresh token and clears both cookies.

- `200` → `{"message": "Logged out successfully"}`.

### GET / PATCH `me/`

`GET` returns the user object. `PATCH` updates the profile:

```json
{ "first_name": "Sara", "last_name": "Ahmadi", "phone_number": "+1 555 0100" }
```

- Only these three fields are writable. Unknown fields are ignored.
- `phone_number` must be 6–20 characters of digits, spaces, `+`, `-`, `.`,
  `(`, `)`. Send `""` or `null` to clear it.
- `400` → `{"phone_number": ["This phone number is already in use."]}`.

### POST `set-password/`

Sets the first password for Google-created accounts, or changes an existing
one.

```json
{ "current_password": "Str0ng-Passw0rd!", "new_password": "Ev3n-Str0nger!" }
```

- `current_password` is required **only if the account already has a
  password**. If the user signed up with Google, send just `new_password`.
- `400` → `current_password` wrong, or `new_password` fails the password rules.
- `200` → `{"message": "Password updated. Please sign in again."}` and both
  cookies are cleared. All other sessions are dead too — send the user to
  `/login`.

### POST `password-reset/`

```json
{ "email": "sara@example.com" }
```

- Always returns `200` with
  `{"message": "If that email exists, a reset link has been sent."}` — whether
  or not the address exists. Do not try to detect a difference.
- In development the backend prints the email to its terminal (console email
  backend). The link expires after **1 hour**.

### POST `password-reset/confirm/`

The link in the email points at:

```
http://localhost:5173/reset-password?uid=<uid>&token=<token>
```

Read `uid` and `token` from the query string and send:

```json
{ "uid": "...", "token": "...", "password": "Fr3sh-Passw0rd!" }
```

- `200` → `{"message": "Password updated. Please sign in."}`. All sessions are
  revoked and cookies cleared.
- `400` → `{"error": "Invalid reset link."}` or
  `{"error": "Invalid or expired reset link."}`.
- A link works **once**. Reusing it returns `400`.

---

## 5. Products

Public — no auth, no cookies needed.

| Method | Path                       | Notes                          |
| ------ | -------------------------- | ------------------------------ |
| GET    | `/api/products/`           | all available products         |
| GET    | `/api/products/?category=<slug>` | filter by category slug  |
| GET    | `/api/products/categories/`| `[{name, slug}]`               |
| GET    | `/api/products/<uuid>/`    | one product, with description  |

Product (list item):

```json
{
  "id": "b1f5e7c2-6a4d-4d1e-9c3a-2f8e7d6c5b4a",
  "name": "Chocolate Dream",
  "price": "24.50",
  "old_price": "30.00",
  "image": "http://127.0.0.1:8000/media/products/chocolate.jpg",
  "category": { "name": "Chocolate", "slug": "chocolate" },
  "is_available": true
}
```

Product (detail) adds:

```json
{ "description": "...", "rating": "4.7", "reviews_count": 12 }
```

- Prices are **strings** (DRF decimals) — parse them before doing math.
- `image` is an absolute URL, or `null`.
- `old_price` can be `null`.

---

## 6. Cart

Auth required. `401` means signed out.

| Method | Path                             | Body                          | Success |
| ------ | -------------------------------- | ----------------------------- | ------- |
| GET    | `/api/cart/`                     | none                          | `200` cart |
| POST   | `/api/cart/items/`               | `{product_id, quantity}`      | `201` item |
| PATCH  | `/api/cart/items/<product_id>/`  | `{quantity}`                  | `200` item |
| DELETE | `/api/cart/items/<product_id>/`  | none                          | `204` |
| DELETE | `/api/cart/clear/`               | none                          | `204` |

`quantity` is 1–100 and defaults to `1` when adding.

Cart:

```json
{
  "id": "8d2c...",
  "items": [
    {
      "id": "5a1b...",
      "product": { "...": "product object" },
      "quantity": 2,
      "item_total": "49.00"
    }
  ],
  "total": "49.00"
}
```

`item_total` and `total` are strings.

---

## 7. Orders

Auth required.

| Method | Path                    | Body                                                                 | Success |
| ------ | ----------------------- | -------------------------------------------------------------------- | ------- |
| GET    | `/api/orders/`          | none                                                                 | `200` list (newest first) |
| POST   | `/api/orders/create/`   | `{full_name, phone_number, city, delivery_address, payment_method, notes?}` | `201` order |
| GET    | `/api/orders/<id>/`     | none                                                                 | `200` order |

- `payment_method`: `"cash"`, `"card"`, or `"online"`.
- `notes` is optional, may be blank.
- Creating an order uses the **current cart** and clears it.
- `400` → cart is empty: `{"error": "..."}`.

Order:

```json
{
  "id": 12,
  "status": "waiting_for_approval",
  "full_name": "Sara Ahmadi",
  "phone_number": "+1 555 0100",
  "city": "Tehran",
  "delivery_address": "Valiasr St, No. 12, Unit 3",
  "payment_method": "cash",
  "notes": "",
  "total_price": "49.00",
  "items": [
    {
      "product_name": "Chocolate Dream",
      "quantity": 2,
      "price_at_purchase": "24.50",
      "old_price_at_purchase": "30.00"
    }
  ],
  "created_at": "2026-11-26T10:15:00Z",
  "updated_at": "2026-11-26T10:15:00Z"
}
```

- Order `id` is an **integer**.
- Status values: `waiting_for_approval`, `confirmed`, `preparing`,
  `out_for_delivery`, `delivered`, `canceled`.
- Order item names/prices are snapshots, so they survive product changes.

---

## 8. Rate limits

Per IP unless the endpoint requires login.

| Scope            | Limit     | Applies to                          |
| ---------------- | --------- | ----------------------------------- |
| browsing (`anon`) | 1000/hour | public product/category endpoints   |
| signed-in (`user`) | 1000/hour | authenticated requests             |
| `login`          | 5/min     | `POST /api/auth/login/`             |
| `register`       | 10/hour   | `POST /api/auth/register/`          |
| `google`         | 10/min    | `POST /api/auth/google/`            |
| `refresh`        | 30/min    | `POST /api/auth/refresh/`           |
| `password_reset` | 3/hour    | both password-reset endpoints       |
| `sensitive`      | 10/hour   | `POST /api/auth/set-password/`      |

When the limit is hit the API returns `429`.

---

## 9. Security checks you may run into

- **Unsafe requests from unknown origins get `403`.** Send the app from an
  origin listed in `CORS_ALLOWED_ORIGINS` (dev defaults: `localhost:5173`,
  `127.0.0.1:5173`, `localhost:3000`, `127.0.0.1:3000`).
- No CSRF token is required: auth uses JWT cookies, not Django sessions.
- Admin: `/admin/` (session-based, not for the frontend app).

---

## 10. Environment variables that affect the API

| Variable                       | Default                          | Purpose                                |
| ------------------------------ | -------------------------------- | -------------------------------------- |
| `FRONTEND_URL`                 | `http://localhost:5173`          | Base for password-reset links          |
| `EMAIL_BACKEND`                | console backend                  | Console prints emails in dev           |
| `DEFAULT_FROM_EMAIL`           | `no-reply@cakeshop.local`        | Sender address                         |
| `PASSWORD_RESET_TIMEOUT`       | `3600`                           | Reset link lifetime (seconds)          |
| `GOOGLE_OAUTH_CLIENT_ID`       | —                                | Must match the frontend's client ID    |
| `CORS_ALLOWED_ORIGINS`         | `localhost`/`127.0.0.1` on 5173 & 3000 | Allowed browser origins          |
| `CSRF_TRUSTED_ORIGINS`         | same as CORS by default          | Allowed origins for writes             |
| `REDIS_URL`                    | empty (local memory cache)       | Shared cache for throttling in prod    |
| `COOKIE_SECURE`                | `false` in dev, `true` in prod   | HTTPS-only cookies                     |
| `COOKIE_SAMESITE`              | `Lax` in dev, `None` in prod     | Cross-site cookie policy               |

---

## 11. Quick reference

```
POST   /api/auth/register/              {username, email, password}
POST   /api/auth/login/                 {email, password, remember?}
POST   /api/auth/google/                {credential}
POST   /api/auth/refresh/
POST   /api/auth/logout/
GET    /api/auth/me/
PATCH  /api/auth/me/                    {phone_number?, first_name?, last_name?}
POST   /api/auth/set-password/          {new_password, current_password?}
POST   /api/auth/password-reset/        {email}
POST   /api/auth/password-reset/confirm/{uid, token, password}

GET    /api/products/
GET    /api/products/?category=<slug>
GET    /api/products/categories/
GET    /api/products/<uuid>/

GET    /api/cart/
POST   /api/cart/items/                  {product_id, quantity}
PATCH  /api/cart/items/<product_id>/     {quantity}
DELETE /api/cart/items/<product_id>/
DELETE /api/cart/clear/

GET    /api/orders/
POST   /api/orders/create/               {full_name, phone_number, city, delivery_address, payment_method, notes?}
GET    /api/orders/<id>/
```
