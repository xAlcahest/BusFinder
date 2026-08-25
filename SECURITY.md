# Security

## Reporting a vulnerability

Please do not open a public issue for a security problem. Use GitHub's private
vulnerability reporting instead: **Security → Report a vulnerability** on this
repository. It reaches the maintainer only, and the report stays private until
a fix is out.

Include what you can: the affected route or component, how to reproduce it,
and what an attacker gains. A proof of concept against your own instance is
welcome; please do not test against someone else's.

You will get an acknowledgement within a few days. Fixes ship as a normal
release; credit goes in the release notes unless you would rather stay
anonymous.

## What is in scope

- The Next.js app and its API routes under `src/app/api/`
- The device sync endpoint (`/api/sync/[syncId]`) and the client-side crypto
  in `src/lib/sync.ts`
- The ingest and refresh scripts, the Docker image and the deploy tooling

## What is not

- The upstream GTFS feeds from Roma Servizi per la Mobilità, or Nominatim.
  Report those to their operators.
- Denial of service by simply sending a lot of traffic. Rate limits exist,
  but a small VPS is a small VPS.

## Design notes worth knowing before you dig

- There are no accounts and no server-side identity. Sync data is encrypted
  in the browser with a key derived from the sync code, and the server only
  ever stores ciphertext it cannot read. The interesting questions are around
  the derivation, the rate limits, and what a stolen sync code lets you do.
- The static database is opened read-only. The realtime feeds are parsed in
  process from protobuf; the parser is the well-known `gtfs-realtime-bindings`.
- Every value that comes from a URL, a query string or a feed is validated
  before use. If you find one that is not, that is a bug we want to hear about
  even when you cannot turn it into an exploit.
