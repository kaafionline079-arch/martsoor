# Martisoor

Event hosting platform for Martisoor — Expo + TypeScript React Native app.

Local-first demo: events, guests, ticket marketplace, QR check-in, and wallet payouts. No backend APIs.

## Stack

- Expo (React Native)
- TypeScript (`strict`)
- React Navigation
- Zustand (AsyncStorage persistence)
- React Hook Form + Zod
- Reanimated motion system
- Mock JSON under `src/data/`

## Run

```bash
npm install
npm run typecheck
npx expo start
```

## Demo auth

Local-only mock authentication. Passwords are never stored.

- Dev email prefills as `amina@martisoor.com`
- Any password with 6+ characters works

## Scripts

| Command | Purpose |
|---------|---------|
| `npm start` | Expo dev server |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run generate:mock` | Regenerate mock JSON datasets |

## Architecture

```
src/
  components/   UI + shared primitives
  features/     Domain hooks & selectors
  screens/      Route screens by domain
  store/        Zustand stores
  navigation/   Typed stacks + linking
  data/         Local mock JSON
  theme/        Design tokens + motion
  utils/        Logger, errors, formatters
```

## Security notes (demo)

- No real payment gateway or auth provider
- Session + guest/ticket/wallet data persist in AsyncStorage (unencrypted)
- Replace with SecureStore + API auth before production release
- Root `ErrorBoundary` prevents white-screen crashes

## License

Private
