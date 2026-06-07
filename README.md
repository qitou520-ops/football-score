# ScoreHub — Football Live Scores

Professional football live score website built with Next.js 15, API-Football, MySQL, and Redis.

## Tech Stack

- **Next.js 15** (App Router)
- **React 19** + TypeScript
- **Tailwind CSS 4** + Shadcn-style UI components
- **API-Football** for live scores, standings, stats
- **MySQL** (Prisma ORM) for content, ads, affiliates
- **Redis** for API response caching
- **next-intl** for English / Chinese i18n
- **next-themes** for dark mode

## Quick Start

```bash
npm install
docker compose up -d
cp .env.example .env
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Open http://localhost:3000/en or http://localhost:3000/zh

## Admin

- URL: `/admin`
- Default: `admin@scorehub.com` / `admin123`

## Environment

See `.env.example` for all required variables.
