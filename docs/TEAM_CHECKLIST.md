# Team Dev Checklist & Resources

Tài liệu tổng hợp cho team onboard, dev, fix bug và integrate. Đọc file này trước khi bắt đầu bất kỳ task nào.

> Docs chi tiết: [SETUP.md](SETUP.md) · [CONTRIBUTING.md](CONTRIBUTING.md) · [SPEC.md](SPEC.md) · [DEMO.md](DEMO.md) · [ARCHITECTURE.md](ARCHITECTURE.md)

---

## Mục lục

1. [URLs & Endpoints quan trọng](#1-urls--endpoints-quan-trọng)
2. [Test accounts & Stripe](#2-test-accounts--stripe)
3. [Setup môi trường lần đầu](#3-setup-môi-trường-lần-đầu)
4. [Commands hàng ngày](#4-commands-hàng-ngày)
5. [Workflow: branch → code → PR](#5-workflow-branch--code--pr)
6. [Status các phase](#6-status-các-phase)
7. [Kiến trúc & module map](#7-kiến-trúc--module-map)
8. [API quick reference](#8-api-quick-reference)
9. [Checklist trước khi tạo PR](#9-checklist-trước-khi-tạo-pr)
10. [Lỗi thường gặp & cách fix](#10-lỗi-thường-gặp--cách-fix)
11. [Conventions cần nhớ](#11-conventions-cần-nhớ)
12. [Trace log & debug resources](#12-trace-log--debug-resources)

---

## 1. URLs & Endpoints quan trọng

| Service | Local | Production |
|---|---|---|
| Web (Next.js) | http://localhost:3001 | https://event-ticket-system.kyotran.dev |
| API (Nest.js) | http://localhost:3000 | https://api.event-ticket-system.kyotran.dev |
| Swagger docs | http://localhost:3000/docs | https://api.event-ticket-system.kyotran.dev/docs |
| MailDev (email UI) | http://localhost:1080 | — |
| Adminer (DB UI) | http://localhost:8080 | — |
| PostgreSQL | localhost:5432 | — |
| Redis | localhost:6379 | — |

**Adminer login:** Server = `postgres`, Username = `root`, Password = `secret`, DB = `event_ticket_db`

---

## 2. Test accounts & Stripe

| Role | Email | Password |
|---|---|---|
| Admin | `admin@example.com` | `secret` |
| Customer | `john.doe@example.com` | `secret` |
| Organizer | `organizer@example.com` | `secret` |

**Stripe test card:** `4242 4242 4242 4242` · expiry bất kỳ trong tương lai · CVC bất kỳ

Kiểm tra refund/payment: Stripe Dashboard → test mode (https://dashboard.stripe.com/test)

---

## 3. Setup môi trường lần đầu

```bash
# 1. Clone
git clone <repo-url>
cd event-ticket-system

# 2. Env file
cp apps/api/env-example-relational apps/api/.env
# Sửa 4 biến bắt buộc (đặt bất kỳ string ngẫu nhiên):
#   AUTH_JWT_SECRET
#   AUTH_REFRESH_SECRET
#   AUTH_FORGOT_SECRET
#   AUTH_CONFIRM_EMAIL_SECRET

# 3. Khởi động infrastructure
docker compose up -d postgres redis maildev adminer

# 4. Đợi postgres healthy, rồi:
cd apps/api
npm install
npm run migration:run
npm run seed:run:relational

# 5. Start API
npm run start:dev
# → http://localhost:3000/docs

# 6. Start Web (terminal mới)
cd apps/web
npm install
npm run dev
# → http://localhost:3001
```

> **Port conflict 5432?** Xem mục [Lỗi thường gặp](#10-lỗi-thường-gặp--cách-fix) bên dưới.

---

## 4. Commands hàng ngày

### Infrastructure

```bash
docker compose up -d postgres redis maildev adminer   # start infra
docker compose ps                                      # kiểm tra health
docker compose down                                    # stop tất cả
```

### API (apps/api)

```bash
npm run start:dev          # dev server với hot-reload
npm run migration:run      # chạy migrations mới
npm run migration:revert   # rollback 1 migration
npm run seed:run:relational # seed lại data mẫu
npm run test               # unit tests
npm run test:e2e:relational:docker  # e2e tests (cần Docker)
npm run lint               # ESLint check
```

### Web (apps/web)

```bash
npm run dev        # dev server
npm run build      # type-check + build (chạy trước khi push)
npm run lint       # ESLint check
```

### Tạo migration mới sau khi thay đổi entity

```bash
cd apps/api
npm run migration:generate -- --name=MoTaNganGonVeDaThayDoi
# Kiểm tra file migration được tạo ra trước khi chạy
npm run migration:run
```

### Scaffold module mới

```bash
cd apps/api
npm run generate:resource:relational
# Nhập tên resource (dạng số ít, ví dụ: "event")
```

---

## 5. Workflow: branch → code → PR

### Branch naming

```
feature/<ten-tinh-nang>     # tính năng mới
fix/<mo-ta-bug>             # sửa bug
chore/<mo-ta>               # tooling, config, deps
docs/<mo-ta>                # chỉ docs
refactor/<mo-ta>            # không thay đổi behavior
```

### Commit format (Conventional Commits)

```
<type>(<scope>): <subject>
```

**Types:** `feat` `fix` `chore` `docs` `refactor` `test` `style` `perf`

**Scopes:** `api` `web` `auth` `events` `bookings` `tickets` `payments` `db` `docker` `ci`

```bash
# Ví dụ:
feat(api): add event search by location
fix(web): fix booking form not resetting after submit
chore(db): add index on bookings.userId
```

Subject rules: lowercase · present tense · không dấu chấm cuối · tối đa 72 ký tự

### PR flow

- [ ] Branch từ `main`
- [ ] Implement + test
- [ ] `npm run lint && npm run test` pass
- [ ] Push, mở PR vào `main`
- [ ] PR title = format commit message
- [ ] Ít nhất 1 teammate review
- [ ] Squash merge

PR description template:
```
## What
Mô tả ngắn đã thay đổi gì.

## Why
Lý do / link issue.

## How to test
Các bước test thủ công.
```

---

## 6. Status các phase

| Phase | Tính năng | Status |
|---|---|---|
| Phase 1 | Auth & User Management (đăng ký, đăng nhập, Google OAuth, email verify) | ✅ Done |
| Phase 2 | Event & Ticket Type CRUD, browse/search events | ✅ Done |
| Phase 3 | Booking + Stripe payment + QR ticket delivery + promo codes | ✅ Done |
| Phase 4 | QR check-in system (HMAC-SHA256, staff scan) | ✅ Done |
| Phase 5 | Cancellation, refund, waitlist | ✅ Done |
| Phase 6 | Analytics (organizer) + Admin panel | ✅ Done |
| Phase 7 | Docker + CI/CD + GitHub Actions → GHCR → VPS | ✅ Done |

### Known deviations & edge cases cần biết

- Validation errors trả `422` thay vì `400` (boilerplate convention của NestJS)
- Ticket email đính kèm QR PNG — PDF rendering (`@react-pdf/renderer`) chưa ship
- Promo `usedCount` tính tại payment success, không phải lúc tạo booking (tránh lock unused slots)
- VND là zero-decimal trong Stripe: `amount = totalAmount` (không nhân 100)
- Free booking (`totalAmount = 0`) fulfil ngay, không tạo Stripe PaymentIntent
- `payment.succeeded_after_expiry` → ghi AuditLog; Phase 5 đã auto-refund trường hợp này

---

## 7. Kiến trúc & module map

```
apps/
├── api/                     NestJS — port 3000
│   └── src/
│       ├── auth/            JWT + email/password auth
│       ├── auth-google/     Google OAuth
│       ├── users/           User CRUD + profile
│       ├── events/          Event CRUD + publish/cancel
│       ├── ticket-types/    Ticket type management
│       ├── bookings/        Booking + expiry (BullMQ)
│       ├── booking-items/   Line items per booking
│       ├── payments/        Stripe intent + webhook handler
│       ├── tickets/         Issued tickets + QR
│       ├── check-in/        Scan + manual check-in
│       ├── waitlist/        Waitlist entries + notification
│       ├── promo-codes/     Promo CRUD + validate
│       ├── analytics/       Organizer analytics endpoint
│       ├── admin/           Admin panel endpoints
│       ├── audit-logs/      Immutable audit trail
│       ├── queue/           BullMQ processors
│       ├── mail/            Email templates (React Email)
│       ├── files/           Upload (local/S3/Cloudinary)
│       └── database/        Migrations, seeds, TypeORM config
│
└── web/                     Next.js 15 — port 3001
    └── app/
        ├── (root)/          Home, events browse
        ├── events/[id]/     Event detail + booking UI
        ├── bookings/        Pay page, success page
        ├── my-bookings/     Customer booking list
        ├── my-tickets/      QR display + download
        ├── checkin/[id]/    Staff QR scanner + logs
        ├── organizer/       Event management + analytics
        ├── admin/           Admin panel
        ├── login/
        └── register/
```

**Pattern backend:** Hexagonal — domain class tách biệt ORM entity. Mỗi module có `domain/`, `dto/`, `infrastructure/persistence/`.

**Pattern frontend:** Server Components by default → thêm `'use client'` chỉ khi cần event handler hoặc hooks.

---

## 8. API quick reference

### Public (không cần auth)

```
GET  /api/v1/events                    # list + filter (q, category, date, location, page, limit)
GET  /api/v1/events/:id               # event detail + ticket types
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
POST /api/v1/auth/google/login        # { idToken } → JWT pair
POST /api/v1/promo-codes/validate     # { code, amount } → discount
POST /api/v1/payments/webhook         # Stripe (xác thực bằng signature)
```

### Customer (JWT required)

```
GET    /api/v1/bookings/me
POST   /api/v1/bookings               # { items: [{ticketTypeId, quantity}], promoCode? }
GET    /api/v1/bookings/:id
DELETE /api/v1/bookings/:id           # cancel + trigger refund
POST   /api/v1/payments/intent/:bookingId
GET    /api/v1/tickets/me
GET    /api/v1/tickets/:code/qr
POST   /api/v1/waitlist               # { ticketTypeId }
DELETE /api/v1/waitlist/:id
GET    /api/v1/waitlist/me
```

### Organizer (JWT + role=ORGANIZER + status=ACTIVE)

```
GET    /api/v1/organizer/me/events
GET    /api/v1/organizer/me/stats
POST   /api/v1/events
PATCH  /api/v1/events/:id
DELETE /api/v1/events/:id
PATCH  /api/v1/events/:id/status      # DRAFT → PUBLISHED, PUBLISHED → CANCELLED
GET    /api/v1/events/:id/bookings
GET    /api/v1/events/:id/analytics
POST   /api/v1/events/:id/ticket-types
PATCH  /api/v1/ticket-types/:id
DELETE /api/v1/ticket-types/:id
POST   /api/v1/events/:id/staff       # { staffId }
DELETE /api/v1/events/:id/staff/:staffId
```

### Staff (JWT + role=STAFF)

```
POST /api/v1/checkin/scan             # { code, eventId }
POST /api/v1/checkin/manual           # { code, eventId }
```

### Admin (JWT + role=ADMIN)

```
GET   /api/v1/admin/users
PATCH /api/v1/admin/users/:id/status
PATCH /api/v1/admin/users/:id/role
GET   /api/v1/admin/stats
GET   /api/v1/admin/organizers/pending
POST  /api/v1/admin/promo-codes
GET   /api/v1/admin/promo-codes
PATCH /api/v1/admin/promo-codes/:id
DELETE /api/v1/admin/promo-codes/:id
GET   /api/v1/checkin/logs/:eventId
```

> Full Swagger tại `/docs` — có thể test trực tiếp từ browser với auth token.

---

## 9. Checklist trước khi tạo PR

### Code

- [ ] Không hardcode credentials, API keys, secret strings
- [ ] Không có `console.log` debug còn sót
- [ ] Không comment out code (xoá luôn)
- [ ] Error handling: throw `NotFoundException` / `UnprocessableEntityException` — không catch trong service layer
- [ ] Guard đúng: `@UseGuards(AuthGuard('jwt'), RolesGuard)` + `@Roles(RoleEnum.xxx)` cho route cần phân quyền
- [ ] DTO có validator (`class-validator` decorators)
- [ ] Migration tạo rồi kiểm tra SQL trước khi commit

### Testing

- [ ] `cd apps/api && npm run lint` — pass
- [ ] `cd apps/api && npm run test` — pass
- [ ] `cd apps/web && npm run build` — pass (type-check gate)
- [ ] Test thủ công flow ảnh hưởng ở local

### Database

- [ ] Migration đặt tên mô tả rõ ràng: `AddEventBannerUrl`, `CreateWaitlistTable`
- [ ] Không dùng `schema:drop` trên shared DB — chỉ dùng local
- [ ] Sau thay đổi entity: generate migration (`npm run migration:generate -- --name=...`)

### Frontend

- [ ] `'use client'` chỉ khi thật sự cần (event handler, hook)
- [ ] API call qua `lib/api.ts` — không gọi fetch trực tiếp
- [ ] Class Tailwind qua `cn()` — không hardcode hex color
- [ ] Không sửa file trong `components/ui/` — regenerate bằng `npx shadcn-ui@latest add`

---

## 10. Lỗi thường gặp & cách fix

### Port conflict 5432 (PostgreSQL local đang chạy)

**Triệu chứng:** `error: role "root" does not exist` hoặc `Connection refused`

**Fix:**

```bash
# 1. Tạo file .env ở root project:
echo 'DATABASE_PORT=5433
DATABASE_USERNAME=root
DATABASE_PASSWORD=secret
DATABASE_NAME=event_ticket_db' > .env

# 2. Sửa apps/api/.env:
DATABASE_PORT=5433

# 3. Restart postgres container:
docker compose down postgres
docker compose up -d postgres

# 4. Verify:
PGPASSWORD=secret psql -h localhost -p 5433 -U root -d event_ticket_db -c "SELECT 1"
```

### Migration error: "relation does not exist"

```bash
cd apps/api && npm run migration:run
```

### Migration error: "already exists" (stale schema)

```bash
cd apps/api
npm run schema:drop
npm run migration:run
npm run seed:run:relational
```

### Stripe webhook không nhận (local dev)

Cần Stripe CLI để forward webhook:
```bash
stripe listen --forward-to localhost:3000/api/v1/payments/webhook
# Copy STRIPE_WEBHOOK_SECRET từ output vào apps/api/.env
```

### Web không connect được API (CORS / URL sai)

Kiểm tra `apps/web/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Email không gửi được

MailDev phải đang chạy: `docker compose up -d maildev`  
Xem email tại http://localhost:1080

### Organizer không thể tạo event (403)

Tài khoản organizer phải được Admin approve trước:
1. Login admin → http://localhost:3001/admin/organizers/pending
2. Approve organizer account

---

## 11. Conventions cần nhớ

### Backend (NestJS)

| Việc | Cách làm |
|---|---|
| Auth only | `@UseGuards(AuthGuard('jwt'))` |
| Auth + role | `@UseGuards(AuthGuard('jwt'), RolesGuard)` + `@Roles(RoleEnum.xxx)` |
| Business rule vi phạm | `throw new UnprocessableEntityException(...)` |
| Resource không tồn tại | `throw new NotFoundException(...)` |
| Paginated response | Extend `PaginationResponseDto` |
| Domain vs Entity | Domain class = pure TypeScript, không ORM decorator. Entity = `@Entity()` trong `infrastructure/persistence/` |

### Frontend (Next.js)

| Việc | Cách làm |
|---|---|
| API calls | `import { apiClient } from '@/lib/api'` |
| Conditional CSS | `cn()` from `@/lib/utils` |
| Shadcn component mới | `npx shadcn-ui@latest add <component>` |
| Server vs Client | Server Component by default; `'use client'` chỉ khi cần |

### Bảo mật không được quên

- QR integrity: HMAC-SHA256 — không tạo QR tay
- Stripe webhook: luôn verify `Stripe-Signature` header
- RBAC: server-side guard trên **mọi** route có protected data
- Input validation: DTO validator trên **mọi** endpoint
- Không log sensitive data (token, password, card number)

---

## 12. Trace log & debug resources

Project có **3 nguồn log** riêng biệt. Không có log aggregator — tất cả đọc trực tiếp.

---

### 12.1 Application logs (stdout — NestJS Logger)

Mọi `this.logger.log/warn/error/debug(...)` trong service/processor đều ra stdout của container.

**Docker Compose (local dev)**

```bash
# Stream real-time tất cả services
docker compose logs -f

# Chỉ API, giữ 200 dòng cuối
docker compose logs api -f --tail=200

# Filter theo keyword (booking, payment, stripe, expire, error)
docker compose logs api -f | grep -i "error\|warn"
docker compose logs api -f | grep "expiring booking"
docker compose logs api -f | grep "BookingExpiryProcessor\|PaymentsService\|TicketDeliveryProcessor"

# Dump log ra file để share với teammate
docker compose logs api --no-color > /tmp/api-$(date +%Y%m%d-%H%M%S).log
```

**Các prefix log quan trọng cần grep**

| Prefix (Logger context) | Khi nào xuất hiện |
|---|---|
| `[BookingExpiryProcessor]` | Job BullMQ expire booking 15 phút |
| `[BookingsService]` | Tạo booking, cancel, expire |
| `[PaymentsService]` | Stripe webhook nhận, refund, promo exceeded |
| `[TicketDeliveryProcessor]` | Gửi email QR ticket — warn khi booking/customer biến mất |
| `[WaitlistExpiryProcessor]` | Waitlist notification khi inventory released |
| `[AuditLogsService]` | Chỉ error khi ghi audit_log thất bại |

**Ví dụ log thực tế**

```
[BookingExpiryProcessor] expiring booking 3f2a1c...
[PaymentsService] ignoring webhook event charge.updated
[TicketDeliveryProcessor] booking abc123 vanished; skipping delivery   ← WARN
[BookingsService] booking xyz timed out while waiting for refund       ← WARN
```

---

### 12.2 Audit Log table (PostgreSQL)

Ghi nhận mọi sự kiện business quan trọng — bất biến, không xoá được. Truy vấn qua **Adminer** hoặc `psql`.

**Adminer** → http://localhost:8080  
Login: Server = `postgres` · User = `root` · Pass = `secret` · DB = `event_ticket_db`

**psql (CLI)**

```bash
PGPASSWORD=secret psql -h localhost -p 5432 -U root -d event_ticket_db
```

**Các action hiện có trong audit_log**

| action | Ý nghĩa |
|---|---|
| `payment.succeeded` | Stripe webhook xác nhận thanh toán, tickets đã tạo |
| `payment.failed` | Stripe webhook payment_intent.payment_failed |
| `payment.succeeded_after_expiry` | Webhook đến sau booking hết hạn → refund auto |
| `payment.auto_refunded_after_expiry` | Refund đã được trigger tự động |
| `promo.limit_exceeded_at_fulfillment` | Promo vượt maxUses lúc fulfil (race condition) |
| `booking.cancelled` | Customer cancel booking, refund triggered |
| `booking.expired` | BullMQ expire job chạy sau 15 phút không thanh toán |
| `ticket_email.delivery_failed` | Email gửi thất bại sau 3 lần retry |
| `waitlist.notified_expired` | Waitlist entry notified khi slot mở |

**SQL queries hay dùng**

```sql
-- 20 event gần nhất
SELECT action, entity, "entityId", "userId", "createdAt"
FROM audit_log
ORDER BY "createdAt" DESC
LIMIT 20;

-- Trace 1 booking cụ thể (thay UUID)
SELECT action, entity, "entityId", payload, "createdAt"
FROM audit_log
WHERE "entityId" = 'BOOKING_UUID_HERE'
ORDER BY "createdAt";

-- Tất cả payment failures hôm nay
SELECT "entityId", payload, "createdAt"
FROM audit_log
WHERE action = 'payment.failed'
  AND "createdAt" >= CURRENT_DATE;

-- Tất cả auto-refund sau expiry (để check với Stripe)
SELECT "entityId", payload, "createdAt"
FROM audit_log
WHERE action IN ('payment.succeeded_after_expiry', 'payment.auto_refunded_after_expiry')
ORDER BY "createdAt" DESC;

-- Email delivery failures
SELECT "entityId", payload, "createdAt"
FROM audit_log
WHERE action = 'ticket_email.delivery_failed'
ORDER BY "createdAt" DESC;

-- Tất cả activity của 1 user
SELECT action, entity, "entityId", "createdAt"
FROM audit_log
WHERE "userId" = 'USER_UUID_HERE'
ORDER BY "createdAt" DESC;
```

---

### 12.3 BullMQ queue (Redis)

BullMQ dùng Redis. Hai queue hiện có:

| Queue | Job | Trigger |
|---|---|---|
| `booking-expiry` | Expire booking sau 15 phút | Mỗi lần tạo booking mới |
| `ticket-delivery` | Gửi email QR ticket | Stripe `payment_intent.succeeded` |

**Inspect via redis-cli**

```bash
# Connect
docker compose exec redis redis-cli

# Xem tất cả BullMQ queues
KEYS bull:*:meta

# Jobs đang chờ trong queue booking-expiry
LRANGE bull:booking-expiry:wait 0 -1

# Jobs bị fail (retry exhausted)
LRANGE bull:booking-expiry:failed 0 -1
LRANGE bull:ticket-delivery:failed 0 -1

# Chi tiết 1 job (thay JOB_ID)
HGETALL bull:booking-expiry:JOB_ID
HGETALL bull:ticket-delivery:JOB_ID

# Đếm jobs theo trạng thái
LLEN bull:booking-expiry:wait       # đang chờ
LLEN bull:booking-expiry:active     # đang chạy
LLEN bull:booking-expiry:failed     # thất bại
```

**Khi job bị fail liên tục**

1. Kiểm tra log API: `docker compose logs api -f | grep "BookingExpiryProcessor\|TicketDeliveryProcessor"`
2. Kiểm tra job data: `HGETALL bull:<queue>:<jobId>` — xem field `stacktrace` và `data`
3. Job retry: mặc định 3 lần với exponential backoff — nếu vẫn fail sau 3 lần → vào queue `failed`

---

### 12.4 Database trực tiếp (Adminer)

Adminer tại http://localhost:8080 — dùng để query bất kỳ bảng nào, không cần cài psql.

**Các bảng quan trọng để debug**

| Bảng | Debug gì |
|---|---|
| `audit_log` | Business events — xem mục 12.2 |
| `booking` | Trạng thái booking (PENDING_PAYMENT / PAID / EXPIRED / CANCELLED) |
| `payment` | Stripe PaymentIntent, status, stripePaymentIntentId |
| `ticket` | Ticket đã tạo, status (ISSUED / USED / CANCELLED) |
| `ticket_type` | `soldQty`, `reservedQty`, `totalQty` — check oversell |
| `promo_code` | `usedCount` vs `maxUses` |
| `waitlist_entry` | Entries còn active |
| `session` | Active refresh token sessions |

**Query nhanh qua Adminer**

Adminer → chọn DB `event_ticket_db` → tab **SQL command** → paste query.

```sql
-- Kiểm tra inventory consistency (không được vi phạm)
SELECT id, name, "totalQty", "soldQty", "reservedQty",
       ("soldQty" + "reservedQty") AS held,
       ("totalQty" - "soldQty" - "reservedQty") AS available
FROM ticket_type
WHERE "soldQty" + "reservedQty" > "totalQty";   -- phải empty

-- Bookings stuck ở PENDING_PAYMENT quá 15 phút
SELECT id, "customerId", "expiresAt", "createdAt"
FROM booking
WHERE status = 'PENDING_PAYMENT'
  AND "expiresAt" < NOW();

-- Payments chưa có ticket (webhook missed?)
SELECT p.id, p."bookingId", p.status, p."createdAt"
FROM payment p
LEFT JOIN ticket t ON t."bookingId" = p."bookingId"
WHERE p.status = 'PAID' AND t.id IS NULL;
```

---

### 12.5 Email trace (MailDev)

MailDev bắt tất cả email gửi ra trong local dev — không gửi thật ra internet.

**UI:** http://localhost:1080

Dùng để verify:
- Email xác nhận tài khoản nhận được không
- QR ticket email gửi sau thanh toán chưa
- Email hủy event / refund đến customer chưa

Nếu email không xuất hiện trong MailDev → job `ticket-delivery` bị fail → xem redis-cli mục 12.3.

---

### Tóm tắt: bug xuất hiện → trace ở đâu

| Triệu chứng | Trace ở đâu |
|---|---|
| Booking không expire sau 15 phút | Docker logs `BookingExpiryProcessor` + redis `bull:booking-expiry:failed` |
| Thanh toán thành công nhưng không có ticket | AuditLog `payment.succeeded` có không? → `ticket_type` soldQty tăng chưa? → `bull:ticket-delivery:failed` |
| Email QR không gửi được | Docker logs `TicketDeliveryProcessor` + redis `bull:ticket-delivery:failed` + MailDev UI |
| Stripe webhook không nhận | Docker logs `PaymentsService` + cần Stripe CLI forward local |
| Inventory âm / oversell | `ticket_type` query: `soldQty + reservedQty > totalQty` |
| Refund tự động sau expiry | AuditLog actions `payment.auto_refunded_after_expiry` |
| User bị 403 dù đúng role | Check `user.status` = `ACTIVE` + `user.role` trong bảng `user` qua Adminer |
