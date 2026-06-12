# Hướng dẫn sử dụng Hệ Thống Quản Lý Vé Sự Kiện

Ứng dụng web full-stack quản lý toàn bộ vòng đời đặt vé sự kiện: tạo sự kiện → đặt vé → thanh toán → check-in bằng QR code.

## Công Nghệ Sử Dụng

| Tầng | Công nghệ |
|---|---|
| Backend | Nest.js + TypeORM + PostgreSQL |
| Frontend | Next.js 15 + Shadcn/UI + Tailwind CSS |
| Hàng đợi | Redis + BullMQ |
| Thanh toán | Stripe (VND, chế độ test) |
| Lưu trữ file | Cloudinary |
| Xác thực | JWT (access 15 phút / refresh 7 ngày) + Google OAuth 2.0 |
| Email | MailDev (dev) / Resend (prod) |
| Triển khai | Docker + GitHub Actions |

---

## Hướng Dẫn Chạy Dự Án

### Yêu Cầu Cài Đặt

- **Docker Desktop** đang chạy
- **Node.js** phiên bản 20 trở lên
- **npm** phiên bản 9 trở lên

---

### Cách A — Docker (Khuyến nghị, đơn giản nhất)

> Chạy toàn bộ hệ thống chỉ với vài lệnh. Không cần cài Node.js hay cấu hình database thủ công.

**Bước 1:** Clone dự án và sao chép file cấu hình môi trường

```bash
git clone <repo-url>
cd event-ticket-system
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

**Bước 2:** Khởi động toàn bộ hệ thống

```bash
docker compose up --build
```

Hệ thống sẽ tự động:
- Khởi động PostgreSQL, Redis, MailDev
- Chạy migration tạo bảng database
- Seed dữ liệu mẫu (tài khoản test, sự kiện mẫu)
- Khởi động API và Web

**Bước 3:** Mở trình duyệt tại http://localhost:3000

---

### Cách B — Chạy Thủ Công (không dùng Docker cho API/Web)

Dùng khi muốn chỉnh sửa code và thấy thay đổi ngay lập tức.

#### 1. Sao chép file cấu hình

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

#### 2. Khởi động hạ tầng (PostgreSQL, Redis, MailDev)

```bash
docker compose up -d postgres redis maildev
```

#### 3. Chạy Backend API

```bash
cd apps/api
npm install
npm run migration:run
npm run seed:run:relational
npm run start:dev
```

#### 4. Chạy Frontend Web (mở terminal mới)

```bash
cd apps/web
npm install
npm run dev
```

---

## Địa Chỉ Truy Cập

| Dịch vụ | URL | Ghi chú |
|---|---|---|
| Web App | http://localhost:3000 | Giao diện chính |
| API (Swagger) | http://localhost:4000/docs | Tài liệu API tự động |
| MailDev | http://localhost:1080 | Xem email gửi ra (đăng ký, xác nhận...) |
| Adminer (DB UI) | http://localhost:8080 | Quản lý database trực quan |

---

## Tài Khoản Test

Tất cả tài khoản đã được xác thực email, sẵn sàng đăng nhập ngay.

| Vai trò | Email | Mật khẩu | Ghi chú |
|---|---|---|---|
| Admin | `admin@example.com` | `secret` | Toàn quyền quản trị hệ thống |
| Khách hàng | `john.doe@example.com` | `secret` | Đặt vé, thanh toán |
| Organizer | `organizer@example.com` | `secret` | Tạo & quản lý sự kiện |
| Staff | `staff1@example.com` | `secret` | Alice — quét QR check-in |
| Staff | `staff2@example.com` | `secret` | Bob — thiết bị quét thứ 2 |

**Thẻ Stripe test:** `4242 4242 4242 4242` · hạn dùng bất kỳ ngày nào trong tương lai · CVV bất kỳ

> **Lưu ý đăng ký tài khoản mới:** Tài khoản mới tạo qua `/register` cần xác nhận email trước khi đăng nhập. Email xác nhận sẽ hiện trong **MailDev tại http://localhost:1080** (không gửi ra hộp thư thật).

---

## Luồng Demo Cơ Bản

### Luồng Khách Hàng Đặt Vé
1. Đăng nhập tài khoản `john.doe@example.com`
2. Vào trang chủ → chọn sự kiện → nhấn **Book**
3. Chọn số lượng vé → xác nhận đặt
4. Thanh toán bằng thẻ test: `4242 4242 4242 4242`
5. Vào **My Tickets** (`/my-tickets`) để xem QR code

### Luồng Check-in
1. Đăng nhập tài khoản `staff1@example.com`
2. Vào `/checkin/[eventId]` → camera mở
3. Quét QR code từ trang **My Tickets** của khách hàng

### Luồng Organizer
1. Đăng nhập tài khoản `organizer@example.com`
2. Vào `/organizer/events` → xem/tạo/chỉnh sửa sự kiện
3. Vào `/organizer/events/[id]/analytics` → xem thống kê doanh thu

---

## Cấu Trúc Dự Án

```
event-ticket-system/
├── apps/
│   ├── api/          — Backend Nest.js (kiến trúc Hexagonal)
│   │   └── src/
│   │       ├── auth/         — JWT + Google OAuth
│   │       ├── users/        — Quản lý người dùng
│   │       ├── events/       — Sự kiện
│   │       ├── tickets/      — Loại vé & vé
│   │       ├── bookings/     — Đặt vé & thanh toán Stripe
│   │       ├── check-in/     — Quét QR, xác thực vé
│   │       ├── waitlist/     — Danh sách chờ
│   │       └── database/     — Migrations, seeds
│   └── web/          — Frontend Next.js 15 (App Router)
│       ├── app/              — Các trang
│       ├── components/       — UI components
│       └── lib/              — API client, utilities
├── docs/
│   ├── SPEC.md               — Đặc tả sản phẩm & tiêu chí nghiệm thu
│   ├── SETUP.md              — Hướng dẫn cài đặt chi tiết & xử lý lỗi
│   ├── ARCHITECTURE.md       — Kiến trúc hệ thống
│   ├── TECH_STACK.md         — Chi tiết công nghệ sử dụng
│   └── DEMO.md               — Hướng dẫn demo & test các tính năng
└── docker-compose.yaml
```

---

## Tài Liệu Tham Khảo

| Tài liệu | Nội dung |
|---|---|
| [docs/SPEC.md](docs/SPEC.md) | Đặc tả sản phẩm — user stories, tiêu chí nghiệm thu, API surface |
| [docs/SETUP.md](docs/SETUP.md) | Hướng dẫn cài đặt chi tiết — prerequisites, các bước cài, xử lý lỗi |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Kiến trúc — các module, schema DB, luồng xác thực, thiết kế queue |
| [docs/TECH_STACK.md](docs/TECH_STACK.md) | Công nghệ — chi tiết framework, thư viện, design patterns |
| [docs/DEMO.md](docs/DEMO.md) | Demo — tài khoản test, danh sách trang UI, luồng test end-to-end |

---

## Nhóm Thực Hiện

KMA — Dự án môn Tốt nghiệp 2(Công nghệ Phần mềm), Học kỳ 2 năm học 2025–2026.
