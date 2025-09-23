# Room Reservation API

API ini menyediakan manajemen **units**, **rooms**, dan **bookings** dengan autentikasi JWT.  

Base URL:


---

Initial ACCOUNT 
email : superadmin@pln.id
password : superadminpassword

## Table of Contents

- [Authentication](#authentication)
- [Units](#units)
- [Rooms](#rooms)
- [Bookings](#bookings)
- [Notes](#notes)

---

## Authentication

| Endpoint | Method | Body | Response |
|----------|--------|------|----------|
| `/api/auth/register` | POST | `{ "name": "User", "email": "user@example.com", "password": "password123" }` | `201 Created`<br>`{ "message": "User registered successfully", "user": { "name": "User", "email": "user@example.com", "role": "user" } }` |
| `/api/auth/login` | POST | `{ "email": "user@example.com", "password": "password123" }` | `200 OK`<br>`{ "token": "jwt_token_here", "user": { "name": "User", "email": "user@example.com", "role": "user" } }` |

> Gunakan `Authorization: Bearer <token>` untuk semua endpoint yang memerlukan autentikasi.

---

## Units

| Endpoint | Method | Body | Response |
|----------|--------|------|----------|
| `/api/units` | GET | - | `200 OK`<br>`[ { "id": "64f...", "name": "Unit A", "capacity": 20 } ]` |
| `/api/units` | POST | `{ "name": "Unit C", "capacity": 15 }` | `201 Created`<br>`{ "id": "64f...", "name": "Unit C", "capacity": 15 }` |
| `/api/units/:id` | PATCH | `{ "name": "Updated Name", "capacity": 25 }` | `200 OK`<br>`{ "message": "Unit updated successfully" }` |
| `/api/units/:id` | DELETE | - | `200 OK`<br>`{ "message": "Unit deleted successfully" }` |

---

## Rooms

| Endpoint | Method | Body | Response |
|----------|--------|------|----------|
| `/api/rooms` | GET | - | `200 OK`<br>`[ { "id": "64f...", "unitId": "64f...", "name": "Room 1", "capacity": 10 } ]` |
| `/api/rooms` | POST | `{ "unitId": "64f...", "name": "Room 3", "capacity": 8 }` | `201 Created`<br>`{ "id": "64f...", "unitId": "64f...", "name": "Room 3", "capacity": 8 }` |
| `/api/rooms/:id` | PATCH | `{ "name": "Updated Room", "capacity": 12 }` | `200 OK`<br>`{ "message": "Room updated successfully" }` |
| `/api/rooms/:id` | DELETE | - | `200 OK`<br>`{ "message": "Room deleted successfully" }` |

---

## Bookings

| Endpoint | Method | Body | Response |
|----------|--------|------|----------|
| `/api/bookings` | GET | - | `200 OK`<br>`[ { "id": "64f...", "unitId": "64f...", "roomId": "64f...", "date": "2025-09-25", "startTime": "09:00", "endTime": "11:00", "userId": "64f..." } ]` |
| `/api/bookings` | POST | `{ "unitId": "64f...", "roomId": "64f...", "date": "2025-09-25", "startTime": "09:00", "endTime": "11:00" }` | `201 Created`<br>`{ "id": "64f...", "unitId": "64f...", "roomId": "64f...", "date": "2025-09-25", "startTime": "09:00", "endTime": "11:00", "userId": "64f..." }` |
| `/api/bookings/:id` | PATCH | `{ "date": "2025-09-26", "startTime": "10:00" }` | `200 OK`<br>`{ "message": "Booking updated successfully" }` |
| `/api/bookings/:id` | DELETE | - | `200 OK`<br>`{ "message": "Booking deleted successfully" }` |

---

## Notes

- PATCH requests hanya perlu mengirim field yang ingin diubah.
- User hanya bisa mengubah atau menghapus **booking miliknya sendiri**.
- Semua endpoint yang membutuhkan autentikasi harus menggunakan header:
- Pastikan environment variable `.env` sudah di-set pada server/VPS:

MONGODB_URI
JWT_SECRET
DOMAIN_NAME
SUBDOMAIN
DATABASE_NAME


---

## Example curl requests

**Login**
```bash
curl -X POST https://api-pln.agieswahyudi.my.id/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

curl -X POST https://api-pln.agieswahyudi.my.id/api/bookings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"unitId":"64f...","roomId":"64f...","date":"2025-09-25","startTime":"09:00","endTime":"11:00"}'






