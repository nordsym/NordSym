# NordSym SoW Module

## Routes
- `/sow/excom`
- `/sow/nakama`
- `/sow/hotclen` (`/sow/hotclean` alias)
- `/sow/lazy-genius` (`/sow/upwork` alias)

## API
- `GET /api/sow/status?customerId=...`
- `POST /api/sow/sign`

## Required Convex Paths
Set these env vars in Vercel for production:
- `MC_CONVEX_URL` (or `CONVEX_URL`)
- `SOW_STATUS_QUERY_PATH` (default: `sow:getStatus`)
- `SOW_GET_QUERY_PATH` (default: `sow:getByCustomerId`)
- `SOW_CREATE_MUTATION_PATH` (default: `sow:create`)
- `SOW_SIGN_MUTATION_PATH` (default: `sow:sign`)
- `SOW_ALLOWED_ORIGINS` (comma-separated, defaults to nordsym domains)

## Notes
- Theme follows site behavior via `localStorage.theme` (`light`/`dark`).
- Headers are normalized to `NordSym X <Customer>`.
- Week 1 checkpoint no longer mentions mandatory video calls.
- 75/25 refund wording removed.
