# Roz ka Khata – full stack (plain HTML/JS frontend + Spring Boot + PostgreSQL)

```
roz-ka-khata-fullstack/
├── backend/                    Spring Boot 3 (Java 17+), Maven, PostgreSQL, JWT
│   ├── pom.xml
│   ├── docs/schema.sql         optional manual table creation
│   ├── docs/api-test.sh        curl smoke test incl. User A / User B isolation
│   └── src/main/
│       ├── java/com/rozkakhata/
│       │   ├── RozKaKhataApplication.java
│       │   ├── controller/   AuthController, ExpenseController
│       │   ├── service/      AuthService, ExpenseService
│       │   ├── repository/   UserRepository, ExpenseRepository
│       │   ├── entity/       User, Expense
│       │   ├── dto/          RegisterRequest, LoginRequest, UserResponse, AuthResponse,
│       │   │                 ExpenseRequest, ExpenseResponse, ErrorResponse, MessageResponse
│       │   ├── security/     JwtService, JwtAuthFilter, AuthenticatedUser
│       │   ├── config/       SecurityConfig (security rules, BCrypt bean, CORS)
│       │   └── exception/    GlobalExceptionHandler + 3 small exception classes
│       └── resources/application.properties
├── frontend/                   your original project (same structure)
│   └── js/  data.js* auth.js* state.js* app.js* i18n.js*   (* = changed; everything else untouched)
└── tests/                      frontend integration test (jsdom + mock API)
```

## 1. PostgreSQL

Install PostgreSQL 14+ and create an empty database:

```bash
psql -U postgres -c "CREATE DATABASE rozkakhata;"
```
(Windows: open "SQL Shell (psql)" and run `CREATE DATABASE rozkakhata;`)

You do **not** need to create tables. With `spring.jpa.hibernate.ddl-auto=update` Hibernate creates
`users` and `expenses` on first start. `backend/docs/schema.sql` is the same DDL if you prefer to create it by hand.

## 2. Environment variables

| Variable | Required | Meaning |
|---|---|---|
| `DB_PASSWORD` | yes | PostgreSQL password |
| `JWT_SECRET` | yes | at least 32 characters, keep it secret |
| `DB_URL` | no | default `jdbc:postgresql://localhost:5432/rozkakhata` |
| `DB_USERNAME` | no | default `postgres` |
| `JWT_EXPIRATION_MS` | no | default 86400000 (24 h) |
| `CORS_ALLOWED_ORIGINS` | no | comma-separated; default allows `localhost`/`127.0.0.1` on ports 5500, 8000, 3000 |

Linux / macOS:
```bash
export DB_PASSWORD='your-postgres-password'
export JWT_SECRET="$(openssl rand -base64 48)"
```
Windows PowerShell:
```powershell
$env:DB_PASSWORD = "your-postgres-password"
$env:JWT_SECRET  = "paste-a-long-random-string-of-32-or-more-characters"
```
Note: a `JWT_SECRET` generated this way changes each time you re-export it, which logs everyone out. Keep one value while developing.

## 3. Run the backend
```bash
cd backend
mvn spring-boot:run          # needs JDK 17+ and Maven; listens on http://localhost:8080
```

## 4. Run the frontend
It must be served from an origin the backend allows (CORS). Easiest:
```bash
cd frontend
python3 -m http.server 5500      # then open http://localhost:5500
```
(VS Code "Live Server" on port 5500 also works.) If you really want to double-click `index.html`
(origin `null`), start the backend with `CORS_ALLOWED_ORIGINS=null` – fine for local testing, not for production.

The backend address is one line in `frontend/js/data.js`:
```js
const API_BASE_URL='http://localhost:8080/api';
```

## 5. Use it
Register → you land in the app → Add → fill amount/category/date → Add expense → open History →
✎ edit → Save → 🗑 delete → Undo. Refresh the page: you stay signed in. Sign out, register a second
user: the list is empty.

## 6. API examples (curl)

```bash
# register  -> 201
curl -i -X POST http://localhost:8080/api/auth/register -H 'Content-Type: application/json' \
  -d '{"name":"Swayam","email":"swayam@example.com","password":"password123"}'
# {"id":1,"name":"Swayam","email":"swayam@example.com"}
# duplicate email -> 409 {"message":"Email already exists"}   invalid email -> 400 {"message":"Invalid email"}

# login -> 200
curl -X POST http://localhost:8080/api/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"swayam@example.com","password":"password123"}'
# {"token":"eyJhbGciOi...","user":{"id":1,"name":"Swayam","email":"swayam@example.com"}}
# wrong password -> 401 {"message":"Invalid email or password"}

TOKEN=eyJhbGciOi...   # paste the token

# list -> 200            (no/invalid token -> 401 {"message":"Unauthorized"})
curl http://localhost:8080/api/expenses -H "Authorization: Bearer $TOKEN"
# [{"id":1,"amount":250.00,"date":"2026-10-01","category":"Food","note":"Lunch"}]

# create -> 201
curl -X POST http://localhost:8080/api/expenses -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"amount":250,"date":"2026-10-01","category":"Food","note":"Lunch"}'
# {"id":1,"amount":250,"date":"2026-10-01","category":"Food","note":"Lunch"}

# update -> 200  (someone else's / unknown id -> 404 {"message":"Expense not found"})
curl -X PUT http://localhost:8080/api/expenses/1 -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"amount":300,"date":"2026-10-01","category":"Transport","note":"Cab"}'

# delete -> 200
curl -X DELETE http://localhost:8080/api/expenses/1 -H "Authorization: Bearer $TOKEN"
# {"message":"Expense deleted"}
```
Valid categories: Food, Transport, Bills, Shopping, Health, Entertainment, Other.
Full automated smoke test incl. isolation: `bash backend/docs/api-test.sh`.

## What changed in the frontend (and why)

| File | Change |
|---|---|
| `js/data.js` | added `API_BASE_URL`; removed the unused localStorage `KEY` |
| `js/auth.js` | the 4 methods now use `fetch()`. JWT in `localStorage['rozkakhata:token']`, public user in `rozkakhata:user`. Added `Auth.token()` (returns the JWT, or null if missing/expired). `register` signs in right after, because the backend's register response has no token. Old fake-account keys (`rozkakhata:users`, `rozkakhata:session`, which held password hashes) are deleted on load. Old per-user expense keys `rozkakhata:v1:*` are left alone. |
| `js/state.js` | `loadExps()`/`save()` replaced by `loadExps()`, `addExp()`, `updateExp()`, `deleteExp()` and a shared `api()` helper that adds the `Authorization` header and logs out on HTTP 401. `save()` no longer exists because REST saves one record at a time. |
| `js/app.js` | the form submit, delete, undo, sample, sign-in and start-up are now `async` and update the screen only after the server answers. Errors use the existing red form error, the existing bottom bar (`#snack`) and the login error line. One request at a time (`busy`) prevents double-submits. |
| `js/i18n.js` | 7 new message keys (English/Hindi/Marathi): `e_net e_server e_session e_load e_save e_upd e_del`. |

Not touched: `index.html`, `css/*`, `js/render.js`, `js/export.js`.

Two details worth knowing:
* **Ids.** The database ids are numbers, but `render.js`/`export.js` sort with `id.localeCompare`, so the frontend keeps them as zero-padded strings (`000000000042`) and converts back with `Number()` for URLs. That keeps same-day ordering correct without touching `render.js`.
* **Undo** re-creates the deleted expense with `POST`, so it gets a new id.
