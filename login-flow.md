# Crystal Rose: Cultivate Your Romance — Game Flow Analysis

## Overview

**Game URL:** https://crystalrosegame.wildrift.leagueoflegends.com/  
**HAR recorded:** 2026-04-22 21:52–21:53 (IANA+7)  
**Total HAR entries:** 337  
**Game backend base URL:** `https://as.api.h5.wildrift.leagueoflegends.com/5c/crystalrose/pub/`

---

## Login Flow

The login uses **OAuth 2.0 Authorization Code with PKCE** through Riot Games' SSO (xSSO), backed by Google as the social identity provider.

### Phase 1 — xSSO → Riot Auth initiation

| Step | Method | URL | Status | Notes |
|------|--------|-----|--------|-------|
| 1 | GET | `xsso.leagueoflegends.com/login` | 302 | Game entry point triggers xSSO login |
| 2 | GET | `auth.riotgames.com/authorize?client_id=prod-xsso-leagueoflegends&scope=openid+account+email+offline_access&code_challenge=...` | 303 | Riot Auth OAuth2 authorization, PKCE code challenge |
| 3 | GET | `authenticate.riotgames.com/login?client_id=...&method=login_state` | 302 | Riot authenticator UI redirect |
| 4 | GET | `authenticate.riotgames.com/?client_id=...` | 200 | Riot login page SPA loads |
| 5 | GET | `authenticate.riotgames.com/api/v1/login` | 200 | Checks current login state (returns existing session if any) |

**Assets loaded:** `rso-authenticator-ui.css`, `rso-authenticator-ui.js`, hCaptcha frames, fonts (Inter, Beaufort).

> Note: The flow hits this initiation sequence **twice** (entries 0–23 and 24–46). The first attempt likely used a stale/expired session; the second continues to the social login.

---

### Phase 2 — Social Login (Google OAuth2)

| Step | Method | URL | Status | Notes |
|------|--------|-----|--------|-------|
| 6 | GET | `authenticate.riotgames.com/login?...&method=riotgames` | 302 | User chose Google sign-in; Riot redirects to Google |
| 7 | GET | `accounts.google.com/o/oauth2/v2/auth?client_id=187685766663-ct6...` | 302 | Google OAuth2 authorization request |
| 8 | GET | `accounts.google.com/v3/signin/accountchooser` | 200 | Google account picker page loads |
| 9 | GET | `accounts.google.com/ServiceLogin` → `InteractiveLogin` → `signin/oauth/consent` | 302→302→302 | Google session check + consent chain |
| 10 | GET | `accounts.google.com/signin/oauth/id` | 200 | Google OAuth ID page (user already consented) |
| 11 | POST | `accounts.google.com/_/OAuthUi/data/batchexecute` | — | Google internal RPC for consent approval |
| 12 | GET | `accounts.google.com/signin/oauth/consent?as=...` | 302 | Consent approved → callback to Riot |

**Google scopes requested:** `userinfo.profile`, `userinfo.email`, `openid`

---

### Phase 3 — Riot Callback & Token Exchange

| Step | Method | URL | Status | Notes |
|------|--------|-----|--------|-------|
| 13 | GET | `authenticate.riotgames.com/redirects/google?state=...&code=...` | 302 | Google delivers auth code to Riot callback |
| 14 | GET | `auth.riotgames.com/login-token?login_token=eyJ...` | 302 | Riot issues a signed login token (JWE/JWT) |
| 15 | GET | `auth.riotgames.com/authorize?client_id=prod-xsso-leagueoflegends&code_challenge=...` | 303 | Riot Auth completes PKCE flow, issues authorization code |
| 16 | GET | `xsso.leagueoflegends.com/redirect?iss=https://auth.riotgames.com&state=...&code=...` | 302 | xSSO receives auth code |
| 17 | GET | `crystalrosegame.wildrift.leagueoflegends.com/` | 200 | **Session established** — xSSO sets cookies, redirects to game |

**Cookies set (Secure, on `xsso.leagueoflegends.com`):**
- `__Secure-access_token`
- `__Secure-id_token`
- `__Secure-refresh_token` (was already present from a previous session)
- `__Secure-session_state`
- `__Secure-session_expiry`
- `__Secure-refresh_token_presence`
- `__Secure-id_hint`
- `language`

---

### Phase 4 — Game Initialization

After the browser lands on the game URL, the SPA loads and establishes a game session using the Riot cookies.

