# Raksha — Collaboration Guidelines & Contract Rule

## 📜 The "Contract Rule"

> **Shared schemas and CAP contracts are interfaces, not implementation details.**
> 
> A producer cannot silently change a shared field.
> Any breaking schema change requires an explicit team discussion, a protocol version bump, and a coordinated integration PR.

---

## 🚫 What You Must NOT Do
- Never rename a field in `packages/schemas/` (e.g. `transactionId` -> `utr`) without prior agreement.
- Never write portal-specific schema variants that bypass canonical `FraudIncident`.
- Never make Portal A or Portal B connect directly to Raksha Core's internal PostgreSQL database; all communication MUST pass through **CAP (Civic Action Protocol)**.
- Never commit unauthenticated secrets or real personal data.

---

## 🌿 Git Branching Model

```text
main
│
├── feature/phase-1-persistence       ← Core persistence & Supabase integration
│
├── feature/portal-a-live-cap         ← Portal A connecting to live CAP REST
│
└── feature/portal-b-events           ← Portal B subscribing to persistent events
```

### Pull Request Rules
1. Always branch from the latest `origin/main`.
2. Ensure `pnpm build`, `pnpm typecheck`, and `pnpm test` pass before opening a PR.
3. Keep PRs focused on a single milestone.
4. Document any new environment variables or endpoints in PR descriptions.
