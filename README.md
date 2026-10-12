# FyerX — Community Events Board

A responsive Next.js App Router project using Material UI and Microsoft SQL Server. It includes the public event board, category/city/text filters, pagination, signup/login with JWT, favourite-category feed, persisted reminders, per-event card designer, and protected admin event management.

## Requirements
- Node.js 20+
- SQL Server (local Developer/Express or hosted instance)
- npm

## Setup
1. Open SQL Server Management Studio and run `sql/schema.sql`. It creates `CommunityEventsBoard`, the tables, indexes, and 15 sample events (active/inactive, past/upcoming, multiple cities/categories).
2. .env file and set your SQL Server credentials and a unique `JWT_SECRET`.
3. Install and run:
   ```bash
   npm install
   npm run dev
   ```
4. Open http://localhost:3000.

## Demo admin
- Email: `admin@fyerx.com`
- Password: `Admin@12345`

Change these in `.env.local` before deployment. The demo admin is configured in environment variables and validated server-side. User/admin APIs verify JWTs server-side. Do not use the fallback JWT secret in production.

## API overview
- `POST /api/auth/signup` — `{name,email,password}`; returns JWT and user.
- `POST /api/auth/login` — `{email,password}`; returns JWT and user.
- `GET /api/events?category=Music&city=Coimbatore&search=night&page=1&limit=8` — active upcoming events, nearest first; filters combine.
- `GET /api/feed` — JWT required; upcoming active events in saved favourite categories.
- `GET /api/favourites`, `PUT /api/favourites` — JWT required; `{categories:["Music","Food"]}`.
- `GET /api/reminders`, `POST /api/reminders` — JWT required; `{eventId,remind:true|false}`.
- `GET /api/card-design?eventId=1`, `PUT /api/card-design` — JWT required; `{eventId,theme,stickers}`.
- `GET /api/admin/events`, `POST /api/admin/events`, `PATCH /api/admin/events` — admin JWT required. PATCH accepts `{id,isActive}`. Events are deactivated, never deleted.

Protected endpoints expect `Authorization: Bearer <token>`. Dates are stored as SQL Server `DATETIME2`; the sample script uses the SQL Server machine's local clock to seed relative dates. For production, align the DB/app timezone policy and add rate limiting, CSRF protections if moving tokens to cookies, and stronger admin credential provisioning.

## Notes
- SQL Server must be reachable from the Node.js process, and the configured `DB_ODBC_DRIVER` (ODBC Driver 18 by default) must be installed. If using SQL Server Express, set `DB_SERVER` to your instance host and ensure TCP/IP is enabled; set `DB_PORT` to the configured TCP port.
- `Remind me` saves a reminder record; it does not send emails/push notifications (not requested).
- Card design is stored per user and event. Stickers are limited to three and can be removed.