| Step | Method | URL | Notes |
|------|--------|-----|-------|
| 18 | GET | `xsso.leagueoflegends.com/xsso` | xSSO JS library loaded into game page context |
| 19 | GET | `auth.riotgames.com/check-session-iframe` & `xsso.leagueoflegends.com/check-session-iframe` | Silent iframe-based session validity checks |
| 20 | POST | `pub/user?a=save` | **Register/sync user** — sends `createdAt` (Riot account creation timestamp) + `sRegion`. Returns `puuid`, `sOpenId`, `sRoleName`, `iArea`, `ams_serial` |
| 21 | POST | `pub/user?a=login` | **Game login event** — no body params. Returns `{"isLogin": 1}` |
| 22 | POST | `pub/user?a=getSetting` | Load user preferences (music, language) |
| 23 | POST | `pub/home?a=info` | Load home/manor layout (`homeList` with building positions) |
| 24 | POST | `pub/announcement?a=getAll` | Fetch in-game announcements |
| 25 | POST | `pub/user?a=guideConfig` | Load tutorial step text/descriptions |

**Auth mechanism for Game API:** Riot SSO cookies (`__Secure-access_token`, `__Secure-id_token`, etc.) are sent automatically with each cross-origin request to the game backend. No explicit `Authorization` header is used.

---

### Phase 5 — Game Data Load (post-login)

After login APIs return, the game loads the playing field:

| Step | Method | URL | Notes |
|------|--------|-----|-------|
| 26 | POST | `pub/init?a=farm` | Full farm state: `userAssetsMap`, `userInfo` (puuid, level, shareCode, region), seed/item list |
| 27 | POST | `pub/init?a=getBagStoreMissionData` | Shop categories (Seeds, Buildings, etc.), bag contents, mission metadata |
| 28 | POST | `pub/user?a=getGuide` | Current tutorial step state |
| 29 | GET  | `pub/ping?a=unix` | Heartbeat / server time sync (repeated every ~3s) |

---

## Login Flow Diagram (Text)

```
Browser                    xSSO                    Riot Auth              Google               Game API
  |                          |                          |                     |                    |
  |--GET /login------------->|                          |                     |                    |
  |<--302 /authorize---------|                          |                     |                    |
  |--GET /authorize---------------------------------------->|                |                    |
  |<--303 /login (PKCE)----------------------------------|                   |                    |
  |--GET /login (login_state)----------------------------->|                 |                    |
  |<--302 /?client_id=...--------------------------------|                   |                    |
  |--GET /?client_id=...---------------------------------->|                 |                    |
  |   [Riot login SPA loads, hCaptcha]                   |                   |                    |
  |--GET /api/v1/login------------------------------------>|                 |                    |
  |--GET /login (method=riotgames, user clicks Google)--->|                 |                    |
  |<--302 accounts.google.com/o/oauth2/v2/auth-----------|                 |                    |
  |--GET /o/oauth2/v2/auth-------------------------------------------------------------->|        |
  |   [Google account chooser + silent consent chain]                       |                    |
  |<--302 /redirects/google?code=...-----------------------------------------|                  |
  |--GET /redirects/google?code=...------------------------------>|          |                   |
  |<--302 /login-token?login_token=eyJ...--------------------|              |                    |
  |--GET /login-token?login_token=eyJ...------------------------>|          |                    |
  |<--302 /authorize?...(PKCE complete)------------------|                  |                    |
  |--GET /authorize---------------------------------------->|                |                    |
  |<--303 /redirect?code=...--------------------------------|                |                    |
  |--GET /redirect?code=...--------->|                   |                  |                    |
  |<--302 crystalrosegame.com/--------|                  |                  |                    |
  |--GET crystalrosegame.com/         |                  |                  |                    |
  |   [Game SPA loads: JS/CSS/assets] |                  |                  |                    |
  |--GET /xsso----------------------->|                  |                  |                    |
  |--GET /check-session-iframe------->|                  |                  |                    |
  |--POST pub/user?a=save------------------------------------------------------------>|           |
  |--POST pub/user?a=login----------------------------------------------------------->|           |
  |--POST pub/user?a=getSetting------------------------------------------------------>|           |
  |--POST pub/home?a=info------------------------------------------------------------>|           |
  |--POST pub/announcement?a=getAll-------------------------------------------------->|           |
  |--POST pub/user?a=guideConfig----------------------------------------------------->|           |
  |   [Game assets, animations, audio load in parallel]                             |            |
  |--POST pub/init?a=farm------------------------------------------------------------>|           |
  |--POST pub/init?a=getBagStoreMissionData------------------------------------------>|           |
  |--POST pub/user?a=getGuide------------------------------------------------------->|            |
  |   [Game playable]                                                               |            |
```

---

## Key Identifiers

- **puuid:** `8f0fd769-49ce-5972-ab0c-39b027fcdcef` (Riot universal player ID)
- **sOpenId:** `748258265242693220`
- **sRoleName:** `2k%20hater` (Wild Rift summoner name)
- **iArea:** `36126` (region area code)
- **sRegion:** `AS` (Asia)

---

## Todos (next analysis areas)

- [ ] Game action flow (farming, planting, shop, missions)
- [ ] Friend/neighbor visit flow (`pub/home?a=visit`)
- [ ] Mission/reward flow (`pub/mission?a=missionSubmit`, `mainMission`)
- [ ] Shop flow (`pub/shop?a=store`, `buy`, `clickSeedDot`)
