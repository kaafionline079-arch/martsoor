# Security notes for Martisoor (local demo)

## Current posture

- Mock authentication only — passwords are validated for length, never stored.
- Zustand persistence uses AsyncStorage (not encrypted).
- Guest PII, ticket QR payloads, and wallet ledger may remain on-device after logout.
- No network APIs; no payment gateway.

## Before production

1. Replace demo auth with a real identity provider and store tokens in `expo-secure-store`.
2. Encrypt or avoid persisting PII on device; prefer server-side guest/ticket records.
3. Add certificate pinning / HTTPS for any API clients.
4. Wire crash reporting (e.g. Sentry) into `logger.error`.
5. Add ESLint + CI typecheck/tests on every PR.
6. Remove `__DEV__` email prefills from login.

## Deep linking

Scheme: `martisoor://` — protect sensitive routes with auth guards when APIs land.
