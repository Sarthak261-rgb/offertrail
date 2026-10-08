# Development Log: Issues Found and Fixed

This project was built with AI assistance (Claude Code). This log lists problems in the generated code or setup that were caught during review, testing or builds, and how each one was fixed.

| # | Area | Problem | How it was caught | Fix |
|---|---|---|---|---|
| 1 | Styling | Tailwind v4 cannot `@apply` a class defined in `@layer components` (`.btn-primary { @apply btn … }`) | Reviewed against the v4 rules before the first build | The variants no longer `@apply btn`; markup uses `class="btn btn-primary"` |
| 2 | Testing | `mongodb-memory-server` failed with `spawn UNKNOWN` on Windows: the local Application Control policy blocks the downloaded `mongod.exe` | The first test run failed. Running the binary directly showed the policy block | `tests/setup.js` uses `TEST_MONGODB_URI` (for example a MongoDB Atlas cluster) when it is set, and the in-memory server otherwise (CI). Each Vitest worker gets its own database, so test files running in parallel don't wipe each other's data |
| 3 | Testing | A stats fixture placed an application 10 days before a Wednesday, which is a Sunday in the *previous* ISO week, so the weekly-bucket assertion was wrong | Worked through the week boundaries by hand before running | Moved the fixture to 8 days ago and pinned "now" to a fixed date so the buckets are deterministic |
| 4 | React Query | Deleting from the detail page invalidated the deleted item's own query. It refetched, got a 404 and briefly showed "not found" before navigating away | Traced the order of the mutation callbacks: the hook's `onSuccess` runs before the component's | Delete now invalidates the list, board and stats queries but skips detail queries |
| 5 | Routing | After login, `GuestRoute` redirected to `/` before the login page could send the user back to the page they had asked for | Reviewed the redirect flow: setting the user re-renders `GuestRoute` first | `GuestRoute` itself redirects to `location.state.from`, and the login page no longer navigates |
| 6 | Performance | The production bundle was 738 kB; the charting library made up about half of it | A Vite build warning | `React.lazy` loads the Stats page on demand: main bundle 350 kB, Stats chunk 388 kB |
| 7 | Code quality | Form helpers exported from a component file broke React Fast Refresh, and server-error mapping was duplicated in two forms | ESLint `react-refresh/only-export-components` warning, then review | Moved the helpers to `utils/applicationForm.js` and shared `fieldErrorsFrom()` in the API client |
| 8 | Express 5 | `req.query` is a read-only getter in Express 5, so validated and coerced query values can't be written back to it | Known breaking change, handled during design | `validate()` stores parsed values in `req.validated` |
