# Hotel Reservation (NestJS + Hex + CQRS)

## Stack
- NestJS, TypeScript, TypeORM (PostgreSQL)
- Redis (lock + keyspace expiry), RabbitMQ (domain events)
- Swagger, class-validator, Global Error Filter

## Features
- Identity: Register/Login + JWT + Roles (HOST/GUEST/ADMIN)
- Rooms: Create/Update/List (RBAC)
- Bookings: Create (PENDING w/ TTL), Confirm, Auto-Expire
- Notifications: Email/SMS stubs + notification_logs
- Consistent Error Model + traceId

## Quickstart
```bash
cp .env.example .env
docker compose up -d  # postgres, redis, rabbitmq
npm i
npx typeorm-ts-node-commonjs migration:run -d src/ormconfig.ts
npm run start:dev
# Swagger: http://localhost:1234/swagger
```
## API
### Auth
```
- POST /auth/register → { access_token }
- POST /auth/login → { access_token }
```
### Rooms (JWT + Roles: HOST/ADMIN)
```
- POST /rooms { name, slotDurationMin }
- PATCH /rooms/:id { name?, slotDurationMin? }
- GET /rooms/my
```
### Bookings (JWT)
```
- POST /bookings { roomId, startAt, slotDurationMin } → { bookingId, expiresIn }
- POST /bookings/confirm { bookingId } → { ok: true }
- GET /rooms/:id/availability?from=&to=&slot=
```
## Error Format
```
{
  "traceId": "uuid",
  "code": "BOOKING.SLOT_TAKEN",
  "message": "این بازه زمانی قبلاً رزرو شده",
  "details": null
}
```
## APP_ARCHITECTURE
### Domain Events
```
- identity.user.registered, identity.user.logged_in
- booking.created, booking.payment_window.started, booking.payment_window.ended,
- booking.confirmed, booking.expired
```
### Architecture
```
- Hexagonal + CQRS (Command/Query + Handler)
- Ports in context (UserRepo, RoomRepo, BookingRepo, LockPort, NotificationPort)
- Cross-cutting Port: EventBusPort (RabbitMQ)
```
### Request Flow (Overview)
```
1) Register/Login: handlers → JWT → publish events → notification
2) Create Room: host-only → save
3) Create Booking: redis lock → insert PENDING → TTL key → events → notify
4) Confirm Booking: check owner/state → CONFIRMED → event → notify
5) Expire: redis keyspace → subscriber → PENDING→EXPIRED → events → notify
```
### Dev Notes
```
- All times in UTC (timestamptz).
- Overlap prevented at DB level: EXCLUDE USING gist (room_id WITH =, tstzrange(start_at,end_at,'[)') WITH &&).
- Use PAYMENT_TTL_SEC for hold TTL (default 900s).
- Consider Cron fallback for expiry if keyspace disabled.
```
### Project Structure (short)
```
src/
  core/
    identity/ ...        # auth/user/role
    room/ ...            # room domain
    booking/ ...         # booking domain
  core/notification/ ... # email/sms/log subscriber
  infrastructure/eventbus/ ... # rabbitmq adapter
  shared/ ...            # error model, event-bus port, guards
  userInterfaces/rest/...# controllers
```
## FLOW
### Register
```
sequenceDiagram
  participant C as Client
  participant API as AuthController
  participant CB as CommandBus
  participant H as RegisterUserHandler
  participant U as UserRepo
  participant J as JwtPort
  participant E as EventBus
  participant N as NotificationSubscriber

  C->>API: POST /auth/register
  API->>CB: RegisterUserCommand
  CB->>H: execute()
  H->>U: findByEmail
  U-->>H: null
  H->>U: save(user)
  H->>J: sign(payload)
  H-->>API: {access_token}
  H->>E: publish(identity.user.registered)
  E-->>N: event
  N->>Email/SMS: send + log
```
### Create Booking + TTL
```
sequenceDiagram
  participant C as Client
  participant API as BookingController
  participant CB as CommandBus
  participant H as CreateBookingHandler
  participant L as Redis Lock
  participant DB as Postgres
  participant R as Redis TTL
  participant E as EventBus
  participant N as Notification

  C->>API: POST /bookings
  API->>CB: CreateBookingCommand
  CB->>H: execute()
  H->>L: SET NX EX lock:room:...
  L-->>H: OK/FAIL
  alt OK
    H->>DB: INSERT bookings (PENDING)
    H->>R: SET EX hold:booking:{id}
    H->>E: publish(booking.created)
    H->>N: sendBookingCreated
    H-->>API: {bookingId, expiresIn}
  else FAIL
    H-->>API: 409 SLOT_TAKEN
  end
```
### Payment Expired
```
sequenceDiagram
  participant R as Redis Keyspace
  participant S as ExpirySubscriber
  participant DB as Postgres
  participant E as EventBus
  participant N as Notification

  R-->>S: expired hold:booking:{id}
  S->>DB: UPDATE bookings SET status='EXPIRED' WHERE id=$id AND status='PENDING'
  S->>E: publish(booking.payment_window.ended & booking.expired)
  S->>N: sendPaymentExpired
```