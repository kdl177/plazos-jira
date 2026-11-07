# Plazos: court deadlines for Jira

A Forge app for law firms that track their cases in Jira. It computes Spanish procedural deadlines (art. 183 LOPJ), writes them to the issue's due date, lets the lawyer confirm or correct them, warns before they expire, and answers questions about them through a Rovo agent.

Built for Codegeist 2026, category Apps for Specialized Industries (legal). Ported from SIMBAI's desktop tool for law firms, whose deadline engine and test cases this app reuses.

## The problem

A procedural deadline in Spain is not "ten days from now". Saturdays, Sundays and holidays do not count. August does not count. Neither does 24 December to 6 January. Unless the matter is urgent, in which case August and Christmas do count. Deadlines in months run date to date, and when the month has no equivalent day they end on its last day. If the result lands on a non-working day it moves to the next working day. Regional and local holidays differ by court. Firms compute this by hand, on paper calendars, and a wrong date can mean a lost case.

## What the app does

- Issue panel "Court deadline": enter the notification date, the amount, the unit (business days, calendar days, months) and whether the matter is urgent. The app proposes the last day of the deadline and sets the Jira due date, so boards, filters and reminders work as usual.
- Confirmation: the proposal stays marked Proposed until the lawyer confirms it, or corrects the date and confirms. Confirmed deadlines never move on their own.
- Project settings "Court holidays": each project keeps its own regional and local holidays. National holidays and Good Friday are built in. Changing the list recomputes every proposed deadline in the project.
- Daily watch: a scheduled trigger comments on the issue when a deadline is 7, 3 or 1 days away, due today, or overdue. One comment per level, never more.
- Rovo agent "Deadline Clerk": "Which court deadlines expire this week?" or "Compute a 20 business-day deadline from a notification received today". The agent never computes dates itself; both answers come from app actions that run the same engine.

## Modules

| Module | Key | Purpose |
|---|---|---|
| `jira:issuePanel` | plazos-panel | Compute, confirm, remove |
| `jira:projectSettingsPage` | plazos-holidays | Regional and local holidays |
| `rovo:agent` + 2 `action` | plazos-agent | compute-deadline, list-deadlines |
| `scheduledTrigger` (day) | plazos-daily | Warning comments |

Scopes: `read:jira-work`, `write:jira-work`, `storage:app`. Data lives in Forge KVS; nothing leaves Atlassian.

## Run it

```shell
pnpm install
pnpm test                     # 11 engine tests, node:test, no extra tooling
pnpm exec forge login
pnpm exec forge register      # assigns the app id in manifest.yml
pnpm exec forge deploy
pnpm exec forge install       # pick Jira and your site
```

## Testing instructions for judges

1. Install the app from the installation link on a Jira site (any company-managed or team-managed software or work management project).
2. Open any issue. The "Court deadline" panel appears in the issue view. Enter 2026-07-24, 10, Business days and press Compute deadline. The proposed date is 2026-09-07: five business days of July and five of September, because August is excluded. The issue's due date now shows the same date.
3. Press Confirm. The lozenge changes to Confirmed.
4. Go to Project settings, "Court holidays", add 2026-04-02 "Maundy Thursday". Create another issue, compute 2 business days from 2026-04-01: the result is 2026-04-07 (Good Friday is built in, Maundy Thursday comes from the project list).
5. Open Rovo chat, pick "Deadline Clerk" and ask "Which court deadlines expire within 60 days?". The table lists both issues with their days left and confirmation state.
6. The daily trigger runs on its own. To see a warning comment at once, set a deadline that is already close, for example 1 calendar day from yesterday, and wait for the next daily run, or check Forge logs.

## Engine rules (src/calendar.js)

- Count starts the day after notification.
- Non-working: Saturday, Sunday, national holidays, Good Friday, project holidays, August, 24 Dec to 6 Jan.
- Urgent matters: only weekends and holidays are excluded.
- Calendar days: add the days, then move to the next working day if needed.
- Months: date to date; no equivalent day means the last day of the month (art. 5 Civil Code); then next working day if needed.

Other jurisdictions are a calendar swap: the engine takes a holiday set and three exclusion rules. Only Spain ships today.
