# Crystal Rose: Cultivate Your Romance — Auto-Farmer

An automated bot for the [Crystal Rose: Cultivate Your Romance](https://crystalrosegame.wildrift.leagueoflegends.com) Wild Rift mini-game. It periodically checks your garden, waters crops, harvests mature flowers, and replants seeds to hit your desired flower counts — all hands-free.

## Features

- Auto-waters, auto-harvests, and auto-plants every 5 seconds
- Buys seeds from the store when stock runs low
- Prioritises planting based on configurable target flower counts
- Supports **multiple accounts** via comma-separated refresh tokens

## Prerequisites

- Node.js 22+, or Docker

## Setup

### 1. Get your `REFRESH_TOKEN`

1. Open [https://crystalrosegame.wildrift.leagueoflegends.com](https://crystalrosegame.wildrift.leagueoflegends.com) in your browser and log in.
2. Open DevTools → **Application** tab → **Cookies** → select `https://xsso.leagueoflegends.com`.
3. Copy the value of the `__Secure-refresh_token` cookie.

> **Multiple accounts:** repeat the steps above in separate browser profiles and join the tokens with commas:
> ```
> REFRESH_TOKEN=token_account1,token_account2,token_account3
> ```

### 2. Configure environment

Create a `.env` file in the project root:

```env
REFRESH_TOKEN=<your_refresh_token_here>
```

## Running

### With Node.js

```bash
npm install
npm run dev        # development (watch mode)
# or
npm run build && npm start   # production
```

### With Docker

```bash
docker build -t cultivate-romance .
docker run -e REFRESH_TOKEN=<your_token> -p 3000:3000 cultivate-romance
```

The server starts on **http://localhost:3000** (configurable via the `PORT` env var).

## Configuration

Edit `config.json` to change API endpoints if needed (normally not required):

| Key | Description |
|-----|-------------|
| `baseUrl` | Crystal Rose game API base URL |
| `refreshUrl` | xSSO token refresh endpoint |
| `referer` / `origin` | Request headers sent with each API call |

Target flower counts and desired seed stock can be adjusted in `src/check.ts` (`desiredFlowerCount`, `DESIRED_SEED_COUNT`).
